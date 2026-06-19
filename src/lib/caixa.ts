import { collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION = "caixas";

export type Despesa = { id: string; descricao: string; valor: number };
export type CaixaStatus = "fechado" | "aberto" | "pendente";

/**
 * Documento de caixa de um dia (coleção `caixas`, id = "YYYY-MM-DD"). `status`
 * só é gravado quando o dia é explicitamente fechado/reaberto — dias sem doc, ou
 * com doc só de despesas, têm o status DERIVADO na UI (hoje = aberto, passado =
 * pendente). Por isso `status` é opcional aqui.
 */
export type DiaCaixaDoc = { despesas: Despesa[]; status?: "fechado" | "aberto" };

/** Escuta todos os caixas (um doc por dia). Volume pequeno (1/dia). */
export function subscribeToCaixas(
  callback: (caixas: Record<string, DiaCaixaDoc>) => void
): () => void {
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const map: Record<string, DiaCaixaDoc> = {};
    snap.docs.forEach((d) => {
      const data = d.data();
      map[d.id] = {
        despesas: (data.despesas as Despesa[]) ?? [],
        status: data.status as "fechado" | "aberto" | undefined,
      };
    });
    callback(map);
  });
}

/** Salva (merge) as despesas do dia. */
export async function salvarDespesasCaixa(dateKey: string, despesas: Despesa[]): Promise<void> {
  await setDoc(doc(db, COLLECTION, dateKey), { despesas }, { merge: true });
}

/** Fecha o caixa do dia (status "fechado" + carimbo). */
export async function fecharCaixaDia(dateKey: string): Promise<void> {
  await setDoc(doc(db, COLLECTION, dateKey), { status: "fechado", closedAt: serverTimestamp() }, { merge: true });
}

/** Reabre o caixa do dia (volta para "aberto"). */
export async function reabrirCaixaDia(dateKey: string): Promise<void> {
  await setDoc(doc(db, COLLECTION, dateKey), { status: "aberto", closedAt: null }, { merge: true });
}
