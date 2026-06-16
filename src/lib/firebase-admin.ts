import "server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK (servidor). Usado pelas API routes para operacoes
 * privilegiadas: criar usuarios, setar custom claims, escrever no Firestore
 * ignorando as Security Rules. NUNCA importar isto em codigo de cliente.
 *
 * Credencial vem da env FIREBASE_SERVICE_ACCOUNT (JSON em linha unica).
 */

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT ausente. Configure a service account no .env.local."
    );
  }
  return JSON.parse(raw) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };
}

let app: App;

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;
  const sa = getServiceAccount();
  app = initializeApp({
    credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }),
  });
  return app;
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
