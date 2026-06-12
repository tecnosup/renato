"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Image as ImageIcon, Upload, RotateCcw } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useBackgroundImage } from "@/hooks/useBackgroundImage";
import { Modal } from "@/components/ui/Modal";
import { DEFAULT_USER_BACKGROUND, setUserBackground } from "@/lib/user-background";

export default function FundoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { background, loading } = useBackgroundImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "backgrounds");

      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Falha no upload.");
        return;
      }

      const previousPath = background.path;
      await setUserBackground(user.uid, { url: data.url, path: data.path });

      if (previousPath) {
        fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: previousPath }),
        }).catch(() => {});
      }
    } catch {
      setError("Falha no upload. Verifique sua conexão.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    if (!user) return;
    const previousPath = background.path;
    await setUserBackground(user.uid, DEFAULT_USER_BACKGROUND);

    if (previousPath) {
      fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: previousPath }),
      }).catch(() => {});
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button onClick={() => router.back()} className="text-slate-100 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-100">Imagem de fundo</h1>
      </div>

      {/* Preview */}
      <div className="transform-gpu mx-4 mb-3 rounded-2xl overflow-hidden admin-glass-card">
        <div
          className="aspect-video bg-cover bg-center relative"
          style={{ backgroundImage: loading ? undefined : `url('${background.url}')` }}
        >
          <div className="absolute inset-0 bg-slate-950/40" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-slate-300/80">Carregando...</p>
            </div>
          )}
        </div>
      </div>

      <p className="px-4 text-xs text-slate-300/80 mb-4">
        Essa imagem é exibida como fundo de todas as telas do painel. Recomendado: imagens
        horizontais, no formato JPG, PNG ou WEBP, até 8MB.
      </p>

      {error && (
        <p className="px-4 text-xs text-red-400 mb-4">{error}</p>
      )}

      {/* Ações */}
      <div className="px-4 mb-12 space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="admin-glass-card admin-glass-card-hover transform-gpu w-full disabled:opacity-60 admin-text-primary py-3.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Enviando..." : "Escolher imagem"}
        </button>
        <button
          onClick={() => setConfirmandoReset(true)}
          disabled={uploading || !background.path}
          className="admin-glass-card admin-glass-card-hover transform-gpu w-full disabled:opacity-40 admin-text-primary py-3.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          Restaurar padrão
        </button>
      </div>

      {confirmandoReset && (
        <Modal
          onClose={() => setConfirmandoReset(false)}
          panelClassName="admin-glass-modal sm:rounded-3xl rounded-t-3xl"
        >
          {(close) => (
            <div className="p-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full admin-glass-card flex items-center justify-center">
                <RotateCcw className="w-6 h-6 admin-text-primary" />
              </div>
              <div>
                <p className="text-base font-bold admin-text-primary">Restaurar padrão?</p>
                <p className="text-sm admin-text-secondary mt-1">
                  O fundo do painel vai voltar para a imagem original da Século XXI.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full pt-1">
                <button onClick={close} className="flex-1 px-5 py-3 rounded-full text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-400/15 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleReset();
                    close();
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-full text-sm font-bold transition-colors"
                >
                  Sim, restaurar
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
