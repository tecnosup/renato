import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION = "waitlist";

/** Item da lista de espera (coleção `waitlist`). */
export interface WaitlistEntry {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName?: string;
  barberId?: string;
  createdAt: number; // epoch ms
}

export interface WaitlistInput {
  customerName: string;
  customerPhone: string;
  serviceName?: string;
  barberId?: string;
}

/** Adiciona um cliente à fila de espera. */
export async function addToWaitlist(input: WaitlistInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Remove um cliente da fila (ao chamar ou descartar). */
export async function removeFromWaitlist(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Escuta a fila de espera em tempo real, ordenada por chegada (mais antigo
 * primeiro). Retorna a função de unsubscribe.
 */
export function subscribeToWaitlist(callback: (entries: WaitlistEntry[]) => void): () => void {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const list: WaitlistEntry[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        customerName: data.customerName ?? "",
        customerPhone: data.customerPhone ?? "",
        serviceName: data.serviceName ?? "",
        barberId: data.barberId ?? "",
        createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
      };
    });
    callback(list);
  });
}
