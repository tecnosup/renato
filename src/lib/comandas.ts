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

/** Atualiza dados do cliente, barbeiro e itens de uma comanda de uma vez. */
export async function updateComanda(
  id: string,
  data: {
    customerName: string;
    customerPhone?: string;
    barberId: string;
    barberName: string;
    items: ComandaItem[];
  }
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    customerName: data.customerName,
    customerPhone: data.customerPhone ?? "",
    barberId: data.barberId,
    barberName: data.barberName,
    items: data.items,
    total: calcularTotal(data.items),
  });
}

/**
 * Fecha a comanda (paga), registrando a forma de pagamento. `total` é opcional:
 * quando informado, sobrescreve o valor cobrado (ajuste/desconto na hora de
 * fechar). Sem ele, mantém o total atual (soma dos itens).
 */
export async function pagarComanda(id: string, formaPagamento: string, total?: number): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: "paga" as ComandaStatus,
    formaPagamento,
    ...(total !== undefined ? { total } : {}),
    closedAt: serverTimestamp(),
  });
}

/** Finaliza o serviço sem registrar pagamento (aguarda pagamento no caixa). */
export async function finalizarComanda(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: "pagamento_pendente" as ComandaStatus,
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
 * Escuta as comandas de um barbeiro específico em tempo real (todas as
 * status). Usado na tela de financeiro/comandas do próprio barbeiro.
 */
export function subscribeToMinhasComandas(
  barberId: string,
  callback: (comandas: Comanda[]) => void
): () => void {
  // Só filtra por barberId; ordena no cliente para evitar índice composto
  // (mesmo padrão de subscribeToComandas com status).
  const q = query(collection(db, COLLECTION), where("barberId", "==", barberId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => mapComanda(d.id, d.data()));
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
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

/**
 * Escuta as comandas de UM DIA (por `createdAt`), mais recentes primeiro.
 * `dateKey` = "YYYY-MM-DD". Query escopada por range — não carrega o histórico
 * inteiro (essencial com volume alto). Range + orderBy no mesmo campo não exige
 * índice composto.
 */
export function subscribeToComandasNoDia(
  dateKey: string,
  callback: (comandas: Comanda[]) => void
): () => void {
  const [y, m, d] = dateKey.split("-").map(Number);
  const inicio = new Date(y, m - 1, d, 0, 0, 0, 0);
  const fim = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  const q = query(
    collection(db, COLLECTION),
    where("createdAt", ">=", inicio),
    where("createdAt", "<", fim),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => callback(snap.docs.map((doc) => mapComanda(doc.id, doc.data()))));
}

/**
 * Escuta TODAS as comandas em aberto (aberta + pagamento_pendente), de qualquer
 * dia — elas precisam de ação (fechar) e não podem sumir por serem antigas.
 * Bounded pela quantidade de comandas abertas (poucas em operação normal).
 */
export function subscribeToComandasAbertas(
  callback: (comandas: Comanda[]) => void
): () => void {
  const q = query(collection(db, COLLECTION), where("status", "in", ["aberta", "pagamento_pendente"]));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((doc) => mapComanda(doc.id, doc.data()));
    list.sort((a, b) => b.createdAt - a.createdAt);
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
