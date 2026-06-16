import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { AppointmentInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Status que ocupam o slot (cancelado nao bloqueia).
const ACTIVE = ["pendente", "agendado", "concluido"];

/**
 * Cria um agendamento (chamada PUBLICA, usada pela landing anonima). Faz a
 * checagem de conflito NO SERVIDOR com o Admin SDK — assim a landing nunca
 * precisa LER a colecao `appointments` direto (mantendo dados de clientes
 * privados nas Security Rules).
 */
export async function POST(req: Request) {
  let body: AppointmentInput;
  try {
    body = (await req.json()) as AppointmentInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // Validacao minima (espelha a Security Rule de create).
  const required = [
    "serviceId", "serviceName", "barberId", "barberName", "date", "time", "customerName",
  ] as const;
  for (const f of required) {
    if (!body[f] || typeof body[f] !== "string") {
      return NextResponse.json({ error: `Campo inválido: ${f}.` }, { status: 400 });
    }
  }
  if (typeof body.servicePrice !== "number") {
    return NextResponse.json({ error: "Preço inválido." }, { status: 400 });
  }

  const col = adminDb.collection("appointments");

  try {
    // Anti-conflito no servidor:
    // - barbeiro especifico: bloqueia se ele ja tem agendamento ativo no slot.
    // - "qualquer": bloqueia so se TODOS os barbeiros ativos estiverem ocupados.
    if (body.barberId !== "qualquer") {
      const snap = await col
        .where("date", "==", body.date)
        .where("time", "==", body.time)
        .where("barberId", "==", body.barberId)
        .get();
      const ocupado = snap.docs.some((d) => ACTIVE.includes(d.data().status));
      if (ocupado) {
        return NextResponse.json(
          { error: "Este horário acabou de ser preenchido. Escolha outro." },
          { status: 409 }
        );
      }
    } else {
      const ativos = await adminDb.collection("barbers").where("active", "==", true).get();
      const totalBarbeiros = ativos.size;
      if (totalBarbeiros > 0) {
        const snap = await col
          .where("date", "==", body.date)
          .where("time", "==", body.time)
          .get();
        const ocupados = snap.docs.filter((d) => ACTIVE.includes(d.data().status)).length;
        if (ocupados >= totalBarbeiros) {
          return NextResponse.json(
            { error: "Todos os profissionais estão ocupados neste horário. Escolha outro." },
            { status: 409 }
          );
        }
      }
    }

    const ref = await col.add({
      ...body,
      status: "pendente",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("Falha ao criar agendamento:", err);
    return NextResponse.json({ error: "Não foi possível concluir o agendamento." }, { status: 500 });
  }
}
