/**
 * Backfill: cria a comanda "aberta" vinculada para agendamentos ATIVOS que
 * ainda não têm comanda (a geração automática passou a valer só para novos).
 * Usa a service account do .env.local (FIREBASE_SERVICE_ACCOUNT).
 *
 * Uso:  node scripts/backfill-comandas-agendamento.mjs           (cria)
 *       node scripts/backfill-comandas-agendamento.mjs --dry     (só mostra)
 */
import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const dry = process.argv.includes("--dry");

const envLine = readFileSync(".env.local", "utf8")
  .split("\n")
  .find((l) => l.startsWith("FIREBASE_SERVICE_ACCOUNT="));
if (!envLine) {
  console.error("FIREBASE_SERVICE_ACCOUNT ausente no .env.local");
  process.exit(1);
}
const sa = JSON.parse(
  envLine.replace(/^FIREBASE_SERVICE_ACCOUNT=/, "").replace(/^'/, "").replace(/'$/, "")
);

initializeApp({
  credential: cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key }),
});
const db = getFirestore();

const ATIVOS = ["pendente", "agendado", "concluido"];

function montarComanda(a, aptId) {
  const items = Array.isArray(a.items) && a.items.length > 0
    ? a.items
    : [{ id: randomUUID(), tipo: "servico", refId: a.serviceId ?? "servico", nome: a.serviceName ?? "Serviço", preco: a.servicePrice ?? 0, qtd: 1 }];
  const total = items.reduce((s, i) => s + (i.preco ?? 0) * (i.qtd ?? 1), 0);
  return {
    customerName: a.customerName ?? "Cliente",
    customerPhone: a.customerPhone ?? "",
    barberId: a.barberId ?? "",
    barberName: a.barberName ?? "",
    origem: "agendamento",
    appointmentId: aptId,
    items,
    status: "aberta",
    total,
    createdAt: Timestamp.fromDate(new Date(`${a.date}T${a.time || "12:00"}:00`)),
  };
}

const [apptSnap, comSnap] = await Promise.all([
  db.collection("appointments").get(),
  db.collection("comandas").get(),
]);

const jaTemComanda = new Set(
  comSnap.docs.map((d) => d.data().appointmentId).filter(Boolean)
);

let criadas = 0;
let puladosStatus = 0;
let puladosExistente = 0;
for (const d of apptSnap.docs) {
  const a = d.data();
  if (!ATIVOS.includes(a.status)) { puladosStatus++; continue; }
  if (jaTemComanda.has(d.id)) { puladosExistente++; continue; }
  const comanda = montarComanda(a, d.id);
  if (dry) {
    console.log(`[dry] ${a.date} ${a.time} · ${a.customerName} · ${a.barberName} · R$${comanda.total}`);
  } else {
    await db.collection("comandas").add(comanda);
  }
  criadas++;
}

console.log(
  `${dry ? "[dry] " : ""}Comandas ${dry ? "a criar" : "criadas"}: ${criadas} · ` +
  `já tinham: ${puladosExistente} · inativos: ${puladosStatus}`
);
process.exit(0);
