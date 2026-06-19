import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { AppointmentInput, ComandaItem } from "@/lib/types";

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
  if (body.items !== undefined && !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Itens inválidos." }, { status: 400 });
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

    // Todo agendamento gera uma comanda "aberta" vinculada (base do sistema de
    // comissão). Os itens vêm do agendamento; quando não há (ex: landing manda
    // só o serviço), monta-se um item de serviço. A comanda é datada no DIA do
    // agendamento, para cair no dia certo da Caixa. Falha aqui NÃO derruba o
    // agendamento — o backfill recupera comandas que faltem.
    try {
      const items: ComandaItem[] = Array.isArray(body.items) && body.items.length > 0
        ? body.items
        : [{ id: `${ref.id}-svc`, tipo: "servico", refId: body.serviceId, nome: body.serviceName, preco: body.servicePrice ?? 0, qtd: 1 }];
      const total = items.reduce((s, i) => s + i.preco * i.qtd, 0);
      await adminDb.collection("comandas").add({
        customerName: body.customerName,
        customerPhone: body.customerPhone ?? "",
        barberId: body.barberId,
        barberName: body.barberName,
        origem: "agendamento",
        appointmentId: ref.id,
        items,
        status: "aberta",
        total,
        createdAt: Timestamp.fromDate(new Date(`${body.date}T${body.time || "12:00"}:00`)),
      });
    } catch (e) {
      console.error("Falha ao gerar comanda do agendamento:", e);
    }

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("Falha ao criar agendamento:", err);
    return NextResponse.json({ error: "Não foi possível concluir o agendamento." }, { status: 500 });
  }
}
