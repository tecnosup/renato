import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SERVICES } from "@/lib/data";
import { serviceCategoryId } from "@/lib/categories";
import type { BarberService, ServiceCategory, ServiceInput } from "@/lib/types";

const COLLECTION = "services";

/**
 * Popula a coleção `services` com o catálogo legado de `data.ts` — uma única
 * vez. Idempotente: se já houver qualquer serviço, não faz nada. Pensado para
 * um botão "popular catálogo inicial" na tela de Serviços. Requer permissão
 * gerenciarCadastros (a escrita passa pelas Firestore Rules).
 * Retorna a quantidade criada (0 se já havia dados).
 */
export async function seedServicesIfEmpty(): Promise<number> {
  const snap = await getDocs(collection(db, COLLECTION));
  if (!snap.empty) return 0;

  await Promise.all(
    SERVICES.map((s, index) =>
      addDoc(collection(db, COLLECTION), {
        name: s.name,
        price: s.price,
        duration: s.duration,
        description: s.description,
        category: s.category,
        // Grava o categoryId determinístico já no seed (a migração vira só
        // fallback para serviços antigos sem o campo). Evita depender da ordem
        // seed -> migração na tela.
        categoryId: serviceCategoryId(s.category),
        active: true,
        order: index,
        createdAt: serverTimestamp(),
      })
    )
  );
  return SERVICES.length;
}

/**
 * Escuta em tempo real os serviços cadastrados, ordenados por `order`.
 * Retorna a função de unsubscribe. Usado pela tela de Serviços do admin e
 * pela landing (BookingForm/OrbCarousel), que filtra apenas os ativos.
 */
export function subscribeToServices(
  callback: (services: BarberService[]) => void
): () => void {
  const q = query(collection(db, COLLECTION), orderBy("order", "asc"));

  return onSnapshot(q, (snap) => {
    const list: BarberService[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? "",
        price: data.price ?? 0,
        duration: data.duration ?? 30,
        description: data.description ?? "",
        category: (data.category as ServiceCategory) ?? "cabelo",
        active: data.active ?? true,
        order: data.order ?? 0,
        imageUrl: data.imageUrl ?? undefined,
      };
    });
    callback(list);
  });
}

/** Cria um serviço. Retorna o id gerado. */
export async function createService(input: ServiceInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Atualiza um serviço existente. */
export async function updateService(
  id: string,
  input: Partial<ServiceInput>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input });
}

/**
 * Soft delete: marca o serviço como inativo, preservando o histórico de
 * agendamentos que o referenciam (serviceId/serviceName ficam válidos).
 */
export async function deactivateService(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { active: false });
}

/** Reativa um serviço inativo. */
export async function activateService(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { active: true });
}

/**
 * Troca o campo `order` entre dois serviços (reordenação por setas no admin).
 * A ordem reflete diretamente na vitrine/agendamento da landing.
 */
export async function swapServiceOrder(
  a: { id: string; order: number },
  b: { id: string; order: number }
): Promise<void> {
  await Promise.all([
    updateDoc(doc(db, COLLECTION, a.id), { order: b.order }),
    updateDoc(doc(db, COLLECTION, b.id), { order: a.order }),
  ]);
}

/** Remove um serviço definitivamente. Use com cautela (prefira deactivate). */
export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
