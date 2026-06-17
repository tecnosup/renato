"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { UserPlus, X, Pencil, Trash2, Phone, Scissors, Check, ChevronDown, KeyRound, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { AccessModal } from "./AccessModal";
import {
  subscribeToEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/employees";
import type { Employee, EmployeeRole } from "@/lib/types";

const ROLE_LABEL: Record<EmployeeRole, string> = {
  barbeiro: "Barbeiro",
  recepcionista: "Recepcionista",
  gerente: "Gerente",
};

const ROLES: EmployeeRole[] = ["barbeiro", "recepcionista", "gerente"];

const avatarColors = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

function getInitials(nome: string) {
  return nome.trim().split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

type FormState = { name: string; role: EmployeeRole; phone: string; active: boolean };
const EMPTY_FORM: FormState = { name: "", role: "barbeiro", phone: "", active: true };

// Dropdown tematizado (substitui o <select> nativo, cujo menu aberto usa o
// estilo branco do SO e quebra o tema do admin).
function RoleSelect({
  value,
  onChange,
}: {
  value: EmployeeRole;
  onChange: (r: EmployeeRole) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:border-gold/50 transition-colors"
      >
        <span className="admin-text-primary">{ROLE_LABEL[value]}</span>
        <ChevronDown className={`w-4 h-4 admin-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {/* Expande no fluxo (empurra os campos abaixo) em vez de sobrepor */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="admin-surface-subtle rounded-xl p-1 mt-1">
            {ROLES.map((r) => {
              const sel = r === value;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => { onChange(r); setOpen(false); }}
                  className={`admin-glass-card-hover flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${sel ? "text-gold" : "admin-text-primary"}`}
                >
                  {ROLE_LABEL[r]}
                  {sel && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FuncionariosPage() {
  // Suspense exigido pelo useSearchParams (abrir cadastro via ?novo=1 da sidebar).
  return (
    <Suspense fallback={null}>
      <FuncionariosPageInner />
    </Suspense>
  );
}

function FuncionariosPageInner() {
  const [funcionarios, setFuncionarios] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // modal: null = fechado, { id: null } = novo, { id } = editando
  const [modal, setModal] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);
  // Funcionario para o qual estamos criando acesso (null = modal fechado).
  const [acessoPara, setAcessoPara] = useState<Employee | null>(null);

  useEffect(() => {
    const unsub = subscribeToEmployees((lista) => {
      setFuncionarios(lista);
      setLoading(false);
    });
    return unsub;
  }, []);

  const abrirNovo = () => {
    setForm(EMPTY_FORM);
    setModal({ id: null });
  };

  // Abre o cadastro automaticamente quando chega via ?novo=1 (atalho da sidebar /
  // deep-link). Limpa o param em seguida para que clicar de novo reabra sempre.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("novo") === "1") {
      abrirNovo();
      router.replace(pathname);
    }
  }, [searchParams, pathname, router]);

  const abrirEdicao = (f: Employee) => {
    setForm({ name: f.name, role: f.role, phone: f.phone, active: f.active });
    setModal({ id: f.id });
  };

  const salvar = async (close: () => void) => {
    const name = form.name.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      const payload = { name, role: form.role, phone: form.phone.trim(), active: form.active };
      if (modal?.id) {
        await updateEmployee(modal.id, payload);
      } else {
        await createEmployee(payload);
      }
      close();
    } finally {
      setSaving(false);
    }
  };

  const remover = async (close: () => void) => {
    if (!confirmDelete) return;
    await deleteEmployee(confirmDelete.id);
    close();
  };

  const ativos = funcionarios.filter((f) => f.active).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Funcionários</h1>
          <p className="text-slate-300 text-sm mt-1">
            {funcionarios.length} cadastrados · {ativos} ativos
          </p>
        </div>
        <button
          onClick={abrirNovo}
          className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Funcionário</span>
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="transform-gpu rounded-2xl admin-glass-card p-8 text-center">
          <p className="text-sm admin-text-secondary">Carregando...</p>
        </div>
      ) : funcionarios.length === 0 ? (
        <div className="transform-gpu rounded-2xl admin-glass-card p-8 text-center">
          <div className="w-12 h-12 rounded-full admin-surface-subtle flex items-center justify-center mx-auto mb-3">
            <Scissors className="w-5 h-5 text-gold" />
          </div>
          <p className="text-sm font-medium admin-text-primary">Nenhum funcionário cadastrado</p>
          <p className="text-xs admin-text-secondary mt-1">
            Cadastre os barbeiros para que apareçam no agendamento.
          </p>
          <button
            onClick={abrirNovo}
            className="mt-4 inline-flex items-center gap-2 admin-surface-subtle admin-text-primary text-xs px-4 py-2 rounded-lg hover:bg-gold/15 hover:text-gold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" /> Cadastrar primeiro
          </button>
        </div>
      ) : (
        <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card">
          <ul className="admin-divide">
            {funcionarios.map((f, i) => (
              <li key={f.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColors[i % avatarColors.length]} ${!f.active ? "opacity-40" : ""}`}>
                  {getInitials(f.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium admin-text-primary truncate">{f.name}</p>
                    {f.authUid && (
                      <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 shrink-0">
                        <ShieldCheck className="w-2.5 h-2.5" /> Acesso
                      </span>
                    )}
                    {!f.active && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full admin-surface-subtle admin-text-secondary shrink-0">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="text-xs admin-text-secondary truncate mt-0.5">
                    {ROLE_LABEL[f.role]}{f.phone ? ` · ${f.phone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setAcessoPara(f)}
                    className={`w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center transition-colors ${f.authUid ? "text-emerald-400 hover:text-emerald-300" : "admin-text-secondary hover:text-gold"}`}
                    aria-label={f.authUid ? "Gerenciar acesso" : "Criar acesso"}
                    title={f.authUid ? "Gerenciar acesso" : "Criar acesso"}
                  >
                    {f.authUid ? <ShieldCheck className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => abrirEdicao(f)}
                    className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-gold transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(f)}
                    className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-red-400 transition-colors"
                    aria-label="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal criar/editar */}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          {(close) => (
            <>
              <div className="flex items-center justify-between px-6 pt-6 pb-1">
                <h3 className="text-base font-bold admin-text-primary">
                  {modal.id ? "Editar funcionário" : "Novo funcionário"}
                </h3>
                <button onClick={close} className="group admin-text-primary hover:opacity-80">
                  <X className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90" />
                </button>
              </div>

              <div className="px-6 space-y-3">
                <div>
                  <label className="text-xs admin-text-secondary mb-1 block">Nome</label>
                  <input
                    type="text"
                    placeholder="Ex: Renato Silva"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs admin-text-secondary mb-1 block">Cargo</label>
                  <RoleSelect value={form.role} onChange={(r) => setForm({ ...form, role: r })} />
                </div>
                <div>
                  <label className="text-xs admin-text-secondary mb-1 block">WhatsApp (opcional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
                    <input
                      type="tel"
                      placeholder="11999999999"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className="flex items-center justify-between w-full admin-surface-subtle rounded-xl px-4 py-3"
                >
                  <div className="text-left">
                    <p className="text-sm admin-text-primary">Ativo</p>
                    <p className="text-[11px] admin-text-secondary">Aparece como opção no agendamento</p>
                  </div>
                  <span className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${form.active ? "bg-gold" : "admin-surface-subtle border border-white/10"}`}>
                    <span className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-sm transition-[left] duration-200 ${form.active ? "left-[22px]" : "left-0.5"}`} />
                  </span>
                </button>
              </div>

              <div className="flex gap-3 px-6 pt-4 pb-6">
                <button
                  onClick={close}
                  className="transform-gpu flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => salvar(close)}
                  disabled={!form.name.trim() || saving}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Salvando..." : modal.id ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)} panelClassName="admin-glass-modal sm:max-w-sm">
          {(close) => (
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold admin-text-primary">Excluir funcionário?</h3>
                <p className="text-xs admin-text-secondary mt-1">
                  <span className="font-semibold admin-text-primary">{confirmDelete.name}</span> será removido definitivamente.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={close}
                  className="transform-gpu flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => remover(close)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Modal de criar acesso (login + permissões) */}
      {acessoPara && (
        <AccessModal employee={acessoPara} onClose={() => setAcessoPara(null)} />
      )}
    </div>
  );
}
