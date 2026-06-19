import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
} from "@/lib/types";

const COLLECTION = "appointments";

/** Status que ocupam o slot (um cancelado nao bloqueia o horario). */
const ACTIVE_STATUSES: AppointmentStatus[] = ["pendente", "agendado", "concluido"];

/**
 * Verifica se ja existe um agendamento ativo no mesmo dia/horario para o
 * barbeiro escolhido. Usado antes de confirmar (anti-conflito).
 *
 * Obs.: quando o barbeiro e "qualquer" (sem profissional fixo), nao bloqueamos
 * por barbeiro — apenas a combinacao data+hora+barbeiro especifico conta.
 */
export async function checkSlotConflict(
  date: string,
  time: string,
  barberId: string
): Promise<boolean> {
  const q = query(
    collection(db, COLLECTION),
    where("date", "==", date),
    where("time", "==", time),
    where("barberId", "==", barberId)
  );
  const snap = await getDocs(q);
  return snap.docs.some((d) =>
    ACTIVE_STATUSES.includes((d.data().status as AppointmentStatus) ?? "pendente")
  );
}

/**
 * Conta quantos agendamentos ativos existem num mesmo dia/horario (qualquer
 * barbeiro). Usado para a opcao "Qualquer Disponível": o slot so esta cheio
 * quando o numero de agendamentos ativos atinge o numero de barbeiros ativos.
 */
export async function countSlotBookings(date: string, time: string): Promise<number> {
  const q = query(
    collection(db, COLLECTION),
    where("date", "==", date),
    where("time", "==", time)
  );
  const snap = await getDocs(q);
  return snap.docs.filter((d) =>
    ACTIVE_STATUSES.includes((d.data().status as AppointmentStatus) ?? "pendente")
  ).length;
}

/**
 * Cria um agendamento na colecao `appointments`. Sempre nasce com status
 * "pendente". Retorna o id gerado.
 */
export async function createAppointment(input: AppointmentInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    status: "pendente" as AppointmentStatus,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Cancela um agendamento (status "cancelado" libera o slot) e, junto, cancela a
 * comanda vinculada que ainda estiver em aberto (a comanda nasce com o
 * agendamento). Comandas já pagas/canceladas não são tocadas.
 */
export async function cancelAppointment(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { status: "cancelado" as AppointmentStatus });
  const snap = await getDocs(query(collection(db, "comandas"), where("appointmentId", "==", id)));
  await Promise.all(
    snap.docs
      .filter((d) => {
        const st = d.data().status;
        return st === "aberta" || st === "pagamento_pendente";
      })
      .map((d) => updateDoc(doc(db, "comandas", d.id), { status: "cancelada", closedAt: serverTimestamp() }))
  );
}

/** Remarca um agendamento para nova data/horario. */
export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { date, time });
}

function mapAppointment(d: { id: string; data: () => Record<string, unknown> }): Appointment {
  const data = d.data();
  return {
    id: d.id,
    serviceId: (data.serviceId as string) ?? "",
    serviceName: (data.serviceName as string) ?? "",
    servicePrice: (data.servicePrice as number) ?? 0,
    barberId: (data.barberId as string) ?? "",
    barberName: (data.barberName as string) ?? "",
    date: (data.date as string) ?? "",
    time: (data.time as string) ?? "",
    customerName: (data.customerName as string) ?? "",
    customerPhone: (data.customerPhone as string) ?? "",
    origin: (data.origin as Appointment["origin"]) ?? "landing",
    status: (data.status as AppointmentStatus) ?? "pendente",
    createdAt: (data.createdAt as { toMillis?: () => number })?.toMillis?.() ?? Date.now(),
  };
}

/**
 * Escuta os agendamentos recentes vindos da landing (últimos ~14 dias em diante)
 * para a central de notificações do admin. Entrega a lista completa ordenada do
 * mais novo para o mais antigo e, separadamente, avisa quando UM novo chega
 * (após a primeira leitura) — para disparar o toast + som.
 *
 * Filtra por `date >=` (campo único, sem índice composto) e checa `origin` no
 * cliente. Limita a 30 itens.
 */
export function subscribeToRecentLandingAppointments(
  onList: (list: Appointment[]) => void,
  onNew?: (appointment: Appointment) => void
): () => void {
  const desde = new Date();
  desde.setDate(desde.getDate() - 14);
  const desdeStr = `${desde.getFullYear()}-${String(desde.getMonth() + 1).padStart(2, "0")}-${String(desde.getDate()).padStart(2, "0")}`;
  const q = query(collection(db, COLLECTION), where("date", ">=", desdeStr));

  let primeira = true;
  return onSnapshot(q, (snap) => {
    const list = snap.docs
      .map(mapAppointment)
      .filter((a) => a.origin === "landing")
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 30);
    onList(list);

    if (primeira) {
      primeira = false;
      return;
    }
    if (onNew) {
      snap.docChanges().forEach((change) => {
        if (change.type !== "added") return;
        const data = change.doc.data();
        if (data.origin !== "landing") return;
        onNew(mapAppointment(change.doc));
      });
    }
  });
}

/**
 * Escuta em tempo real os agendamentos de um dia (YYYY-MM-DD), ordenados por
 * horario. Retorna a funcao de unsubscribe. Usado pela Agenda do admin.
 *
 * Quando `barberId` e informado, traz APENAS os agendamentos daquele barbeiro
 * (usado para o barbeiro que so pode ver a propria agenda). Sem ele, traz todos.
 */
export function subscribeToDay(
  date: string,
  callback: (appointments: Appointment[]) => void,
  barberId?: string
): () => void {
  const base = [
    collection(db, COLLECTION),
    where("date", "==", date),
  ] as const;
  // Filtra por barbeiro quando aplicavel. orderBy("time") exige indice composto
  // junto do where extra; mantemos ordenacao no cliente quando ha barberId para
  // nao depender de novo indice.
  const q = barberId
    ? query(collection(db, COLLECTION), where("date", "==", date), where("barberId", "==", barberId))
    : query(...base, orderBy("time", "asc"));

  return onSnapshot(q, (snap) => {
    const list: Appointment[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        serviceId: data.serviceId ?? "",
        serviceName: data.serviceName ?? "",
        servicePrice: data.servicePrice ?? 0,
        barberId: data.barberId ?? "",
        barberName: data.barberName ?? "",
        date: data.date ?? "",
        time: data.time ?? "",
        customerName: data.customerName ?? "",
        customerPhone: data.customerPhone ?? "",
        origin: data.origin ?? "landing",
        status: (data.status as AppointmentStatus) ?? "pendente",
        // serverTimestamp ainda pode estar null no instante da escrita local
        createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
      };
    });
    // Quando filtramos por barbeiro nao usamos orderBy (evita indice composto),
    // entao ordenamos por horario aqui.
    if (barberId) list.sort((a, b) => a.time.localeCompare(b.time));
    callback(list);
  });
}

/** Métricas simples de um serviço, agregadas dos agendamentos. */
export interface ServiceStat {
  count: number;     // total de agendamentos (status ativos)
  revenue: number;   // soma de servicePrice (status ativos)
}

/**
 * Escuta em tempo real a contagem/faturamento de agendamentos por serviceId.
 * Para a tela de Serviços (análise simples). Lê a coleção inteira e agrega no
 * cliente — adequado ao volume de uma barbearia; ignora cancelados.
 */
export function subscribeToServiceStats(
  callback: (statsByService: Record<string, ServiceStat>) => void
): () => void {
  const q = query(collection(db, COLLECTION));

  return onSnapshot(q, (snap) => {
    const stats: Record<string, ServiceStat> = {};
    snap.docs.forEach((d) => {
      const data = d.data();
      const status = (data.status as AppointmentStatus) ?? "pendente";
      if (status === "cancelado") return;
      const id = data.serviceId as string | undefined;
      if (!id) return;
      const entry = stats[id] ?? { count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += (data.servicePrice as number) ?? 0;
      stats[id] = entry;
    });
    callback(stats);
  });
}
