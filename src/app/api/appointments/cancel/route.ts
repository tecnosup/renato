import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/appointments/cancel  { id: string, phone: string }
 *
 * Cancela um agendamento pela area do cliente (chamada PUBLICA). Como a landing
 * é anonima, a operacao roda no servidor com o Admin SDK. Trava de seguranca: só
 * cancela se o telefone informado bater com o do agendamento — assim um cliente
 * não cancela o horario de outro só sabendo o id.
 *
 * Espelha cancelAppointment() de lib/appointments.ts: status "cancelado" libera
 * o slot e a comanda vinculada ainda aberta também é cancelada.
 */
function onlyDigits(s: string): string {
  return (s ?? "").replace(/\D/g, "");
}

export async function POST(req: Request) {
  // Ação destrutiva + a trava é só o telefone (que não é segredo). Limita
  // tentativas por IP para conter cancelamento abusivo em massa.
  const rl = rateLimit(`cancel:${clientKey(req)}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: { id?: string; phone?: string };
  try {
    body = (await req.json()) as { id?: string; phone?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const id = (body.id ?? "").trim();
  const phoneDigits = onlyDigits(body.phone ?? "");
  if (!id || phoneDigits.length < 10) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  try {
    const ref = adminDb.collection("appointments").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }
    // Trava: o telefone tem que bater com o dono do agendamento.
    if (onlyDigits(doc.data()?.customerPhone as string) !== phoneDigits) {
      return NextResponse.json({ error: "Não autorizado a cancelar este agendamento." }, { status: 403 });
    }

    await ref.update({ status: "cancelado" });

    // Cancela a comanda vinculada que ainda estiver aberta (mesma regra do lib).
    const comandas = await adminDb.collection("comandas").where("appointmentId", "==", id).get();
    await Promise.all(
      comandas.docs
        .filter((d) => {
          const st = d.data().status;
          return st === "aberta" || st === "pagamento_pendente";
        })
        .map((d) => d.ref.update({ status: "cancelada", closedAt: FieldValue.serverTimestamp() }))
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Falha ao cancelar agendamento:", err);
    return NextResponse.json({ error: "Não foi possível cancelar o agendamento." }, { status: 500 });
  }
}
