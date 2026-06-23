import { NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { Appointment, AppointmentStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/appointments/by-phone  { phone: string }
 *
 * Retorna os agendamentos de um cliente (chamada PUBLICA, usada pela area do
 * cliente na landing). Lê via Admin SDK — a landing anonima nunca lê a colecao
 * `appointments` direto (dados de clientes ficam privados nas Security Rules),
 * seguindo o mesmo padrao de /api/appointments/slots e /create.
 *
 * O telefone é normalizado para só dígitos dos dois lados, porque a landing
 * salva formatado "(11) 99999-9999" mas a comparacao deve ignorar formatacao.
 */
function onlyDigits(s: string): string {
  return (s ?? "").replace(/\D/g, "");
}

export async function POST(req: Request) {
  let body: { phone?: string };
  try {
    body = (await req.json()) as { phone?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const phoneDigits = onlyDigits(body.phone ?? "");
  if (phoneDigits.length < 10) {
    return NextResponse.json({ error: "Telefone inválido." }, { status: 400 });
  }

  try {
    // Firestore não tem "contains/normaliza", então lemos os agendamentos da
    // landing recentes e filtramos por telefone normalizado no servidor. O
    // volume de uma barbearia é baixo; limitamos a janela a partir de ~90 dias.
    const desde = new Date();
    desde.setDate(desde.getDate() - 90);
    const desdeStr = `${desde.getFullYear()}-${String(desde.getMonth() + 1).padStart(2, "0")}-${String(desde.getDate()).padStart(2, "0")}`;

    const snap = await adminDb
      .collection("appointments")
      .where("date", ">=", desdeStr)
      .get();

    const list: Appointment[] = snap.docs
      .filter((d: QueryDocumentSnapshot) => onlyDigits(d.data().customerPhone as string) === phoneDigits)
      .map((d: QueryDocumentSnapshot) => {
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
      })
      // Mais recentes primeiro (por data + horário).
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

    return NextResponse.json({ appointments: list });
  } catch (err) {
    console.error("Falha ao buscar agendamentos por telefone:", err);
    return NextResponse.json({ error: "Não foi possível carregar seus agendamentos." }, { status: 500 });
  }
}
