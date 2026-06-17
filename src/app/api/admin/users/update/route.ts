import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { EmployeeRole, Permissions } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Proprietario (email == OWNER_EMAIL) ou quem tem gerenciarFuncionarios pode. */
function canManage(user: { email?: string; perms?: Record<string, boolean> }) {
  // Dono-raiz (logado sem custom claims) pode tudo — alinhado ao resto do sistema.
  if (!user.perms) return true;
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  const isOwner = !!ownerEmail && user.email?.toLowerCase() === ownerEmail;
  return isOwner || user.perms.gerenciarFuncionarios === true;
}

interface UpdateBody {
  employeeId: string;
  email?: string;
  password?: string;
  perms?: Permissions;
}

export async function POST(req: Request) {
  const requester = await getSessionUser();
  if (!requester) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!canManage(requester)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  let body: UpdateBody;
  try {
    body = (await req.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { employeeId, email, password, perms } = body;
  if (!employeeId) {
    return NextResponse.json({ error: "employeeId obrigatório." }, { status: 400 });
  }
  if (password !== undefined && password.length < 6) {
    return NextResponse.json({ error: "A senha deve ter ao menos 6 caracteres." }, { status: 400 });
  }

  const empRef = adminDb.collection("barbers").doc(employeeId);
  const empSnap = await empRef.get();
  if (!empSnap.exists) {
    return NextResponse.json({ error: "Funcionário não encontrado." }, { status: 404 });
  }
  const authUid = empSnap.data()?.authUid as string | undefined;
  if (!authUid) {
    return NextResponse.json({ error: "Este funcionário não possui acesso." }, { status: 409 });
  }

  try {
    // 1) Atualiza email/senha no Auth (se enviados).
    const authUpdate: { email?: string; password?: string } = {};
    if (email) authUpdate.email = email;
    if (password) authUpdate.password = password;
    if (Object.keys(authUpdate).length > 0) {
      await adminAuth.updateUser(authUid, authUpdate);
    }

    // 2) Atualiza permissoes (claims). barberId = ID do doc (employeeId), que e
    // o que os agendamentos usam — mantem o escopo de dados consistente.
    const docUpdate: Record<string, unknown> = {};
    if (perms) {
      const role = (empSnap.data()?.role as EmployeeRole) ?? "barbeiro";
      await adminAuth.setCustomUserClaims(authUid, { role, barberId: employeeId, perms });
      docUpdate.perms = perms;
    }
    if (email) docUpdate.email = email;
    if (Object.keys(docUpdate).length > 0) {
      await empRef.update(docUpdate);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "auth/email-already-exists") {
      return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 409 });
    }
    if (code === "auth/invalid-email") {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    console.error("Falha ao atualizar acesso:", err);
    return NextResponse.json({ error: "Não foi possível atualizar o acesso." }, { status: 500 });
  }
}
