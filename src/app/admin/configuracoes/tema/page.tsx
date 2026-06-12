"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Moon, Sun, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAdminTheme } from "@/hooks/useAdminTheme";
import { type AdminTheme, setUserTheme } from "@/lib/user-theme";

const themeOptions: { value: AdminTheme; label: string; desc: string; icon: typeof Moon }[] = [
  {
    value: "liquid-glass",
    label: "Liquid Glass",
    desc: "Cards translúcidos em vidro, com efeito de blur",
    icon: Sparkles,
  },
  {
    value: "noturno",
    label: "Noturno",
    desc: "Cards sólidos escuros, texto claro",
    icon: Moon,
  },
  {
    value: "diurno",
    label: "Diurno",
    desc: "Cards sólidos claros, texto escuro",
    icon: Sun,
  },
];

export default function TemaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, loading } = useAdminTheme();
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (value: AdminTheme) => {
    if (!user || value === theme) return;
    setError(null);
    try {
      await setUserTheme(user.uid, value);
    } catch {
      setError("Não foi possível salvar o tema. Tente novamente.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header — fica sobre o fundo, sempre branco */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button
          onClick={() => router.back()}
          className="text-slate-100 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-100">Tema</h1>
      </div>

      {error && (
        <p className="px-4 text-xs text-red-400 mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-center text-sm admin-text-secondary pt-6">Carregando...</p>
      ) : (
        <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card p-1">
          {themeOptions.map(({ value, label, desc, icon: Icon }) => {
            const selected = theme === value;
            return (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className="admin-glass-card-hover admin-glass-card-active flex items-center gap-4 w-full rounded-xl px-3 py-3.5 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold admin-text-primary">{label}</p>
                  <p className="text-xs admin-text-secondary mt-0.5">{desc}</p>
                </div>
                {selected && <Check className="w-5 h-5 text-gold shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
