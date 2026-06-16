import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionUser } from "@/lib/auth-session";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function canManage(user: { email?: string; perms?: Record<string, boolean> }) {
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  const isOwner = !!ownerEmail && user.email?.toLowerCase() === ownerEmail;
  return isOwner || user.perms?.gerenciarFuncionarios === true;
}

interface RevokeBody {
  employeeId: string;
}

export async function POST(req: Request) {
  const requester = await getSessionUser();
  if (!requester) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!canManage(requester)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  let body: RevokeBody;
  try {
    body = (await req.json()) as RevokeBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.employeeId) {
    return NextResponse.json({ error: "employeeId obrigatório." }, { status: 400 });
  }

  const empRef = adminDb.collection("barbers").doc(body.employeeId);
  const empSnap = await empRef.get();
  if (!empSnap.exists) {
    return NextResponse.json({ error: "Funcionário não encontrado." }, { status: 404 });
  }
  const authUid = empSnap.data()?.authUid as string | undefined;
  if (!authUid) {
    return NextResponse.json({ error: "Este funcionário não possui acesso." }, { status: 409 });
  }

  try {
    // Remove o login do Auth. Se o usuario ja nao existir la, segue limpando o doc.
    try {
      await adminAuth.deleteUser(authUid);
    } catch (e) {
      if ((e as { code?: string })?.code !== "auth/user-not-found") throw e;
    }

    // Mantem o funcionario cadastrado (agenda), mas sem acesso.
    await empRef.update({
      authUid: FieldValue.delete(),
      email: FieldValue.delete(),
      perms: FieldValue.delete(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Falha ao revogar acesso:", err);
    return NextResponse.json({ error: "Não foi possível revogar o acesso." }, { status: 500 });
  }
}
