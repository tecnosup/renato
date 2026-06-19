"use client";

import type { LucideIcon } from "lucide-react";

/**
 * Seletor de barbeiro padrão do admin: linha de "pills" (avatar de iniciais +
 * primeiro nome, ativo em dourado). É o MESMO elemento em todo lugar que escolhe
 * barbeiro — grade de horários, wizard de agendamento (passo 2) e filtro da Caixa
 * — para manter consistência. `extra` adiciona uma pill especial no início, sem
 * avatar (ex: "Qualquer disponível" no agendamento, "Todos" no filtro).
 */
export type BarbeiroOpcao = { id: string; name: string };

export function SeletorBarbeiro({
  barbeiros,
  value,
  onChange,
  extra,
  className = "",
}: {
  barbeiros: BarbeiroOpcao[];
  value: string | null;
  onChange: (id: string) => void;
  extra?: { id: string; label: string; icon?: LucideIcon };
  className?: string;
}) {
  const pill = (id: string, label: string, initials: string | null, Icon?: LucideIcon) => {
    const isActive = id === value;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onChange(id)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
          isActive
            ? "bg-gold/15 text-gold border border-gold/40"
            : "admin-surface-subtle admin-text-secondary border border-white/8 hover:border-white/20 hover:admin-text-primary"
        }`}
      >
        {(initials !== null || Icon) && (
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${isActive ? "bg-gold text-slate-950" : "bg-white/10 admin-text-secondary"}`}>
            {Icon ? <Icon className="w-2.5 h-2.5" /> : initials}
          </span>
        )}
        {label}
      </button>
    );
  };

  return (
    <div className={`flex gap-1.5 flex-wrap ${className}`}>
      {extra && pill(extra.id, extra.label, null, extra.icon)}
      {barbeiros.map((b) => {
        const initials = b.name.trim().split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
        return pill(b.id, b.name.split(" ")[0], initials);
      })}
    </div>
  );
}
