import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EmployeeCategory, EmployeeCategoryInput } from "@/lib/types";

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
      return {
        id: d.id,
        name: data.name ?? "",
        preset: data.preset ?? "barbeiro",
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

/** Atualiza uma categoria existente. */
export async function updateEmployeeCategory(
  id: string,
  input: Partial<EmployeeCategoryInput>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input });
}

/** Remove uma categoria definitivamente. */
export async function deleteEmployeeCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
