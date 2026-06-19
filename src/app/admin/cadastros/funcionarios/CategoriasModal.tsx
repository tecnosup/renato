"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import { X, Plus, Pencil, Trash2, Check, ChevronDown, Calendar, Tags, GripVertical, SlidersHorizontal } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { SuccessSplash } from "@/components/ui/SuccessSplash";
import {
  createEmployeeCategory,
  updateEmployeeCategory,
  deleteEmployeeCategory,
  reorderEmployeeCategories,
} from "@/lib/employee-categories";
import { ROLE_PRESETS, type EmployeeCategory, type EmployeeRole, type Permissions } from "@/lib/types";
import { PERM_LABELS } from "@/lib/perms";

const PRESET_LABEL: Record<EmployeeRole, string> = {
  barbeiro: "Barbeiro",
  recepcionista: "Recepcionista",
  gerente: "Gerente",
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
        <span className="admin-text-primary">{PRESET_LABEL[value]}</span>
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
                  className={`admin-glass-card-hover flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${sel ? "text-gold" : "admin-text-primary"}`}
                >
                  {PRESET_LABEL[p]}
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

// Toggle visual (span, não button): o controle inteiro é o <button> externo que
// envolve este indicador — botão dentro de botão é HTML inválido.
function ToggleDot({ on }: { on: boolean }) {
  return (
    <span className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${on ? "bg-gold" : "admin-surface-subtle border border-white/10"}`}>
      <span className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-sm transition-[left] duration-200 ${on ? "left-[22px]" : "left-0.5"}`} />
    </span>
  );
}

type EditState = {
  id: string | null;
  name: string;
  preset: EmployeeRole;
  perms: Permissions;
  bookable: boolean;
};

const emptyEdit = (): EditState => ({
  id: null,
  name: "",
  preset: "barbeiro",
  perms: { ...ROLE_PRESETS.barbeiro },
  bookable: true,
});

// Item arrastável da lista de categorias.
function CategoriaItem({
  cat,
  count,
  onEdit,
  onDelete,
}: {
  cat: EmployeeCategory;
  count: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={cat}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 px-4 py-3 admin-surface-subtle rounded-xl"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab active:cursor-grabbing touch-none admin-text-secondary/50 hover:admin-text-secondary shrink-0"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium admin-text-primary truncate">{cat.name}</p>
          {cat.bookable && (
            <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gold/15 text-gold shrink-0">
              <Calendar className="w-2.5 h-2.5" /> Agendável
            </span>
          )}
        </div>
        <p className="text-[11px] admin-text-secondary capitalize mt-0.5">
          base: {cat.preset} · {count} {count === 1 ? "funcionário" : "funcionários"}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-gold transition-colors shrink-0"
        aria-label="Editar categoria"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        disabled={count > 0}
        title={count > 0 ? "Há funcionários nesta categoria" : "Excluir"}
        className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-red-400 transition-colors shrink-0 disabled:opacity-30 disabled:hover:text-current disabled:cursor-not-allowed"
        aria-label="Excluir categoria"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Reorder.Item>
  );
}

/**
 * Gerencia as categorias de funcionário (criar/editar/excluir/reordenar). Cada
 * categoria define um conjunto de permissões (base = preset, ajustável no
 * "Avançado") e se é "agendável" (aparece na agenda/landing).
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
  const [advanced, setAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<EmployeeCategory | null>(null);
  const [splash, setSplash] = useState<string | null>(null);
  // Ordem local p/ o drag (espelha as categorias; sincroniza quando muda fora do drag).
  const [ordered, setOrdered] = useState<EmployeeCategory[]>(categories);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!draggingRef.current) setOrdered(categories);
  }, [categories]);

  // Mostra o splash de sucesso e volta para a lista após um instante.
  const flash = (msg: string) => {
    setSplash(msg);
    setTimeout(() => setSplash(null), 1100);
  };

  const abrirNova = () => { setAdvanced(false); setEdit(emptyEdit()); };
  const abrirEdicao = (c: EmployeeCategory) => {
    setAdvanced(false);
    setEdit({ id: c.id, name: c.name, preset: c.preset, perms: { ...c.perms }, bookable: c.bookable });
  };

  // Trocar o preset preenche as permissões (atalho); o usuário refina no Avançado.
  const aplicarPreset = (p: EmployeeRole) =>
    setEdit((e) => (e ? { ...e, preset: p, perms: { ...ROLE_PRESETS[p] } } : e));

  const salvar = async () => {
    if (!edit) return;
    const name = edit.name.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      const editing = !!edit.id;
      if (edit.id) {
        await updateEmployeeCategory(edit.id, { name, preset: edit.preset, perms: edit.perms, bookable: edit.bookable });
      } else {
        const order = categories.length ? Math.max(...categories.map((c) => c.order)) + 1 : 0;
        await createEmployeeCategory({ name, preset: edit.preset, perms: edit.perms, bookable: edit.bookable, order });
      }
      setEdit(null);
      flash(editing ? "Categoria salva" : "Categoria criada");
    } finally {
      setSaving(false);
    }
  };

  const remover = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await deleteEmployeeCategory(confirmDelete.id);
      setConfirmDelete(null);
      flash("Categoria excluída");
    } finally {
      setSaving(false);
    }
  };

  const onReorder = (next: EmployeeCategory[]) => {
    draggingRef.current = true;
    setOrdered(next);
  };
  const onReorderEnd = () => {
    draggingRef.current = false;
    reorderEmployeeCategories(ordered.map((c) => c.id)).catch(() => {});
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

          {splash ? (
            <SuccessSplash message={splash} />
          ) : confirmDelete ? (
            <div className="p-5 space-y-4">
              <div className="success-pop w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
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
                  disabled={saving}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? "Excluindo..." : "Excluir"}
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
                <PresetSelect value={edit.preset} onChange={aplicarPreset} />
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
                <ToggleDot on={edit.bookable} />
              </button>

              {/* Avançado: todas as permissões da categoria */}
              <button
                type="button"
                onClick={() => setAdvanced((a) => !a)}
                className="flex items-center justify-between w-full admin-surface-subtle rounded-xl px-4 py-3"
              >
                <div className="text-left flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gold shrink-0" />
                  <p className="text-sm admin-text-primary">Permissões avançadas</p>
                </div>
                <ChevronDown className={`w-4 h-4 admin-text-secondary transition-transform ${advanced ? "rotate-180" : ""}`} />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ gridTemplateRows: advanced ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="admin-surface-subtle rounded-xl divide-y divide-white/5">
                    {PERM_LABELS.map(({ key, label, desc }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEdit((e) => (e ? { ...e, perms: { ...e.perms, [key]: !e.perms[key] } } : e))}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-left"
                      >
                        <div className="pr-3">
                          <p className="text-sm admin-text-primary">{label}</p>
                          <p className="text-[11px] admin-text-secondary">{desc}</p>
                        </div>
                        <ToggleDot on={edit.perms[key]} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
            /* Lista de categorias (arrastável) */
            <div className="p-5 space-y-3">
              {ordered.length === 0 ? (
                <p className="text-sm admin-text-secondary text-center py-6">
                  Nenhuma categoria ainda. Crie a primeira para organizar a equipe.
                </p>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={ordered}
                  onReorder={onReorder}
                  onPointerUp={onReorderEnd}
                  className="space-y-2"
                >
                  {ordered.map((c) => (
                    <CategoriaItem
                      key={c.id}
                      cat={c}
                      count={countByCategory[c.id] ?? 0}
                      onEdit={() => abrirEdicao(c)}
                      onDelete={() => setConfirmDelete(c)}
                    />
                  ))}
                </Reorder.Group>
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
