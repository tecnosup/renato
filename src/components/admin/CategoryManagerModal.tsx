"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { createCategory, deleteCategory } from "@/lib/categories";
import type { Category, CategoryType } from "@/lib/types";

/**
 * Modal simples de categorias de um `type` (servico|produto): listar, adicionar
 * e remover. Reutilizado nas telas de Serviços e Produtos. Recebe as categorias
 * já assinadas pela tela-pai (tempo real).
 */
export function CategoryManagerModal({
  type,
  categorias,
  onClose,
}: {
  type: CategoryType;
  categorias: Category[];
  onClose: () => void;
}) {
  const [novo, setNovo] = useState("");

  const adicionar = async () => {
    const name = novo.trim();
    if (!name) return;
    if (categorias.some((c) => c.name.trim().toLowerCase() === name.toLowerCase())) return;
    await createCategory({ name, type, active: true, order: categorias.length });
    setNovo("");
  };

  return (
    <Modal onClose={onClose}>
      {(close) => (
        <>
          <ModalHeader title="Categorias" onClose={close} />
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <input
                value={novo}
                onChange={(e) => setNovo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && adicionar()}
                placeholder="Nova categoria..."
                className="transform-gpu flex-1 admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-2.5 text-sm admin-text-primary focus:outline-none focus:border-gold/50 transition-colors"
              />
              <button
                onClick={adicionar}
                disabled={!novo.trim()}
                className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 px-3 rounded-xl font-bold transition-all disabled:opacity-50"
                aria-label="Adicionar"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {categorias.length === 0 ? (
              <p className="text-xs admin-text-secondary text-center py-3">Nenhuma categoria ainda.</p>
            ) : (
              <ul className="admin-divide rounded-xl overflow-hidden admin-surface-subtle">
                {categorias.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 px-3 py-2.5">
                    <span className="flex-1 text-sm admin-text-primary truncate">{c.name}</span>
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center admin-text-secondary hover:text-red-400 transition-colors"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
