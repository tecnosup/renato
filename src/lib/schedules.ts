import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { WeeklySchedule, BlockedSlot, DaySchedule } from "@/lib/types";

// ─── Defaults ───────────────────────────────────────────────────────────────

/** Grade padrão usada quando o barbeiro ainda não configurou a sua. */
export const DEFAULT_DAY: DaySchedule = {
  open: true,
  start: "09:00",
  end: "18:00",
};

export const DEFAULT_SCHEDULE: WeeklySchedule = {
  0: { open: false, start: "09:00", end: "18:00" }, // Dom: fechado
  1: { ...DEFAULT_DAY },
  2: { ...DEFAULT_DAY },
  3: { ...DEFAULT_DAY },
  4: { ...DEFAULT_DAY },
  5: { ...DEFAULT_DAY },
  6: { open: true, start: "09:00", end: "14:00" }, // Sáb: horário reduzido
};

// ─── Geração de slots ────────────────────────────────────────────────────────

/** Converte "HH:mm" em minutos desde meia-noite. */
function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Converte minutos desde meia-noite em "HH:mm". */
function fromMin(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/**
 * Gera os slots de 30 em 30 minutos para um DaySchedule.
 * Exclui a janela de almoço (breakStart–breakEnd) quando configurada.
 */
export function generateSlots(day: DaySchedule): string[] {
  if (!day.open) return [];

  const start = toMin(day.start);
  const end = toMin(day.end);
  const breakStart = day.breakStart ? toMin(day.breakStart) : null;
  const breakEnd = day.breakEnd ? toMin(day.breakEnd) : null;

  const slots: string[] = [];
  for (let t = start; t < end; t += 30) {
    if (breakStart !== null && breakEnd !== null && t >= breakStart && t < breakEnd) continue;
    slots.push(fromMin(t));
  }
  return slots;
}

// ─── Firestore: schedules ────────────────────────────────────────────────────

/** Busca a grade semanal de um barbeiro. Retorna o default se não existir. */
export async function getSchedule(barberId: string): Promise<WeeklySchedule> {
  const snap = await getDoc(doc(db, "schedules", barberId));
  if (!snap.exists()) return { ...DEFAULT_SCHEDULE };
  return snap.data() as WeeklySchedule;
}

/** Salva a grade semanal de um barbeiro (sobrescreve o documento inteiro). */
export async function saveSchedule(barberId: string, schedule: WeeklySchedule): Promise<void> {
  await setDoc(doc(db, "schedules", barberId), schedule);
}

/**
 * Escuta a grade semanal de um barbeiro em tempo real.
 * Retorna o default se o documento ainda não existir.
 */
export function subscribeToSchedule(
  barberId: string,
  callback: (schedule: WeeklySchedule) => void
): () => void {
  return onSnapshot(doc(db, "schedules", barberId), (snap) => {
    callback(snap.exists() ? (snap.data() as WeeklySchedule) : { ...DEFAULT_SCHEDULE });
  });
}

// ─── Firestore: blockedSlots ─────────────────────────────────────────────────

/** Bloqueia um slot pontual (cria documento na coleção blockedSlots). */
export async function blockSlot(barberId: string, date: string, time: string): Promise<void> {
  const id = `${barberId}_${date}_${time.replace(":", "")}`;
  await setDoc(doc(db, "blockedSlots", id), { barberId, date, time });
}

/** Remove um bloqueio pontual. */
export async function unblockSlot(barberId: string, date: string, time: string): Promise<void> {
  const id = `${barberId}_${date}_${time.replace(":", "")}`;
  await deleteDoc(doc(db, "blockedSlots", id));
}

/** Busca todos os slots bloqueados de um barbeiro em uma data. */
export async function getBlockedSlots(barberId: string, date: string): Promise<string[]> {
  const q = query(
    collection(db, "blockedSlots"),
    where("barberId", "==", barberId),
    where("date", "==", date)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().time as string);
}

/**
 * Escuta em tempo real os slots bloqueados de um barbeiro em uma data.
 * Retorna função de unsubscribe.
 */
export function subscribeToBlockedSlots(
  barberId: string,
  date: string,
  callback: (blockedTimes: string[]) => void
): () => void {
  const q = query(
    collection(db, "blockedSlots"),
    where("barberId", "==", barberId),
    where("date", "==", date)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data().time as string));
  });
}

/** Bloqueia todos os slots de um dia inteiro para um barbeiro. */
export async function blockFullDay(
  barberId: string,
  date: string,
  schedule: WeeklySchedule
): Promise<void> {
  const dayOfWeek = new Date(date + "T12:00:00").getDay();
  const dayConfig = schedule[dayOfWeek] ?? DEFAULT_SCHEDULE[dayOfWeek];
  const slots = generateSlots(dayConfig);
  await Promise.all(slots.map((time) => blockSlot(barberId, date, time)));
}

/** Remove todos os bloqueios de um dia inteiro para um barbeiro. */
export async function unblockFullDay(barberId: string, date: string): Promise<void> {
  const q = query(
    collection(db, "blockedSlots"),
    where("barberId", "==", barberId),
    where("date", "==", date)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
