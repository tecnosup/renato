import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Comanda, ComandaInput, ComandaItem, ComandaStatus } from "@/lib/types";

const COLLECTION = "comandas";

/** Soma o total dos itens (preço × quantidade). */
export function calcularTotal(items: ComandaItem[]): number {
  return items.reduce((acc, it) => acc + it.preco * it.qtd, 0);
}

function mapComanda(id: string, data: Record<string, unknown>): Comanda {
  return {
    id,
    customerName: (data.customerName as string) ?? "",
    customerPhone: (data.customerPhone as string) ?? "",
    barberId: (data.barberId as string) ?? "",
    barberName: (data.barberName as string) ?? "",
    origem: (data.origem as Comanda["origem"]) ?? "avulsa",
    appointmentId: (data.appointmentId as string) ?? undefined,
    items: (data.items as ComandaItem[]) ?? [],
    status: (data.status as ComandaStatus) ?? "aberta",
    total: (data.total as number) ?? 0,
    createdAt: (data.createdAt as { toMillis?: () => number })?.toMillis?.() ?? Date.now(),
    closedAt: (data.closedAt as { toMillis?: () => number })?.toMillis?.() ?? undefined,
    formaPagamento: (data.formaPagamento as string) ?? undefined,
  };
}

/** Cria uma comanda aberta. Retorna o id gerado. */
export async function createComanda(input: ComandaInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    customerPhone: input.customerPhone ?? "",
    appointmentId: input.appointmentId ?? null,
    status: "aberta" as ComandaStatus,
    total: calcularTotal(input.items),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Atualiza os itens de uma comanda e recalcula o total. */
export async function updateComandaItems(id: string, items: ComandaItem[]): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { items, total: calcularTotal(items) });
}

/** Fecha a comanda (paga), registrando a forma de pagamento. */
export async function pagarComanda(id: string, formaPagamento: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: "paga" as ComandaStatus,
    formaPagamento,
    closedAt: serverTimestamp(),
  });
}

/** Cancela a comanda. */
export async function cancelarComanda(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: "cancelada" as ComandaStatus,
    closedAt: serverTimestamp(),
  });
}

/**
 * Escuta as comandas em tempo real, mais recentes primeiro. `status` filtra
 * (ex: só "aberta"); sem ele traz todas.
 */
export function subscribeToComandas(
  callback: (comandas: Comanda[]) => void,
  status?: ComandaStatus
): () => void {
  const q = status
    ? query(collection(db, COLLECTION), where("status", "==", status))
    : query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => mapComanda(d.id, d.data()));
    // Quando filtramos por status não usamos orderBy (evita índice composto);
    // ordenamos no cliente.
    if (status) list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  });
}

/** Escuta uma comanda específica em tempo real. */
export function subscribeToComanda(
  id: string,
  callback: (comanda: Comanda | null) => void
): () => void {
  return onSnapshot(doc(db, COLLECTION, id), (snap) => {
    callback(snap.exists() ? mapComanda(snap.id, snap.data()) : null);
  });
}
