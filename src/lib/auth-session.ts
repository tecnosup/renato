import "server-only";
import { jwtVerify, createRemoteJWKSet } from "jose";

export const SESSION_COOKIE_NAME = "__session";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export interface SessionUser {
  uid: string;
  email?: string;
  /** Custom claims setados via Admin SDK (role/perms). Ausente para o proprietario "raiz". */
  role?: string;
  perms?: Record<string, boolean>;
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  if (!projectId) return null;

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    if (!payload.sub) return null;

    return {
      uid: payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      role: typeof payload.role === "string" ? payload.role : undefined,
      perms:
        payload.perms && typeof payload.perms === "object"
          ? (payload.perms as Record<string, boolean>)
          : undefined,
    };
  } catch {
    return null;
  }
}

/** Le o usuario da sessao a partir do cookie httpOnly (uso em API routes/server). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
