/**
 * Publica firestore.rules no projeto, usando a service account do .env.local
 * (FIREBASE_SERVICE_ACCOUNT). Evita depender do console ou do firebase CLI.
 *
 * Uso:  node scripts/deploy-rules.mjs           (publica)
 *       node scripts/deploy-rules.mjs --check    (so mostra a regra publicada)
 */
import { readFileSync } from "fs";
import { createSign } from "crypto";

const envLine = readFileSync(".env.local", "utf8")
  .split("\n")
  .find((l) => l.startsWith("FIREBASE_SERVICE_ACCOUNT="));
if (!envLine) {
  console.error("FIREBASE_SERVICE_ACCOUNT ausente no .env.local");
  process.exit(1);
}
const sa = JSON.parse(envLine.replace(/^FIREBASE_SERVICE_ACCOUNT=/, "").replace(/^'/, "").replace(/'$/, ""));
const PID = sa.project_id;
const checkOnly = process.argv.includes("--check");

async function getToken(scope) {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: sa.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const jwt = unsigned + "." + createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const json = await res.json();
  if (!json.access_token) throw new Error("Falha ao obter token: " + JSON.stringify(json));
  return json.access_token;
}

async function getPublished(tok) {
  const rel = await (await fetch(`https://firebaserules.googleapis.com/v1/projects/${PID}/releases`, { headers: { Authorization: `Bearer ${tok}` } })).json();
  const cf = (rel.releases || []).find((r) => r.name.includes("cloud.firestore"));
  if (!cf) return null;
  const ruleset = await (await fetch(`https://firebaserules.googleapis.com/v1/${cf.rulesetName}`, { headers: { Authorization: `Bearer ${tok}` } })).json();
  return ruleset.source?.files?.[0]?.content ?? null;
}

if (checkOnly) {
  const tok = await getToken("https://www.googleapis.com/auth/firebase.readonly");
  console.log(await getPublished(tok));
  process.exit(0);
}

const tok = await getToken("https://www.googleapis.com/auth/firebase");
const H = { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" };
const source = readFileSync("firestore.rules", "utf8");

const rs = await (await fetch(`https://firebaserules.googleapis.com/v1/projects/${PID}/rulesets`, {
  method: "POST", headers: H,
  body: JSON.stringify({ source: { files: [{ name: "firestore.rules", content: source }] } }),
})).json();
if (!rs.name) { console.error("Erro ao criar ruleset:", JSON.stringify(rs)); process.exit(1); }

const rel = await (await fetch(`https://firebaserules.googleapis.com/v1/projects/${PID}/releases/cloud.firestore?updateMask=rulesetName`, {
  method: "PATCH", headers: H,
  body: JSON.stringify({ release: { name: `projects/${PID}/releases/cloud.firestore`, rulesetName: rs.name } }),
})).json();
if (rel.error) { console.error("Erro ao publicar:", JSON.stringify(rel.error)); process.exit(1); }

console.log("Regras publicadas com sucesso ->", rel.rulesetName);
