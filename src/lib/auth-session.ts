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
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  if (!projectId) return null;

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    if (!payload.sub) return null;

    return { uid: payload.sub, email: typeof payload.email === "string" ? payload.email : undefined };
  } catch {
    return null;
  }
}
