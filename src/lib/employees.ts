import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Employee, EmployeeInput, EmployeeRole, Permissions } from "@/lib/types";

const COLLECTION = "barbers";

/**
 * Cria o ACESSO (login) de um funcionario ja cadastrado. Chama a API route
 * que usa o Admin SDK (criar usuario pelo client deslogaria o admin atual).
 */
export async function createEmployeeAccess(input: {
  employeeId: string;
  email: string;
  password: string;
  role: EmployeeRole;
  perms: Permissions;
}): Promise<void> {
  const res = await fetch("/api/admin/users/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Não foi possível criar o acesso.");
  }
}

/** Atualiza o acesso (email/senha/permissoes) de um funcionario com login. */
export async function updateEmployeeAccess(input: {
  employeeId: string;
  email?: string;
  password?: string;
  perms?: Permissions;
}): Promise<void> {
  const res = await fetch("/api/admin/users/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Não foi possível atualizar o acesso.");
  }
}

/** Revoga o acesso (remove o login) mantendo o funcionario cadastrado. */
export async function revokeEmployeeAccess(employeeId: string): Promise<void> {
  const res = await fetch("/api/admin/users/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Não foi possível revogar o acesso.");
  }
}

/**
 * Escuta em tempo real os funcionários cadastrados, ordenados por nome.
 * Retorna a função de unsubscribe. Usado pela tela de Funcionários do admin e,
 * no futuro, pelo BookingForm da landing (filtrando apenas os ativos).
 */
export function subscribeToEmployees(
  callback: (employees: Employee[]) => void
): () => void {
  const q = query(collection(db, COLLECTION), orderBy("name", "asc"));

  return onSnapshot(q, (snap) => {
    const list: Employee[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? "",
        role: (data.role as EmployeeRole) ?? "barbeiro",
        phone: data.phone ?? "",
        active: data.active ?? true,
        categoryId: data.categoryId ?? null,
        photoUrl: data.photoUrl ?? null,
        // Fallback legado: sem campo, é agendável se o cargo era "barbeiro".
        bookable: data.bookable ?? (data.role === "barbeiro"),
        createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        // Identidade/acesso — necessario para o card saber se ja tem login.
        authUid: data.authUid ?? null,
        email: data.email ?? null,
        perms: data.perms ?? undefined,
        isOwner: data.isOwner ?? false,
      };
    });
    callback(list);
  });
}

/** Cria um funcionário. Retorna o id gerado. */
export async function createEmployee(input: EmployeeInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Atualiza os dados de um funcionário existente. */
export async function updateEmployee(
  id: string,
  input: Partial<EmployeeInput>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input });
}

/** Remove um funcionário definitivamente. */
export async function deleteEmployee(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Escuta o doc-espelho do PROPRIETÁRIO que também atende como barbeiro
 * (`isOwner == true`). Há no máximo um. Retorna null quando o owner não optou
 * por atender. Usado pelo AuthProvider para resolver o `barberId` do dono (que
 * loga sem custom claims) e pela própria tela de Funcionários.
 */
export function subscribeToOwnerBarber(
  callback: (employee: Employee | null) => void
): () => void {
  const q = query(collection(db, COLLECTION), where("isOwner", "==", true), limit(1));
  return onSnapshot(
    q,
    (snap) => {
      const d = snap.docs[0];
      if (!d) {
        callback(null);
        return;
      }
      const data = d.data();
      callback({
        id: d.id,
        name: data.name ?? "",
        role: (data.role as EmployeeRole) ?? "barbeiro",
        phone: data.phone ?? "",
        active: data.active ?? true,
        categoryId: data.categoryId ?? null,
        photoUrl: data.photoUrl ?? null,
        bookable: data.bookable ?? (data.role === "barbeiro"),
        createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        authUid: data.authUid ?? null,
        email: data.email ?? null,
        perms: data.perms ?? undefined,
        isOwner: true,
      });
    },
    // Falha silenciosa (ex: regra negada para não-owner) — sem barberId de dono.
    () => callback(null)
  );
}

/**
 * Cria (ou atualiza) o doc-espelho do proprietário-barbeiro. Sem login/claims:
 * o owner continua logando sem custom claims; este doc só dá a ele um barberId
 * para agenda e "Meu Financeiro". Passar `ownerDocId` quando já existir.
 */
export async function upsertOwnerBarber(input: {
  ownerDocId?: string | null;
  name: string;
  role: EmployeeRole;
  categoryId: string | null;
  photoUrl: string | null;
  bookable: boolean;
  active: boolean;
}): Promise<string> {
  const payload = {
    name: input.name,
    // owner vê tudo (sem claims); role/perms aqui são só para consistência do doc.
    role: input.role,
    phone: "",
    active: input.active,
    categoryId: input.categoryId,
    photoUrl: input.photoUrl,
    bookable: input.bookable,
    isOwner: true,
  };
  if (input.ownerDocId) {
    await updateDoc(doc(db, COLLECTION, input.ownerDocId), payload);
    return input.ownerDocId;
  }
  const ref = await addDoc(collection(db, COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
