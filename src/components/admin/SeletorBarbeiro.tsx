"use client";

import type { LucideIcon } from "lucide-react";

/**
 * Seletor de barbeiro padrão do admin. Duas variantes:
 * - "pills" (padrão): linha de pills compactas (avatar de iniciais + 1º nome).
 *   Usada na grade de horários e no filtro da Caixa.
 * - "cards": linhas grandes empilhadas (avatar/foto + nome), para preencher
 *   melhor o passo de escolha do barbeiro no wizard de agendamento.
 * `extra` adiciona uma opção especial no início, sem avatar (ex: "Qualquer
 * disponível" no agendamento, "Todos" no filtro).
 */
export type BarbeiroOpcao = { id: string; name: string; photoUrl?: string | null };

function initialsOf(name: string) {
  return name.trim().split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

export function SeletorBarbeiro({
  barbeiros,
  value,
  onChange,
  extra,
  variant = "pills",
  className = "",
}: {
  barbeiros: BarbeiroOpcao[];
  value: string | null;
  onChange: (id: string) => void;
  extra?: { id: string; label: string; icon?: LucideIcon };
  variant?: "pills" | "cards";
  className?: string;
}) {
  if (variant === "cards") {
    const card = (id: string, label: string, photoUrl: string | null, initials: string | null, Icon?: LucideIcon) => {
      const isActive = id === value;
      return (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            isActive
              ? "bg-gold/15 text-gold border border-gold/40"
              : "admin-surface-subtle admin-text-primary border border-white/8 hover:border-white/20"
          }`}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagem do R2/CDN, fora do otimizador
            <img src={photoUrl} alt={label} className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10" />
          ) : (
            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isActive ? "bg-gold text-slate-950" : "bg-white/10 admin-text-secondary"}`}>
              {Icon ? <Icon className="w-4 h-4" /> : initials}
            </span>
          )}
          <span className="truncate">{label}</span>
        </button>
      );
    };

    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {extra && card(extra.id, extra.label, null, null, extra.icon)}
        {barbeiros.map((b) => card(b.id, b.name, b.photoUrl ?? null, initialsOf(b.name)))}
      </div>
    );
  }

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
      {barbeiros.map((b) => pill(b.id, b.name.split(" ")[0], initialsOf(b.name)))}
    </div>
  );
}
