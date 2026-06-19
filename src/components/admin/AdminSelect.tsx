"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type AdminSelectOption = { value: string; label: string };

/**
 * Dropdown genérico tematizado. Substitui o <select> nativo, cujo menu aberto
 * (lista de <option>) é desenhado pelo SO e quebra o tema do admin (fundo branco,
 * texto cinza, highlight azul). Expande inline (sem overlay absoluto) para não ser
 * cortado por modais com overflow; listas longas ganham scroll interno.
 * Para o caso específico de categorias dinâmicas, ver CategorySelect.
 */
export function AdminSelect({
  value,
  options,
  onChange,
  placeholder = "Selecione",
  maxHeightClass = "max-h-56",
}: {
  value: string;
  options: AdminSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeightClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const atual = options.find((o) => o.value === value);

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:border-gold/50 transition-colors"
      >
        <span className={atual ? "admin-text-primary" : "admin-text-secondary"}>
          {atual ? atual.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 admin-text-secondary transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className={`admin-surface-subtle rounded-xl p-1 mt-1 overflow-y-auto ${maxHeightClass}`}>
            {options.map((o) => {
              const sel = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`admin-glass-card-hover flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${sel ? "text-gold" : "admin-text-primary"}`}
                >
                  {o.label}
                  {sel && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
