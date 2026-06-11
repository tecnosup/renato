import { NextResponse } from "next/server";
import { uploadToR2, deleteFromR2, isR2Configured } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  if (!isR2Configured) {
    return NextResponse.json(
      { error: "Armazenamento R2 não configurado. Verifique as variáveis R2_* no .env.local." },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "multipart/form-data inválido." }, { status: 400 });
  }

  const file = form.get("file");
  const folder = (form.get("folder") as string | null)?.trim() || "uploads";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Campo 'file' obrigatório." }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: `Tipo ${file.type || "desconhecido"} não permitido.` }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `Arquivo acima de ${MAX_BYTES / (1024 * 1024)}MB.` }, { status: 400 });
  }

  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "_").slice(0, 80);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await uploadToR2(buffer, file.type, safeFolder);
    return NextResponse.json({ ok: true, url: result.url, path: result.path });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    return NextResponse.json({ error: `Falha no upload: ${message}` }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isR2Configured) {
    return NextResponse.json({ error: "Armazenamento R2 não configurado." }, { status: 500 });
  }

  let body: { path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const key = body.path?.trim();
  if (!key) {
    return NextResponse.json({ error: "Campo 'path' obrigatório." }, { status: 400 });
  }

  try {
    await deleteFromR2(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    return NextResponse.json({ error: `Falha ao remover: ${message}` }, { status: 500 });
  }
}
