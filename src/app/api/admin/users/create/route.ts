import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { ROLE_PRESETS, type EmployeeRole, type Permissions } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES: EmployeeRole[] = ["barbeiro", "recepcionista", "gerente"];

/** Proprietario (email == OWNER_EMAIL) ou quem tem gerenciarFuncionarios pode. */
function canManage(user: { email?: string; perms?: Record<string, boolean> }) {
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  const isOwner = !!ownerEmail && user.email?.toLowerCase() === ownerEmail;
  return isOwner || user.perms?.gerenciarFuncionarios === true;
}

interface CreateBody {
  employeeId: string; // doc existente em `barbers` (cadastrado sem acesso)
  email: string;
  password: string;
  role: EmployeeRole;
  perms?: Partial<Permissions>;
}

export async function POST(req: Request) {
  // 1) Autorizacao: so quem pode gerenciar funcionarios.
  const requester = await getSessionUser();
  if (!requester) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!canManage(requester)) {
    return NextResponse.json({ error: "Sem permissão para criar acessos." }, { status: 403 });
  }

  // 2) Validacao do corpo.
  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { employeeId, email, password, role } = body;
  if (!employeeId || !email || !password || !role) {
    return NextResponse.json(
      { error: "Campos obrigatórios: employeeId, email, password, role." },
      { status: 400 }
    );
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: "Cargo inválido." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "A senha deve ter ao menos 6 caracteres." }, { status: 400 });
  }
  // O email do proprietario nao pode virar acesso de funcionario (rebaixaria o dono).
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  if (ownerEmail && email.toLowerCase() === ownerEmail) {
    return NextResponse.json(
      { error: "Este e-mail pertence ao proprietário e não pode ser usado para um funcionário." },
      { status: 400 }
    );
  }

  // O doc do funcionario precisa existir e ainda nao ter acesso.
  const empRef = adminDb.collection("barbers").doc(employeeId);
  const empSnap = await empRef.get();
  if (!empSnap.exists) {
    return NextResponse.json({ error: "Funcionário não encontrado." }, { status: 404 });
  }
  if (empSnap.data()?.authUid) {
    return NextResponse.json({ error: "Este funcionário já possui acesso." }, { status: 409 });
  }

  // 3) Permissoes efetivas = preset do cargo + overrides enviados.
  const perms: Permissions = { ...ROLE_PRESETS[role], ...(body.perms ?? {}) };

  try {
    // 4) Cria o usuario no Firebase Auth.
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: empSnap.data()?.name,
    });

    // 5) Custom claims no token (lidos pelo proxy e pelas Security Rules).
    // barberId = ID do doc em `barbers` (o mesmo que os agendamentos usam),
    // para o escopo de dados (barbeiro vê os agendamentos dele) funcionar.
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role,
      barberId: employeeId,
      perms,
    });

    // 6) Vincula o doc do funcionario ao Auth.
    await empRef.update({
      authUid: userRecord.uid,
      email,
      role,
      perms,
    });

    return NextResponse.json({ ok: true, uid: userRecord.uid });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "auth/email-already-exists") {
      return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 409 });
    }
    if (code === "auth/invalid-email") {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    console.error("Falha ao criar acesso:", err);
    return NextResponse.json({ error: "Não foi possível criar o acesso." }, { status: 500 });
  }
}
