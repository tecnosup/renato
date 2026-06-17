"use client";

import { useState } from "react";
import { ChevronDown, Check, Tags } from "lucide-react";
import type { Category } from "@/lib/types";

/**
 * Dropdown tematizado de categoria (dinâmica, do Firestore). Substitui o
 * <select> nativo, cujo menu aberto quebra o tema do admin. Inclui a opção
 * "Gerenciar categorias". Reutilizado nas telas de Serviços e Produtos.
 */
export function CategorySelect({
  value,
  categorias,
  onChange,
  onGerenciar,
}: {
  value: string;
  categorias: Category[];
  onChange: (id: string) => void;
  onGerenciar: () => void;
}) {
  const [open, setOpen] = useState(false);
  const atual = categorias.find((c) => c.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:border-gold/50 transition-colors"
      >
        <span className={atual ? "admin-text-primary" : "admin-text-secondary"}>
          {atual ? atual.name : "Selecione uma categoria"}
        </span>
        <ChevronDown className={`w-4 h-4 admin-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="admin-surface-subtle rounded-xl p-1 mt-1">
            {categorias.map((c) => {
              const sel = c.id === value;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c.id); setOpen(false); }}
                  className={`admin-glass-card-hover flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${sel ? "text-gold" : "admin-text-primary"}`}
                >
                  {c.name}
                  {sel && <Check className="w-4 h-4" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => { onGerenciar(); setOpen(false); }}
              className="admin-glass-card-hover flex items-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm admin-text-secondary hover:text-gold transition-colors border-t border-white/5 mt-1"
            >
              <Tags className="w-4 h-4" /> Gerenciar categorias
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
