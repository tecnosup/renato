"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, AlertCircle } from "lucide-react";

/**
 * Campo de upload de imagem tematizado, reutilizado nas telas de Serviços e
 * Produtos. Sobe o arquivo via POST /api/admin/upload (Cloudflare R2) e devolve
 * a URL pública pelo onChange; ao trocar/remover, apaga a imagem antiga no R2
 * (DELETE /api/admin/upload).
 *
 * Degrada com elegância: se o R2 não estiver configurado, a rota responde 500 e
 * mostramos um aviso amigável — o resto do cadastro segue funcionando, a foto é
 * opcional. Ver docs/produtos.md e src/lib/r2.ts.
 */

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024;

export function ImageUploadField({
  value,
  folder,
  onChange,
  label = "Foto",
}: {
  /** URL pública atual (ou vazio). */
  value: string;
  /** Pasta no bucket (ex: "servicos", "produtos"). */
  folder: string;
  /** Recebe a nova URL pública, ou "" ao remover. */
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  // path (chave R2) da imagem recém-enviada nesta sessão, para poder apagá-la do
  // bucket se o usuário trocar/remover antes de salvar o formulário.
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  async function deleteFromBucket(path: string) {
    try {
      await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
    } catch {
      // best-effort: se falhar, fica uma imagem órfã no bucket (não bloqueia o fluxo).
    }
  }

  async function handleFile(file: File) {
    setErro(null);

    if (!ALLOWED.includes(file.type)) {
      setErro("Use uma imagem JPG, PNG, WEBP ou AVIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErro("Imagem acima de 8MB.");
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);

      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        // Mensagem da rota (inclui "R2 não configurado").
        setErro(data?.error ?? "Falha no upload.");
        return;
      }

      // Sucesso: apaga a imagem anterior enviada nesta sessão (evita órfã).
      if (pendingPath) await deleteFromBucket(pendingPath);
      setPendingPath(data.path ?? null);
      onChange(data.url);
    } catch {
      setErro("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    if (pendingPath) await deleteFromBucket(pendingPath);
    setPendingPath(null);
    setErro(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-sm admin-text-secondary mb-1.5">{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- imagem vinda do R2/CDN, fora do otimizador do Next */}
          <img
            src={value}
            alt={label}
            className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
              className="text-xs px-3 py-2 rounded-lg admin-surface-subtle admin-text-secondary hover:text-gold transition-colors disabled:opacity-50"
            >
              Trocar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleRemove}
              className="text-xs px-3 py-2 rounded-lg admin-surface-subtle admin-text-secondary hover:text-red-400 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="transform-gpu w-full admin-surface-subtle admin-input border border-dashed border-white/15 rounded-xl px-4 py-6 flex flex-col items-center justify-center gap-2 admin-text-secondary hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs">Enviando…</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-5 h-5" />
              <span className="text-xs">Adicionar foto (até 8MB)</span>
            </>
          )}
        </button>
      )}

      {erro && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {erro}
        </p>
      )}
    </div>
  );
}
