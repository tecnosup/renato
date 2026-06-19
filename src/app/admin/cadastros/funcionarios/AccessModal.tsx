"use client";

import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, ShieldCheck, KeyRound, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  createEmployeeAccess,
  updateEmployeeAccess,
  revokeEmployeeAccess,
} from "@/lib/employees";
import { ROLE_PRESETS, FULL_PERMS, type Employee, type Permissions } from "@/lib/types";

// Rotulos amigaveis de cada permissao (na ordem de exibicao).
const PERM_LABELS: { key: keyof Permissions; label: string; desc: string }[] = [
  { key: "verAgendaPropria", label: "Agenda própria", desc: "Ver os agendamentos dele" },
  { key: "verAgendaTodos", label: "Agenda de todos", desc: "Ver a agenda de todos os barbeiros" },
  { key: "verCaixa", label: "Caixa", desc: "Abrir, conferir e fechar o caixa" },
  { key: "verFinanceiroProprio", label: "Meu Financeiro", desc: "Ver as próprias comandas, atendimentos e comissão" },
  { key: "verFinanceiroGeral", label: "Financeiro geral", desc: "Faturamento da barbearia inteira" },
  { key: "fecharComandas", label: "Registrar pagamento", desc: "Pode fechar comandas e registrar forma de pagamento" },
  { key: "escolherBarbeiroComanda", label: "Comanda p/ qualquer barbeiro", desc: "Ao abrir comanda, escolher para qual barbeiro (atendimento presencial)" },
  { key: "gerenciarFuncionarios", label: "Gerenciar funcionários", desc: "Criar e editar acessos" },
  { key: "gerenciarCadastros", label: "Cadastros", desc: "Serviços, produtos, clientes, cupons" },
  { key: "gerenciarGrade", label: "Configurar grade", desc: "Editar horários e bloqueios da própria agenda" },
];

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

export function AccessModal({
  employee,
  onClose,
}: {
  employee: Employee;
  onClose: () => void;
}) {
  // Modo: gerenciar (ja tem login) vs criar (primeiro acesso).
  const isManaging = !!employee.authUid;

  const [email, setEmail] = useState(employee.email ?? "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  // Ao gerenciar, parte das permissoes atuais; ao criar, do preset do cargo.
  const [perms, setPerms] = useState<Permissions>(
    employee.perms ? { ...employee.perms } : { ...ROLE_PRESETS[employee.role] }
  );
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  // Criar exige email + senha; gerenciar permite salvar so perms/email (senha opcional).
  const podeSalvar = isManaging
    ? !saving && email.trim().length > 0 && (password.length === 0 || password.length >= 6)
    : email.trim().length > 0 && password.length >= 6 && !saving;

  const salvar = async (close: () => void) => {
    if (!podeSalvar) return;
    setSaving(true);
    setErro("");
    try {
      if (isManaging) {
        await updateEmployeeAccess({
          employeeId: employee.id,
          email: email.trim() !== employee.email ? email.trim() : undefined,
          password: password.length >= 6 ? password : undefined,
          perms,
        });
      } else {
        await createEmployeeAccess({
          employeeId: employee.id,
          email: email.trim(),
          password,
          role: employee.role,
          perms,
        });
      }
      close();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const revogar = async (close: () => void) => {
    setSaving(true);
    setErro("");
    try {
      await revokeEmployeeAccess(employee.id);
      close();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao revogar.");
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      {(close) => (
        <>
          <div className="admin-border-b flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="text-base font-bold admin-text-primary">
                {isManaging ? "Gerenciar acesso" : "Criar acesso"}
              </h2>
              <p className="text-xs admin-text-secondary mt-0.5">
                {employee.name} · {isManaging ? "login ativo no sistema" : "login próprio no sistema"}
              </p>
            </div>
            <button onClick={close} className="group admin-text-primary hover:opacity-80">
              <X className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90" />
            </button>
          </div>

          {confirmRevoke ? (
            /* Confirmacao de revogar acesso */
            <div className="p-5 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold admin-text-primary">Revogar acesso?</h3>
                <p className="text-xs admin-text-secondary mt-1">
                  <span className="font-semibold admin-text-primary">{employee.name}</span> não conseguirá
                  mais entrar no sistema. O cadastro (agenda) é mantido.
                </p>
              </div>
              {erro && <p className="text-rose-400 text-xs text-center">{erro}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setConfirmRevoke(false)}
                  className="transform-gpu flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => revogar(close)}
                  disabled={saving}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? "Revogando..." : "Revogar acesso"}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {/* Credenciais */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs admin-text-secondary mb-1 block">E-mail de acesso</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
                    <input
                      type="email"
                      placeholder="funcionario@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      name="employee-access-email"
                      className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs admin-text-secondary mb-1 block">
                    {isManaging ? "Nova senha (opcional)" : "Senha inicial"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder={isManaging ? "deixe em branco para manter" : "mínimo 6 caracteres"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      name="employee-access-password"
                      className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary hover:opacity-80"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] admin-text-secondary mt-1">
                    {isManaging ? "Preencha só se quiser redefinir." : "Você define e repassa ao funcionário."}
                  </p>
                </div>
              </div>

              {/* Permissoes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  <p className="text-sm font-semibold admin-text-primary">Permissões</p>
                  <span className="text-[10px] admin-text-secondary">preset: {employee.role}</span>
                  {(() => {
                    const isFull = Object.values(perms).every(Boolean);
                    return (
                      <button
                        type="button"
                        onClick={() => setPerms({ ...FULL_PERMS })}
                        className={`ml-auto text-[10px] font-bold uppercase tracking-wide rounded-lg px-2.5 py-1.5 transition-colors flex items-center gap-1 ${
                          isFull
                            ? "bg-gold/20 text-gold border border-gold/40"
                            : "admin-surface-subtle admin-text-secondary border border-white/10 hover:text-gold hover:border-gold/40"
                        }`}
                        title="Liga todas as permissões (acesso de proprietário)"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {isFull ? "Acesso total ✓" : "Acesso total"}
                      </button>
                    );
                  })()}
                </div>
                <div className="admin-surface-subtle rounded-xl divide-y divide-white/5">
                  {PERM_LABELS.map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between px-4 py-2.5">
                      <div className="pr-3">
                        <p className="text-sm admin-text-primary">{label}</p>
                        <p className="text-[11px] admin-text-secondary">{desc}</p>
                      </div>
                      <Toggle on={perms[key]} onClick={() => setPerms((p) => ({ ...p, [key]: !p[key] }))} />
                    </div>
                  ))}
                </div>
              </div>

              {erro && <p className="text-rose-400 text-xs text-center">{erro}</p>}

              {/* Revogar (so no modo gerenciar) */}
              {isManaging && (
                <button
                  onClick={() => setConfirmRevoke(true)}
                  className="flex items-center justify-center gap-2 w-full text-red-400 hover:bg-red-500/10 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <KeyRound className="w-4 h-4" /> Revogar acesso
                </button>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={close}
                  className="transform-gpu flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => salvar(close)}
                  disabled={!podeSalvar}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Salvando..." : isManaging ? "Salvar alterações" : "Criar acesso"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
