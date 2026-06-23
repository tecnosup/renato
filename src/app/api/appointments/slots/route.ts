import { NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { generateSlots, DEFAULT_SCHEDULE } from "@/lib/schedules";
import type { WeeklySchedule, DaySchedule } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/appointments/slots?date=YYYY-MM-DD&barberId=xxx
 *
 * Retorna os slots disponíveis para agendamento na landing.
 * Usa Admin SDK — a landing anônima não precisa ler appointments/schedules/blockedSlots
 * diretamente (mantendo dados de clientes privados nas Security Rules).
 *
 * Lógica em cascata:
 * 1. Pega a config semanal do barbeiro (ou default)
 * 2. Gera os slots do dia pela config
 * 3. Remove bloqueios pontuais (blockedSlots)
 * 4. Remove slots com agendamentos ativos
 * 5. Se barberId === "qualquer", slot só bloqueado quando TODOS os barbeiros estiverem ocupados
 */
export async function GET(req: Request) {
  // Leitura legítima e frequente (navegar datas), mas ainda limita varredura/custo.
  const rl = rateLimit(`slots:${clientKey(req)}`, 40, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const barberId = searchParams.get("barberId");

  if (!date || !barberId) {
    return NextResponse.json({ error: "Parâmetros date e barberId são obrigatórios." }, { status: 400 });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json({ error: "Formato de data inválido. Use YYYY-MM-DD." }, { status: 400 });
  }

  const ACTIVE = ["pendente", "agendado", "concluido"];

  try {
    if (barberId === "qualquer") {
      return await getSlotsQualquer(date, ACTIVE);
    }
    return await getSlotsEspecifico(date, barberId, ACTIVE);
  } catch (err) {
    console.error("Erro ao buscar slots:", err);
    return NextResponse.json({ error: "Não foi possível carregar os horários." }, { status: 500 });
  }
}

async function getDayConfig(barberId: string, dayOfWeek: number): Promise<DaySchedule> {
  const schedDoc = await adminDb.collection("schedules").doc(barberId).get();
  const schedule = schedDoc.exists
    ? (schedDoc.data() as WeeklySchedule)
    : DEFAULT_SCHEDULE;
  return schedule[dayOfWeek] ?? DEFAULT_SCHEDULE[dayOfWeek];
}

async function getBlockedTimes(barberId: string, date: string): Promise<Set<string>> {
  const snap = await adminDb
    .collection("blockedSlots")
    .where("barberId", "==", barberId)
    .where("date", "==", date)
    .get();
  return new Set(snap.docs.map((d: QueryDocumentSnapshot) => d.data().time as string));
}

async function getSlotsEspecifico(date: string, barberId: string, ACTIVE: string[]) {
  const dayOfWeek = new Date(date + "T12:00:00").getDay();
  const dayConfig = await getDayConfig(barberId, dayOfWeek);

  if (!dayConfig.open) {
    return NextResponse.json({ slots: [] });
  }

  const allSlots = generateSlots(dayConfig);

  // Bloqueios pontuais
  const blocked = await getBlockedTimes(barberId, date);

  // Agendamentos ativos
  const apptSnap = await adminDb
    .collection("appointments")
    .where("date", "==", date)
    .where("barberId", "==", barberId)
    .get();
  const booked = new Set(
    apptSnap.docs
      .filter((d: QueryDocumentSnapshot) => ACTIVE.includes(d.data().status as string))
      .map((d: QueryDocumentSnapshot) => d.data().time as string)
  );

  const slots = allSlots.filter((h) => !blocked.has(h) && !booked.has(h));
  return NextResponse.json({ slots });
}

async function getSlotsQualquer(date: string, ACTIVE: string[]) {
  // Pega todos os barbeiros ativos
  const barbersSnap = await adminDb.collection("barbers").where("active", "==", true).get();
  const barbers = barbersSnap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }));

  if (barbers.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  const dayOfWeek = new Date(date + "T12:00:00").getDay();

  // Calcula a união de todos os slots disponíveis entre todos os barbeiros
  // Um slot está disponível se PELO MENOS UM barbeiro está livre nele
  const slotAvailableCount: Record<string, number> = {};

  await Promise.all(
    barbers.map(async (barber: { id: string }) => {
      const dayConfig = await getDayConfig(barber.id, dayOfWeek);
      if (!dayConfig.open) return;

      const allSlots = generateSlots(dayConfig);
      const blocked = await getBlockedTimes(barber.id, date);

      const apptSnap = await adminDb
        .collection("appointments")
        .where("date", "==", date)
        .where("barberId", "==", barber.id)
        .get();
      const booked = new Set(
        apptSnap.docs
          .filter((d: QueryDocumentSnapshot) => ACTIVE.includes(d.data().status as string))
          .map((d: QueryDocumentSnapshot) => d.data().time as string)
      );

      for (const slot of allSlots) {
        if (!blocked.has(slot) && !booked.has(slot)) {
          slotAvailableCount[slot] = (slotAvailableCount[slot] ?? 0) + 1;
        }
      }
    })
  );

  // Retorna slots onde pelo menos 1 barbeiro está disponível, ordenados
  const slots = Object.keys(slotAvailableCount).sort();
  return NextResponse.json({ slots });
}
