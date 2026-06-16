import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
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
 * Escuta em tempo real os agendamentos de um dia (YYYY-MM-DD), ordenados por
 * horario. Retorna a funcao de unsubscribe. Usado pela Agenda do admin.
 */
export function subscribeToDay(
  date: string,
  callback: (appointments: Appointment[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where("date", "==", date),
    orderBy("time", "asc")
  );

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
    callback(list);
  });
}
