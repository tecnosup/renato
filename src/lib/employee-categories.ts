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
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ROLE_PRESETS, type EmployeeCategory, type EmployeeCategoryInput } from "@/lib/types";

const COLLECTION = "employeeCategories";

/**
 * Categorias livres de funcionário (Barbeiro, Recepcionista, Caixa, ...). Cada
 * uma aponta para um preset de permissão e marca se é "agendável" (aparece na
 * agenda e como equipe na landing). A landing também lê esta coleção, então a
 * leitura é pública (ver firestore.rules).
 */
export function subscribeToEmployeeCategories(
  callback: (categories: EmployeeCategory[]) => void
): () => void {
  const q = query(collection(db, COLLECTION), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => {
    const list: EmployeeCategory[] = snap.docs.map((d) => {
      const data = d.data();
      const preset = data.preset ?? "barbeiro";
      return {
        id: d.id,
        name: data.name ?? "",
        preset,
        // Legados sem perms próprias caem no preset.
        perms: data.perms ?? ROLE_PRESETS[preset as keyof typeof ROLE_PRESETS],
        bookable: data.bookable ?? false,
        order: data.order ?? 0,
        createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
      };
    });
    callback(list);
  });
}

/** Cria uma categoria. Retorna o id gerado. */
export async function createEmployeeCategory(
  input: EmployeeCategoryInput
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Atualiza uma categoria. Quando `bookable` muda, propaga a flag para os
 * funcionários dessa categoria (o campo é denormalizado em `barbers.bookable`).
 */
export async function updateEmployeeCategory(
  id: string,
  input: Partial<EmployeeCategoryInput>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input });

  if (typeof input.bookable === "boolean") {
    const snap = await getDocs(query(collection(db, "barbers"), where("categoryId", "==", id)));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.update(d.ref, { bookable: input.bookable }));
      await batch.commit();
    }
  }
}

/** Remove uma categoria definitivamente. */
export async function deleteEmployeeCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Persiste a nova ordem (hierarquia) das categorias após arrastar. Grava o
 * índice de cada id na ordem recebida, em lote.
 */
export async function reorderEmployeeCategories(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => batch.update(doc(db, COLLECTION, id), { order: index }));
  await batch.commit();
}
