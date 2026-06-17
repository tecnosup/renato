import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Category, CategoryInput, CategoryType, ServiceCategory } from "@/lib/types";

const COLLECTION = "categories";

/**
 * Categorias de serviço legadas (enum) -> id/nome fixos na coleção. Ids
 * previsíveis (`cat-servico-<enum>`) permitem migrar `BarberService.category`
 * para `categoryId` de forma determinística (ver migrateServiceCategories).
 */
const SEED_SERVICE_CATEGORIES: { enumKey: ServiceCategory; name: string }[] = [
  { enumKey: "cabelo", name: "Cabelo" },
  { enumKey: "barba", name: "Barba" },
  { enumKey: "tratamento", name: "Tratamento" },
];

/** Id determinístico da categoria de serviço correspondente ao enum legado. */
export function serviceCategoryId(enumKey: ServiceCategory): string {
  return `cat-servico-${enumKey}`;
}

/**
 * Popula a coleção `categories` com as 3 categorias de serviço legadas —
 * idempotente (usa ids fixos, então reexecutar não duplica). Produtos começam
 * sem categoria; o Renato cria as dele pelo admin. Retorna quantas criou.
 */
export async function seedServiceCategoriesIfEmpty(): Promise<number> {
  let criadas = 0;
  await Promise.all(
    SEED_SERVICE_CATEGORIES.map(async ({ enumKey, name }, index) => {
      const id = serviceCategoryId(enumKey);
      const ref = doc(db, COLLECTION, id);
      const snap = await getDoc(ref);
      if (snap.exists()) return;
      await setDoc(ref, {
        name,
        type: "servico" as CategoryType,
        active: true,
        order: index,
        createdAt: serverTimestamp(),
      });
      criadas += 1;
    })
  );
  return criadas;
}

/**
 * Escuta em tempo real as categorias de um `type` (servico|produto), ordenadas
 * por `order`. Retorna a função de unsubscribe.
 */
export function subscribeToCategories(
  type: CategoryType,
  callback: (categories: Category[]) => void
): () => void {
  // Sem orderBy no Firestore (where + orderBy exigiria índice composto);
  // ordenamos no cliente.
  const q = query(collection(db, COLLECTION), where("type", "==", type));

  return onSnapshot(q, (snap) => {
    const list: Category[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? "",
        type: (data.type as CategoryType) ?? "servico",
        active: data.active ?? true,
        order: data.order ?? 0,
      };
    });
    list.sort((a, b) => a.order - b.order);
    callback(list);
  });
}

/** Cria uma categoria. Retorna o id gerado. */
export async function createCategory(input: CategoryInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Atualiza uma categoria existente. */
export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input });
}

/**
 * Remove uma categoria definitivamente. Itens que a referenciam por
 * `categoryId` ficam "sem categoria" na exibição (tratado na UI/landing como
 * grupo "Outros"). Não apaga em cascata.
 */
export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Migração suave: garante que todo serviço que ainda usa só o enum `category`
 * receba o `categoryId` correspondente (id determinístico do seed). Idempotente
 * — serviços que já têm `categoryId` são ignorados. Roda uma vez ao abrir a
 * tela de Serviços (após o seed das categorias).
 */
export async function migrateServiceCategories(): Promise<number> {
  const snap = await getDocs(collection(db, "services"));
  let migrados = 0;
  await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();
      if (data.categoryId) return; // já migrado
      const enumKey = (data.category as ServiceCategory) ?? "cabelo";
      await updateDoc(doc(db, "services", d.id), {
        categoryId: serviceCategoryId(enumKey),
      });
      migrados += 1;
    })
  );
  return migrados;
}
