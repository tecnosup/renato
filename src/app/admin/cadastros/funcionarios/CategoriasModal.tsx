"use client";

import { useState } from "react";
import { X, Plus, Pencil, Trash2, Check, ChevronDown, Calendar, Tags, GripVertical } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  createEmployeeCategory,
  updateEmployeeCategory,
  deleteEmployeeCategory,
} from "@/lib/employee-categories";
import type { EmployeeCategory, EmployeeRole } from "@/lib/types";

const PRESET_LABEL: Record<EmployeeRole, string> = {
  barbeiro: "Barbeiro (só a agenda e o financeiro dele)",
  recepcionista: "Recepcionista (agenda de todos, caixa, cadastros)",
  gerente: "Gerente (acesso total)",
};

const PRESETS: EmployeeRole[] = ["barbeiro", "recepcionista", "gerente"];

// Dropdown tematizado de preset (mesmo padrão do RoleSelect da página).
function PresetSelect({
  value,
  onChange,
}: {
  value: EmployeeRole;
  onChange: (p: EmployeeRole) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:border-gold/50 transition-colors"
      >
        <span className="admin-text-primary capitalize">{value}</span>
        <ChevronDown className={`w-4 h-4 admin-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="admin-surface-subtle rounded-xl p-1 mt-1">
            {PRESETS.map((p) => {
              const sel = p === value;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => { onChange(p); setOpen(false); }}
                  className={`admin-glass-card-hover flex items-start justify-between w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${sel ? "text-gold" : "admin-text-primary"}`}
                >
                  <span className="text-left pr-2">{PRESET_LABEL[p]}</span>
                  {sel && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${on ? "bg-gold" : "admin-surface-subtle border border-white/10"}`}
    >
      <span className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-sm transition-[left] duration-200 ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

type EditState = {
  id: string | null;
  name: string;
  preset: EmployeeRole;
  bookable: boolean;
};

const EMPTY_EDIT: EditState = { id: null, name: "", preset: "barbeiro", bookable: true };

/**
 * Gerencia as categorias de funcionário (criar/editar/excluir). Cada categoria
 * define um preset de permissão e se é "agendável" (aparece na agenda/landing).
 */
export function CategoriasModal({
  categories,
  countByCategory,
  onClose,
}: {
  categories: EmployeeCategory[];
  /** Quantos funcionários usam cada categoria (bloqueia exclusão se > 0). */
  countByCategory: Record<string, number>;
  onClose: () => void;
}) {
  const [edit, setEdit] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<EmployeeCategory | null>(null);

  const abrirNova = () => setEdit({ ...EMPTY_EDIT });
  const abrirEdicao = (c: EmployeeCategory) =>
    setEdit({ id: c.id, name: c.name, preset: c.preset, bookable: c.bookable });

  const salvar = async () => {
    if (!edit) return;
    const name = edit.name.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      if (edit.id) {
        await updateEmployeeCategory(edit.id, { name, preset: edit.preset, bookable: edit.bookable });
      } else {
        // Nova categoria entra no fim da ordem.
        const order = categories.length ? Math.max(...categories.map((c) => c.order)) + 1 : 0;
        await createEmployeeCategory({ name, preset: edit.preset, bookable: edit.bookable, order });
      }
      setEdit(null);
    } finally {
      setSaving(false);
    }
  };

  const remover = async () => {
    if (!confirmDelete) return;
    await deleteEmployeeCategory(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <Modal onClose={onClose}>
      {(close) => (
        <>
          <div className="admin-border-b flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <Tags className="w-4 h-4 text-gold" />
              <h2 className="text-base font-bold admin-text-primary">Categorias</h2>
            </div>
            <button onClick={close} className="group admin-text-primary hover:opacity-80">
              <X className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90" />
            </button>
          </div>

          {confirmDelete ? (
            <div className="p-5 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold admin-text-primary">Excluir categoria?</h3>
                <p className="text-xs admin-text-secondary mt-1">
                  <span className="font-semibold admin-text-primary">{confirmDelete.name}</span> será removida.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="transform-gpu flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={remover}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ) : edit ? (
            /* Form de criar/editar categoria */
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs admin-text-secondary mb-1 block">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Barbeiro, Recepcionista, Caixa"
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  autoFocus
                  className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs admin-text-secondary mb-1 block">Permissões base ao dar acesso</label>
                <PresetSelect value={edit.preset} onChange={(p) => setEdit({ ...edit, preset: p })} />
              </div>
              <button
                type="button"
                onClick={() => setEdit({ ...edit, bookable: !edit.bookable })}
                className="flex items-center justify-between w-full admin-surface-subtle rounded-xl px-4 py-3"
              >
                <div className="text-left flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm admin-text-primary">Agendável</p>
                    <p className="text-[11px] admin-text-secondary">Aparece na agenda e como equipe na landing</p>
                  </div>
                </div>
                <Toggle on={edit.bookable} onClick={() => setEdit({ ...edit, bookable: !edit.bookable })} />
              </button>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEdit(null)}
                  className="transform-gpu flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvar}
                  disabled={!edit.name.trim() || saving}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Salvando..." : edit.id ? "Salvar" : "Criar"}
                </button>
              </div>
            </div>
          ) : (
            /* Lista de categorias */
            <div className="p-5 space-y-3">
              {categories.length === 0 ? (
                <p className="text-sm admin-text-secondary text-center py-6">
                  Nenhuma categoria ainda. Crie a primeira para organizar a equipe.
                </p>
              ) : (
                <ul className="admin-surface-subtle rounded-xl divide-y divide-white/5">
                  {categories.map((c) => {
                    const count = countByCategory[c.id] ?? 0;
                    return (
                      <li key={c.id} className="flex items-center gap-2 px-4 py-3">
                        <GripVertical className="w-4 h-4 admin-text-secondary/50 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium admin-text-primary truncate">{c.name}</p>
                            {c.bookable && (
                              <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gold/15 text-gold shrink-0">
                                <Calendar className="w-2.5 h-2.5" /> Agendável
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] admin-text-secondary capitalize mt-0.5">
                            base: {c.preset} · {count} {count === 1 ? "funcionário" : "funcionários"}
                          </p>
                        </div>
                        <button
                          onClick={() => abrirEdicao(c)}
                          className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-gold transition-colors shrink-0"
                          aria-label="Editar categoria"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(c)}
                          disabled={count > 0}
                          title={count > 0 ? "Há funcionários nesta categoria" : "Excluir"}
                          className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-red-400 transition-colors shrink-0 disabled:opacity-30 disabled:hover:text-current disabled:cursor-not-allowed"
                          aria-label="Excluir categoria"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <button
                onClick={abrirNova}
                className="w-full flex items-center justify-center gap-2 admin-surface-subtle admin-text-primary text-sm px-4 py-3 rounded-xl hover:bg-gold/15 hover:text-gold transition-colors"
              >
                <Plus className="w-4 h-4" /> Nova categoria
              </button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
