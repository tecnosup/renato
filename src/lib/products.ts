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
import type { Product, ProductInput } from "@/lib/types";

const COLLECTION = "products";

/**
 * Catálogo inicial de produtos (migrado do hardcoded do OrbCarousel). Usado
 * apenas como fonte do seed. `cost`/`stock` recebem valores iniciais — o Renato
 * ajusta depois no cadastro.
 */
const SEED_PRODUCTS: Omit<ProductInput, "order">[] = [
  {
    name: "Pomada Matte Século XXI",
    price: 65,
    cost: 30,
    stock: 0,
    volume: "100g",
    description:
      "Fixação extra-forte de longa duração com efeito matte de toque seco absoluto. Elaborada com argilas e ceras de abelha naturais.",
    active: true,
  },
  {
    name: "Balm Nutritivo Real",
    price: 55,
    cost: 24,
    stock: 0,
    volume: "80ml",
    description:
      "Fórmula hidratante biológica que combate coceiras, estimula o bulbo, protege de raios UV e alinha os fios sem pesar.",
    active: true,
  },
  {
    name: "Shampoo Fortificante Ativo",
    price: 75,
    cost: 35,
    stock: 0,
    volume: "250ml",
    description:
      "Antiqueda enriquecido com cafeína anidra, mentol criogênico de estimulação sanguínea e biotina concentrada de absorção rápida.",
    active: true,
  },
];

/**
 * Popula a coleção `products` com o catálogo inicial — uma única vez.
 * Idempotente: se já houver qualquer produto, não faz nada. Pensado para um
 * botão "popular catálogo inicial" na tela de Produtos. Requer permissão
 * gerenciarCadastros (a escrita passa pelas Firestore Rules).
 * Retorna a quantidade criada (0 se já havia dados).
 */
export async function seedProductsIfEmpty(): Promise<number> {
  const snap = await getDocs(collection(db, COLLECTION));
  if (!snap.empty) return 0;

  await Promise.all(
    SEED_PRODUCTS.map((p, index) =>
      addDoc(collection(db, COLLECTION), {
        ...p,
        order: index,
        createdAt: serverTimestamp(),
      })
    )
  );
  return SEED_PRODUCTS.length;
}

/**
 * Escuta em tempo real os produtos cadastrados, ordenados por `order`.
 * Retorna a função de unsubscribe. Usado pela tela de Produtos do admin e pela
 * vitrine da landing (OrbCarousel), que filtra apenas os ativos.
 */
export function subscribeToProducts(
  callback: (products: Product[]) => void
): () => void {
  const q = query(collection(db, COLLECTION), orderBy("order", "asc"));

  return onSnapshot(q, (snap) => {
    const list: Product[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? "",
        price: data.price ?? 0,
        cost: data.cost ?? 0,
        stock: data.stock ?? 0,
        volume: data.volume ?? "",
        description: data.description ?? "",
        active: data.active ?? true,
        order: data.order ?? 0,
        imageUrl: data.imageUrl ?? undefined,
      };
    });
    callback(list);
  });
}

/** Cria um produto. Retorna o id gerado. */
export async function createProduct(input: ProductInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Atualiza um produto existente. */
export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input });
}

/**
 * Soft delete: marca o produto como inativo (some da vitrine). Preserva o
 * documento para a futura referência em comandas (vendas passadas).
 */
export async function deactivateProduct(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { active: false });
}

/** Reativa um produto inativo. */
export async function activateProduct(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { active: true });
}

/**
 * Troca o campo `order` entre dois produtos (reordenação por setas no admin).
 * A ordem reflete diretamente na vitrine da landing.
 */
export async function swapProductOrder(
  a: { id: string; order: number },
  b: { id: string; order: number }
): Promise<void> {
  await Promise.all([
    updateDoc(doc(db, COLLECTION, a.id), { order: b.order }),
    updateDoc(doc(db, COLLECTION, b.id), { order: a.order }),
  ]);
}

/** Remove um produto definitivamente. Use com cautela (prefira deactivate). */
export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
