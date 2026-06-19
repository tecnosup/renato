"use client";

import { useState, useRef, useLayoutEffect, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronLeft, ChevronRight, RefreshCw, Calendar, Ban, X, Plus, Link2,
  FileText, ListOrdered, ChevronDown, MessageCircle, CalendarClock, Trash2,
  Check, Settings2, Unlock, Copy, Clock, UserPlus,
} from "lucide-react";
import { subscribeToDay, cancelAppointment, rescheduleAppointment } from "@/lib/appointments";
import {
  generateSlots, saveSchedule, subscribeToSchedule, subscribeToBlockedSlots,
  blockSlot, unblockSlot, blockFullDay, unblockFullDay, DEFAULT_SCHEDULE,
} from "@/lib/schedules";
import { subscribeToEmployees } from "@/lib/employees";
import { addToWaitlist, removeFromWaitlist, subscribeToWaitlist, type WaitlistEntry } from "@/lib/waitlist";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { SeletorBarbeiro } from "@/components/admin/SeletorBarbeiro";
import { NovoAgendamentoWizard } from "@/components/admin/NovoAgendamentoWizard";
import { SuccessSplash } from "@/components/ui/SuccessSplash";
import { useAuth } from "@/components/providers/AuthProvider";
import { can } from "@/lib/access";
import type { Appointment, WeeklySchedule, DaySchedule, Employee } from "@/lib/types";

function buildWhatsappLink(phone: string, nome: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  const msg = encodeURIComponent(`Olá ${nome}, tudo bem? Aqui é da Barbearia Século XXI sobre o seu agendamento.`);
  return `https://wa.me/${full}?text=${msg}`;
}

function CalSlide({ dir, children }: { dir: "left" | "right"; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = dir === "right" ? "24px" : "-24px";
    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = `translateX(${from})`;
    el.getBoundingClientRect();
    el.style.transition = "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s ease-out";
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
  }, [dir]);
  return <div ref={ref}>{children}</div>;
}

function CalExpand({ expandido, children }: { expandido: boolean; children: React.ReactNode }) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ gridTemplateRows: expandido ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

const fabActions = [
  { label: "Agendar horário", icon: Calendar },
  { label: "Link de agendamento", icon: Link2 },
  { label: "Abrir comanda", icon: FileText },
  { label: "Lista de espera", icon: ListOrdered },
];

function FabMenu({
  onAgendar,
  onLink,
  onEspera,
}: {
  onAgendar: (hora: string) => void;
  onLink: () => void;
  onEspera: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleAction = (label: string) => {
    setOpen(false);
    if (label === "Agendar horário") onAgendar("");
    else if (label === "Link de agendamento") onLink();
    else if (label === "Lista de espera") onEspera();
    else if (label === "Abrir comanda") router.push("/admin/comandas/nova");
  };

  return (
    <>
      {open && <div className="transform-gpu fixed inset-0 z-30 backdrop-blur-[2px] bg-black/10 md:hidden" onClick={() => setOpen(false)} />}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 md:hidden">
        <div className="flex flex-col items-end gap-2">
          {fabActions.map(({ label, icon: Icon }, i) => (
            <button
              key={label}
              onClick={() => handleAction(label)}
              style={{ transitionDelay: open ? `${i * 30}ms` : "0ms", transformOrigin: "bottom right" }}
              className={`transform-gpu flex items-center gap-3 admin-glass-card admin-glass-card-hover admin-text-primary pl-4 pr-3 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-75 translate-y-2 pointer-events-none"}`}
            >
              {label}
              <span className="w-8 h-8 rounded-full admin-surface-subtle flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-gold" />
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="relative w-14 h-14 rounded-full bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 border border-white/30 text-slate-950 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] animate-[fab-pop-in_0.25s_cubic-bezier(0.34,1.56,0.64,1)_both]"
        >
          <Plus className={`w-6 h-6 absolute transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-135 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`} />
          <X className={`w-6 h-6 absolute transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-0 opacity-100 scale-100" : "-rotate-135 opacity-0 scale-50"}`} />
        </button>
      </div>
    </>
  );
}


// ─── Modal de Configuração da Grade ─────────────────────────────────────────

const DIAS_SEMANA_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="admin-surface-subtle admin-input border border-transparent rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-gold/50 transition-colors w-24"
    />
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${on ? "bg-gold" : "admin-surface-subtle border border-white/10"}`}
    >
      <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-sm transition-[left] duration-200 ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function ConfigurarGradeModal({
  barberId,
  barberName,
  schedule,
  onClose,
}: {
  barberId: string;
  barberName: string;
  schedule: WeeklySchedule;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<WeeklySchedule>(() =>
    Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [i, schedule[i] ?? DEFAULT_SCHEDULE[i]])
    ) as WeeklySchedule
  );
  // "editing" | "confirming" | "saving" | "success"
  const [stage, setStage] = useState<"editing" | "confirming" | "saving" | "success">("editing");
  // Almoço padrão, aplicável a todos os dias abertos de uma vez.
  const [almoco, setAlmoco] = useState({ start: "12:00", end: "13:00" });

  const updateDay = (day: number, patch: Partial<DaySchedule>) => {
    setDraft((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  };

  // Aplica o almoço padrão a todos os dias abertos (depois dá pra ajustar individual).
  const aplicarAlmocoTodos = () => {
    setDraft((prev) => {
      const next = { ...prev };
      for (let i = 0; i < 7; i++) {
        if (next[i].open) next[i] = { ...next[i], breakStart: almoco.start || undefined, breakEnd: almoco.end || undefined };
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    setStage("saving");
    try {
      await saveSchedule(barberId, draft);
      setStage("success");
      setTimeout(onClose, 1800);
    } catch {
      setStage("confirming");
    }
  };

  return (
    <Modal onClose={onClose}>
      {(close) => (
        <>
          {/* Cabeçalho (X só aparece em edição — não deixa fechar durante o salvamento) */}
          <div className="admin-border-b flex items-center justify-between px-5 pt-5 pb-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold admin-text-primary truncate">Configurar Grade</h2>
              <p className="text-xs admin-text-secondary mt-0.5 truncate">{barberName}</p>
            </div>
            {stage === "editing" && (
              <button onClick={close} className="group admin-text-secondary hover:opacity-80 transition-colors shrink-0">
                <X className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90" />
              </button>
            )}
          </div>

          {/* Tela de sucesso (padrão do site) */}
          {stage === "success" && (
            <SuccessSplash message="Grade salva!" subtitle="Os horários já estão atualizados." />
          )}

          {/* Tela de confirmação */}
          {(stage === "confirming" || stage === "saving") && (
            <div className="p-6 space-y-4">
              <div className="admin-surface-subtle rounded-xl p-4 space-y-1 text-center">
                <p className="text-sm font-semibold admin-text-primary">Confirmar alterações?</p>
                <p className="text-xs admin-text-secondary">Os novos horários passam a valer imediatamente na agenda e na landing.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStage("editing")}
                  disabled={stage === "saving"}
                  className="flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={stage === "saving"}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {stage === "saving" ? "Salvando..." : <><Check className="w-4 h-4" /> Confirmar</>}
                </button>
              </div>
            </div>
          )}

          {/* Tela de edição */}
          {stage === "editing" && (
            <>
              <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
                {/* Almoço padrão — aplica a todos os dias abertos de uma vez */}
                <div className="rounded-xl p-3 admin-surface-subtle border border-gold/15 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span className="text-xs font-semibold admin-text-primary">Almoço padrão</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <TimeInput value={almoco.start} onChange={(v) => setAlmoco((a) => ({ ...a, start: v }))} />
                    <span className="text-xs admin-text-secondary">até</span>
                    <TimeInput value={almoco.end} onChange={(v) => setAlmoco((a) => ({ ...a, end: v }))} />
                    <button
                      type="button"
                      onClick={aplicarAlmocoTodos}
                      className="ml-auto text-[11px] font-semibold text-gold hover:text-white bg-gold/10 hover:bg-gold/20 border border-gold/25 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      Aplicar a todos os dias
                    </button>
                  </div>
                </div>

                {Array.from({ length: 7 }, (_, i) => {
                  const day = draft[i];
                  return (
                    <div key={i} className={`rounded-xl p-3 space-y-2 transition-colors ${day.open ? "admin-surface-subtle" : "opacity-50"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold admin-text-primary">{DIAS_SEMANA_FULL[i]}</span>
                        <Toggle on={day.open} onClick={() => updateDay(i, { open: !day.open })} />
                      </div>
                      {day.open && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs admin-text-secondary w-16">Abertura</span>
                            <TimeInput value={day.start} onChange={(v) => updateDay(i, { start: v })} />
                            <span className="text-xs admin-text-secondary">até</span>
                            <TimeInput value={day.end} onChange={(v) => updateDay(i, { end: v })} />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs admin-text-secondary w-16">Almoço</span>
                            <TimeInput value={day.breakStart ?? ""} onChange={(v) => updateDay(i, { breakStart: v || undefined })} />
                            <span className="text-xs admin-text-secondary">até</span>
                            <TimeInput value={day.breakEnd ?? ""} onChange={(v) => updateDay(i, { breakEnd: v || undefined })} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-5 pb-5 pt-3 admin-border-t flex gap-3">
                <button
                  onClick={close}
                  className="flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setStage("confirming")}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-semibold transition-all"
                >
                  Salvar Grade
                </button>
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA_CURTO = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function getDiasSemana(diaKey: string) {
  const base = new Date(diaKey + "T12:00:00");
  const diaSemana = base.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - diaSemana + i);
    return d;
  });
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AgendaPage() {
  // Suspense exigido pelo useSearchParams (abrir "Agendar horário" via ?novo=1 da sidebar).
  return (
    <Suspense fallback={null}>
      <AgendaPageInner />
    </Suspense>
  );
}

function AgendaPageInner() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(toKey(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  const [expandido, setExpandido] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [calKey, setCalKey] = useState(0);
  const [modal, setModal] = useState<{ hora: string; nome?: string; telefone?: string } | null>(null);
  // Horário destacado ao chegar via "Ver na agenda" da notificação.
  const [destaqueHora, setDestaqueHora] = useState<string | null>(null);

  // Modais das ações rápidas (Link de agendamento / Lista de espera).
  const [linkModal, setLinkModal] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [waitlistModal, setWaitlistModal] = useState(false);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [waitForm, setWaitForm] = useState({ nome: "", telefone: "", servico: "" });

  // Atalhos da sidebar/FAB via query param. Limpa o param em seguida para que
  // clicar de novo reabra sempre.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const novo = searchParams.get("novo");
    const acao = searchParams.get("acao");
    if (novo === "1") setModal({ hora: "" });
    else if (acao === "link") setLinkModal(true);
    else if (acao === "espera") setWaitlistModal(true);
    else return;
    router.replace(pathname);
  }, [searchParams, pathname, router]);

  // Fila de espera em tempo real (usada pelo modal e pelo badge do FAB).
  useEffect(() => subscribeToWaitlist(setWaitlist), []);

  const [agendamentos, setAgendamentos] = useState<Record<string, Appointment[]>>({});
  const [acaoModal, setAcaoModal] = useState<Appointment | null>(null);
  const [remarcando, setRemarcando] = useState(false);
  const [novaData, setNovaData] = useState("");
  const [novaHora, setNovaHora] = useState("");

  // Grade do barbeiro ativo
  const [schedule, setSchedule] = useState<WeeklySchedule>({ ...DEFAULT_SCHEDULE });
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [configurandoGrade, setConfigurandoGrade] = useState(false);
  const [confirmarBloqueio, setConfirmarBloqueio] = useState(false);
  const [bloqueandoDia, setBloqueandoDia] = useState(false);

  // Lista de funcionários (para seletor no modal de configuração quando owner/gerente)
  const [funcionarios, setFuncionarios] = useState<Employee[]>([]);
  // Barbeiro cujos dados de grade estamos vendo (pode ser diferente do logado se for gerente)
  const [gradeBarberIdAlvo, setGradeBarberIdAlvo] = useState<string | null>(null);

  const { perms, barberId, loading: authLoading } = useAuth();
  const verTodos = can(perms, "verAgendaTodos");
  const podeGerenciarGrade = can(perms, "gerenciarGrade");
  const filtroBarbeiro = verTodos ? undefined : barberId;

  // BarbeirID efetivo para a grade: dono/gerente usa alvo selecionado, barbeiro usa o próprio
  const gradeBarberIdEfetivo = verTodos
    ? (gradeBarberIdAlvo ?? funcionarios[0]?.id ?? null)
    : barberId;

  // Carrega os barbeiros ativos (seletor da grade e do agendamento presencial).
  useEffect(() => {
    return subscribeToEmployees((lista) => {
      const ativos = lista.filter((e) => e.active && e.bookable);
      setFuncionarios(ativos);
      if (!gradeBarberIdAlvo && ativos.length > 0) setGradeBarberIdAlvo(ativos[0].id);
    });
  }, []);

  // "Ver na agenda" (da notificação): seleciona o dia, o barbeiro e destaca o horário.
  useEffect(() => {
    const date = searchParams.get("date");
    const barber = searchParams.get("barber");
    const time = searchParams.get("time");
    if (!date) return;
    setDiaSelecionado(date);
    const d = new Date(date + "T12:00:00");
    setMes(d.getMonth());
    setAno(d.getFullYear());
    if (barber && barber !== "qualquer") setGradeBarberIdAlvo(barber);
    if (time) setDestaqueHora(time);
    router.replace(pathname);
  }, [searchParams, pathname, router]);

  // Rola até o horário destacado e remove o realce depois de alguns segundos.
  useEffect(() => {
    if (!destaqueHora) return;
    const scroll = setTimeout(() => {
      document.getElementById(`slot-${destaqueHora}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 450);
    const limpar = setTimeout(() => setDestaqueHora(null), 3500);
    return () => { clearTimeout(scroll); clearTimeout(limpar); };
  }, [destaqueHora, diaSelecionado, gradeBarberIdEfetivo]);

  // Escuta a grade do barbeiro alvo em tempo real
  useEffect(() => {
    if (!gradeBarberIdEfetivo) return;
    return subscribeToSchedule(gradeBarberIdEfetivo, setSchedule);
  }, [gradeBarberIdEfetivo]);

  // Escuta os bloqueios pontuais do dia selecionado
  useEffect(() => {
    if (!gradeBarberIdEfetivo) return;
    return subscribeToBlockedSlots(gradeBarberIdEfetivo, diaSelecionado, setBlockedSlots);
  }, [gradeBarberIdEfetivo, diaSelecionado]);

  useEffect(() => {
    if (authLoading) return;
    const unsub = subscribeToDay(
      diaSelecionado,
      (lista) => setAgendamentos((prev) => ({ ...prev, [diaSelecionado]: lista })),
      filtroBarbeiro
    );
    return unsub;
  }, [diaSelecionado, filtroBarbeiro, authLoading]);

  // Slots dinâmicos: gerados pela grade, menos bloqueados e agendados
  const dayOfWeek = new Date(diaSelecionado + "T12:00:00").getDay();
  const dayConfig = schedule[dayOfWeek] ?? DEFAULT_SCHEDULE[dayOfWeek];
  const HORARIOS = generateSlots(dayConfig).filter((h) => !blockedSlots.includes(h));

  const navMes = (dir: number) => {
    setSlideDir(dir > 0 ? "right" : "left");
    setCalKey((k) => k + 1);
    if (expandido) {
      const d = new Date(ano, mes + dir, 1);
      setMes(d.getMonth());
      setAno(d.getFullYear());
    } else {
      const base = new Date(diaSelecionado + "T12:00:00");
      base.setDate(base.getDate() + dir * 7);
      const newKey = toKey(base.getFullYear(), base.getMonth(), base.getDate());
      setDiaSelecionado(newKey);
      setMes(base.getMonth());
      setAno(base.getFullYear());
    }
  };

  const selecionarDia = (key: string) => {
    setDiaSelecionado(key);
    setExpandido(false);
  };

  const abrirAcao = (a: Appointment) => {
    setAcaoModal(a);
    setRemarcando(false);
    setNovaData(a.date);
    setNovaHora(a.time);
  };

  const confirmarCancelamento = async () => {
    if (!acaoModal) return;
    await cancelAppointment(acaoModal.id);
    setAcaoModal(null);
  };

  const confirmarRemarcacao = async () => {
    if (!acaoModal || !novaData || !novaHora) return;
    await rescheduleAppointment(acaoModal.id, novaData, novaHora);
    setAcaoModal(null);
    if (novaData !== diaSelecionado) setDiaSelecionado(novaData);
  };

  const handleBloquearSlot = async (hora: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gradeBarberIdEfetivo) return;
    await blockSlot(gradeBarberIdEfetivo, diaSelecionado, hora);
  };

  const handleDesbloquearSlot = async (hora: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gradeBarberIdEfetivo) return;
    await unblockSlot(gradeBarberIdEfetivo, diaSelecionado, hora);
  };

  // Executa o bloqueio do dia inteiro (após a dupla confirmação).
  const executarBloqueioDia = async () => {
    if (!gradeBarberIdEfetivo || bloqueandoDia) return;
    setBloqueandoDia(true);
    try {
      await blockFullDay(gradeBarberIdEfetivo, diaSelecionado, schedule);
      setConfirmarBloqueio(false);
    } finally {
      setBloqueandoDia(false);
    }
  };

  const handleDesbloquearDia = async () => {
    if (!gradeBarberIdEfetivo) return;
    await unblockFullDay(gradeBarberIdEfetivo, diaSelecionado);
  };

  // Abre o wizard de agendamento presencial (hora opcional, vinda de um slot).
  const abrirNovoAgendamento = (hora: string) => {
    setModal({ hora });
  };

  // Link público de agendamento (a landing). Em produção será o domínio real.
  const linkAgendamento = typeof window !== "undefined" ? window.location.origin : "";

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkAgendamento);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* clipboard indisponível — ignora */
    }
  };

  const adicionarEspera = async () => {
    const nome = waitForm.nome.trim();
    if (!nome) return;
    await addToWaitlist({
      customerName: nome,
      customerPhone: waitForm.telefone.trim(),
      serviceName: waitForm.servico.trim() || undefined,
    });
    setWaitForm({ nome: "", telefone: "", servico: "" });
  };

  // "Chamar" da fila: abre o wizard já com os dados do cliente e remove da fila.
  const chamarDaEspera = (entry: WaitlistEntry) => {
    setModal({ hora: "", nome: entry.customerName, telefone: entry.customerPhone });
    setWaitlistModal(false);
    removeFromWaitlist(entry.id);
  };

  const agendDiaTodos = (agendamentos[diaSelecionado] ?? []).filter((a) => a.status !== "cancelado");
  // Cada barbeiro vê só a SUA agenda. Agendamentos "qualquer" (sem barbeiro fixo,
  // vindos da landing) aparecem em todas as grades, pois qualquer um pode atender.
  const agendDia = gradeBarberIdEfetivo
    ? agendDiaTodos.filter((a) => a.barberId === gradeBarberIdEfetivo || a.barberId === "qualquer")
    : agendDiaTodos;
  const agendPorHora: Record<string, Appointment> = {};
  agendDia.forEach((a) => { agendPorHora[a.time] = a; });

  // Todos os slots do dia (incluindo bloqueados) para os cards de resumo
  const todosSlotsDia = generateSlots(dayConfig);
  const totalAgend = agendDia.length;
  const concluidos = agendDia.filter((a) => a.status === "concluido").length;
  const faturado = concluidos * 65;
  const livres = HORARIOS.length - agendDia.length;

  const dataSelecionadaObj = new Date(diaSelecionado + "T12:00:00");
  const nomeDia = dataSelecionadaObj.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const diasDaSemana = getDiasSemana(diaSelecionado);
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas = Array(primeiroDia).fill(null).concat(Array.from({ length: diasNoMes }, (_, i) => i + 1));
  const hojeKey = toKey(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  // Horários já passados (só quando o dia selecionado é hoje). Compara "HH:mm"
  // como string (zero-padded) — slot vazio passado não é mais agendável.
  const ehHoje = diaSelecionado === hojeKey;
  const agoraHHmm = `${String(hoje.getHours()).padStart(2, "0")}:${String(hoje.getMinutes()).padStart(2, "0")}`;
  const horaPassada = (hora: string) => ehHoje && hora < agoraHHmm;

  // Nome do barbeiro alvo para exibir no header da grade
  const barberNameAlvo = verTodos
    ? funcionarios.find((f) => f.id === gradeBarberIdEfetivo)?.name ?? "Todos"
    : "Minha grade";

  // Dia totalmente bloqueado (todos os slots bloqueados manualmente)
  const diaTotalmenteBloqueado = todosSlotsDia.length > 0 && todosSlotsDia.every((h) => blockedSlots.includes(h));

  return (
    <div id="agenda-scroll" className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-slate-100">Agendamentos</h1>
        <button className="flex items-center gap-1.5 text-slate-200 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <div className="transform-gpu rounded-xl p-3 admin-glass-card">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Agendamentos</p>
          <p className="text-2xl font-bold admin-text-primary leading-none">{totalAgend}</p>
          <p className="text-[10px] admin-text-secondary mt-1 truncate capitalize">{nomeDia}</p>
        </div>
        <div className="transform-gpu rounded-xl p-3 admin-glass-card">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Horários Livres</p>
          <p className="text-2xl font-bold admin-text-primary leading-none">{livres}</p>
          <p className="text-[10px] admin-text-secondary mt-1">de {HORARIOS.length} no dia</p>
        </div>
        <div className="transform-gpu rounded-xl p-3 admin-glass-card-accent-emerald">
          <p className="text-[9px] font-semibold text-emerald-400 uppercase tracking-widest mb-1">Faturado</p>
          <p className="text-xl font-bold text-emerald-400 leading-none">R$ {faturado.toFixed(2).replace(".", ",")}</p>
          <p className="text-[10px] admin-text-secondary mt-1">{concluidos} concluídos</p>
        </div>
        <div className="transform-gpu rounded-xl p-3 admin-glass-card">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Caixa</p>
          <p className="text-xs font-semibold admin-text-secondary leading-none mt-0.5">🔒 Em aberto</p>
          <button className="text-[9px] text-gold font-semibold mt-1 uppercase tracking-widest">Ver no Financeiro</button>
        </div>
      </div>

      {/* Calendário compacto / expansível */}
      <div className="transform-gpu mx-4 mb-4 rounded-2xl overflow-hidden admin-glass-card">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button onClick={() => navMes(-1)} className="admin-text-secondary hover:opacity-80 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex items-center gap-1.5 text-sm font-semibold admin-text-primary hover:text-gold transition-colors"
          >
            {MESES[mes]} {ano}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandido ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => navMes(1)} className="admin-text-secondary hover:opacity-80 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 px-2 mb-1">
          {DIAS_SEMANA_CURTO.map((d, i) => (
            <p key={d} className={`text-center text-[11px] font-medium ${i === 0 ? "text-red-400" : "admin-text-secondary"}`}>{d}</p>
          ))}
        </div>

        <CalExpand expandido={!expandido}>
          <div className="overflow-hidden">
            <CalSlide key={`week-${calKey}`} dir={slideDir}>
              <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
                {diasDaSemana.map((d) => {
                  const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
                  const temAgend = !!agendamentos[key]?.some((a) => a.status !== "cancelado");
                  const isHoje = key === hojeKey;
                  const isSel = key === diaSelecionado;
                  const isDom = d.getDay() === 0;
                  return (
                    <button
                      key={key}
                      onClick={() => setDiaSelecionado(key)}
                      className={`flex flex-col items-center justify-center aspect-square md:aspect-auto md:w-12 md:h-12 md:mx-auto rounded-xl transition-colors ${isSel ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950" : isHoje ? "border border-gold/40 admin-text-primary" : "admin-glass-card-hover admin-text-secondary"}`}
                    >
                      <span className={`text-sm font-semibold ${isDom && !isSel ? "text-red-400" : ""}`}>{d.getDate()}</span>
                      {temAgend && <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </CalSlide>
          </div>
        </CalExpand>

        <CalExpand expandido={expandido}>
          <div className="overflow-hidden">
            <CalSlide key={`month-${calKey}`} dir={slideDir}>
              <div className="px-2 pb-4">
                <div className="grid grid-cols-7 gap-y-1">
                  {celulas.map((dia, i) => {
                    if (!dia) return <div key={`e-${i}`} />;
                    const key = toKey(ano, mes, dia);
                    const temAgend = !!agendamentos[key]?.some((a) => a.status !== "cancelado");
                    const temCaixa = !!agendamentos[key];
                    const isHoje = key === hojeKey;
                    const isSel = key === diaSelecionado;
                    const isDom = new Date(ano, mes, dia).getDay() === 0;
                    return (
                      <button
                        key={key}
                        onClick={() => selecionarDia(key)}
                        className={`relative flex flex-col items-center justify-center aspect-square md:aspect-auto md:w-12 md:h-12 md:mx-auto rounded-xl transition-colors ${isSel ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950" : isHoje ? "border border-gold/40 admin-text-primary" : "admin-glass-card-hover admin-text-secondary"}`}
                      >
                        <span className={`text-sm font-semibold ${isDom && !isSel ? "text-red-400" : ""}`}>{dia}</span>
                        {(temAgend || temCaixa) && (
                          <div className="flex gap-0.5 mt-0.5">
                            {temAgend && <span className="w-1 h-1 rounded-full bg-amber-400" />}
                            {temCaixa && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 admin-border-t">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] admin-text-secondary">agendamentos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] admin-text-secondary">caixa aberto</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-gold/40" />
                    <span className="text-[10px] admin-text-secondary">hoje</span>
                  </div>
                </div>
              </div>
            </CalSlide>
          </div>
        </CalExpand>
      </div>

      {/* Grade de horários */}
      <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card">
        {/* Header do card */}
        <div className="px-4 py-3 admin-border-b space-y-2.5">
          {/* Linha 1: título + ações */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="admin-text-secondary text-sm">⊞</span>
              <p className="text-sm font-bold admin-text-primary">Grade de horários</p>
            </div>
            <div className="flex items-center gap-2">
              {podeGerenciarGrade && (
                <>
                  {diaTotalmenteBloqueado ? (
                    <button
                      onClick={handleDesbloquearDia}
                      className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="Desbloquear dia inteiro"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Desbloquear dia</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmarBloqueio(true)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-red-400 hover:text-red-300 transition-colors"
                      title="Bloquear dia inteiro"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Bloquear dia</span>
                    </button>
                  )}
                  <button
                    onClick={() => setConfigurandoGrade(true)}
                    className="admin-surface-subtle hover:bg-gold/10 admin-text-secondary hover:text-gold rounded-lg p-1.5 transition-colors"
                    title="Configurar horários"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Linha 2: pills de barbeiro (só quando pode ver todos e há mais de 1) */}
          {verTodos && funcionarios.length > 1 && (
            <SeletorBarbeiro
              barbeiros={funcionarios}
              value={gradeBarberIdAlvo}
              onChange={setGradeBarberIdAlvo}
            />
          )}

          <p className="text-xs admin-text-secondary capitalize">{nomeDia} · Clique para agendar ou bloquear</p>
        </div>

        {/* Lista de slots */}
        {!dayConfig.open ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm admin-text-secondary">Dia fechado conforme a grade de horários.</p>
            {podeGerenciarGrade && (
              <button
                onClick={() => setConfigurandoGrade(true)}
                className="mt-2 text-xs text-gold hover:underline"
              >
                Configurar grade
              </button>
            )}
          </div>
        ) : (
          <ul className="admin-divide">
            {/* Slots bloqueados (aparece na lista para possibilitar desbloqueio) */}
            {blockedSlots
              .filter((h) => !agendPorHora[h]) // bloqueados sem agendamento por cima
              .sort()
              .map((hora) => (
                <li key={`blocked-${hora}`} className="flex items-center gap-4 px-4 py-3 opacity-50">
                  <div className="w-12 shrink-0">
                    <p className="text-sm font-mono font-semibold admin-text-secondary line-through">{hora}</p>
                    <p className="text-[10px] admin-text-secondary">bloqueado</p>
                  </div>
                  <p className="text-sm admin-text-secondary flex-1">Bloqueado</p>
                  {podeGerenciarGrade && (
                    <button
                      onClick={(e) => handleDesbloquearSlot(hora, e)}
                      className="flex items-center gap-1 admin-text-secondary hover:text-emerald-400 transition-colors text-xs"
                      title="Desbloquear slot"
                    >
                      <Unlock className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}

            {/* Slots disponíveis e agendados */}
            {HORARIOS.map((hora) => {
              const agend = agendPorHora[hora];

              if (agend) {
                const isConc = agend.status === "concluido";
                const destacado = destaqueHora === hora;
                return (
                  <li
                    key={hora}
                    id={`slot-${hora}`}
                    onClick={() => abrirAcao(agend)}
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${isConc ? "bg-emerald-400/5 hover:bg-emerald-400/10" : "bg-gold/5 hover:bg-gold/10"} ${destacado ? "ring-2 ring-gold ring-inset animate-pulse" : ""}`}
                  >
                    <div className="w-12 shrink-0">
                      <p className={`text-sm font-mono font-semibold ${isConc ? "text-emerald-400" : "text-gold"}`}>{hora}</p>
                      <p className="text-[10px] admin-text-secondary">0/1</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium admin-text-primary truncate">{agend.customerName}</p>
                      <p className="text-xs admin-text-secondary truncate">{agend.serviceName}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${isConc ? "bg-emerald-400/15 text-emerald-400" : "bg-gold/15 text-gold"}`}>
                      {isConc ? "Concluído" : "Agendado"}
                    </span>
                  </li>
                );
              }

              // Slot vazio cujo horário já passou (hoje): não é agendável.
              if (horaPassada(hora)) {
                return (
                  <li key={hora} id={`slot-${hora}`} className="flex items-center gap-4 px-4 py-3 opacity-40">
                    <div className="w-12 shrink-0">
                      <p className="text-sm font-mono font-semibold admin-text-secondary">{hora}</p>
                      <p className="text-[10px] admin-text-secondary">0/1</p>
                    </div>
                    <p className="text-sm admin-text-secondary flex-1">Horário encerrado</p>
                  </li>
                );
              }

              const destacado = destaqueHora === hora;
              return (
                <li key={hora} id={`slot-${hora}`} className={`admin-glass-card-hover flex items-center gap-4 px-4 py-3 transition-colors cursor-pointer ${destacado ? "ring-2 ring-gold ring-inset animate-pulse" : ""}`} onClick={() => setModal({ hora })}>
                  <div className="w-12 shrink-0">
                    <p className="text-sm font-mono font-semibold admin-text-primary">{hora}</p>
                    <p className="text-[10px] admin-text-secondary">0/1</p>
                  </div>
                  <p className="text-sm text-emerald-400 font-medium flex-1">Disponível</p>
                  <button className="flex items-center gap-1.5 admin-surface-subtle admin-text-primary text-xs px-3 py-1.5 rounded-lg hover:bg-gold/15 hover:text-gold transition-colors">
                    <Calendar className="w-3 h-3" /> Agendar
                  </button>
                  {podeGerenciarGrade && (
                    <button
                      onClick={(e) => handleBloquearSlot(hora, e)}
                      className="admin-text-secondary hover:text-red-400 transition-colors"
                      title="Bloquear este horário"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </li>
              );
            })}

            {HORARIOS.length === 0 && blockedSlots.length === 0 && (
              <li className="px-4 py-8 text-center">
                <p className="text-sm admin-text-secondary">Nenhum horário disponível neste dia.</p>
              </li>
            )}
          </ul>
        )}
      </div>

      <FabMenu
        onAgendar={(hora) => abrirNovoAgendamento(hora)}
        onLink={() => setLinkModal(true)}
        onEspera={() => setWaitlistModal(true)}
      />

      {/* Wizard de novo agendamento (4 passos, espelha o fluxo do cliente) */}
      {modal && (
        <NovoAgendamentoWizard
          initialDate={diaSelecionado}
          initialTime={modal.hora}
          initialBarberId={gradeBarberIdEfetivo ?? "qualquer"}
          initialName={modal.nome ?? ""}
          initialPhone={modal.telefone ?? ""}
          funcionarios={funcionarios}
          onClose={() => setModal(null)}
        />
      )}

      {/* Modal: Link de agendamento */}
      {linkModal && (
        <Modal onClose={() => setLinkModal(false)}>
          {(close) => (
            <>
              <ModalHeader title="Link de agendamento" onClose={close} />
              <div className="p-5 space-y-4">
                <p className="text-sm admin-text-secondary">
                  Compartilhe este link para o cliente agendar online pela página da barbearia.
                </p>
                <div className="admin-surface-subtle rounded-xl px-4 py-3 text-sm admin-text-primary break-all font-mono">
                  {linkAgendamento}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={copiarLink}
                    className="flex-1 admin-glass-card admin-glass-card-hover admin-text-primary py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {copiado ? <><Check className="w-4 h-4 text-emerald-400" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar link</>}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Agende seu horário na Barbearia Século XXI: ${linkAgendamento}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Modal: Lista de espera */}
      {waitlistModal && (
        <Modal onClose={() => setWaitlistModal(false)}>
          {(close) => (
            <>
              <ModalHeader title="Lista de espera" subtitle={`${waitlist.length} na fila`} onClose={close} />
              <div className="p-5 space-y-4">
                {/* Form de adicionar */}
                <div className="admin-surface-subtle rounded-xl p-3 space-y-2">
                  <input type="text" placeholder="Nome do cliente" value={waitForm.nome}
                    onChange={(e) => setWaitForm({ ...waitForm, nome: e.target.value })}
                    className="w-full admin-glass-card admin-input border border-transparent rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                  <div className="flex gap-2">
                    <input type="tel" placeholder="WhatsApp" value={waitForm.telefone}
                      onChange={(e) => setWaitForm({ ...waitForm, telefone: e.target.value })}
                      className="flex-1 admin-glass-card admin-input border border-transparent rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                    <input type="text" placeholder="Serviço (opcional)" value={waitForm.servico}
                      onChange={(e) => setWaitForm({ ...waitForm, servico: e.target.value })}
                      className="flex-1 admin-glass-card admin-input border border-transparent rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                  </div>
                  <button
                    onClick={adicionarEspera}
                    disabled={!waitForm.nome.trim()}
                    className="w-full bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-4 h-4" /> Adicionar à fila
                  </button>
                </div>

                {/* Fila */}
                {waitlist.length === 0 ? (
                  <p className="text-sm admin-text-secondary text-center py-6">Ninguém na fila de espera.</p>
                ) : (
                  <ul className="space-y-2 max-h-[40vh] overflow-y-auto">
                    {waitlist.map((entry, i) => (
                      <li key={entry.id} className="admin-surface-subtle rounded-xl p-3 flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium admin-text-primary truncate">{entry.customerName}</p>
                          <p className="text-xs admin-text-secondary truncate">
                            {entry.serviceName || "Sem serviço"}{entry.customerPhone ? ` · ${entry.customerPhone}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => chamarDaEspera(entry)}
                          className="shrink-0 bg-gold/15 text-gold hover:bg-gold/25 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          title="Chamar e agendar"
                        >
                          <Clock className="w-3.5 h-3.5" /> Chamar
                        </button>
                        <button
                          onClick={() => removeFromWaitlist(entry.id)}
                          className="shrink-0 admin-text-secondary hover:text-red-400 transition-colors"
                          title="Remover da fila"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Modal de ações de agendamento */}
      {acaoModal && (
        <Modal onClose={() => setAcaoModal(null)}>
          {(close) => (
            <>
              <ModalHeader title="Agendamento" onClose={close} />
              <div className="p-5 space-y-4">
                <div className="admin-surface-subtle rounded-xl p-4 space-y-1">
                  <p className="text-base font-bold admin-text-primary">{acaoModal.customerName}</p>
                  <p className="text-sm admin-text-secondary">{acaoModal.serviceName}</p>
                  <p className="text-sm admin-text-secondary">
                    {new Date(acaoModal.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "long" })} · {acaoModal.time}
                  </p>
                  <p className="text-xs admin-text-secondary pt-1">
                    {acaoModal.barberName} · {acaoModal.customerPhone || "sem telefone"}
                  </p>
                </div>

                {remarcando ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs admin-text-secondary mb-1 block">Nova data</label>
                      <input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)}
                        className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs admin-text-secondary mb-1 block">Novo horário</label>
                      <AdminSelect
                        value={novaHora}
                        onChange={setNovaHora}
                        options={HORARIOS.map((h) => ({ value: h, label: h }))}
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button onClick={() => setRemarcando(false)}
                        className="transform-gpu flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors">
                        Voltar
                      </button>
                      <button onClick={confirmarRemarcacao}
                        className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Confirmar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {acaoModal.customerPhone && (
                      <a href={buildWhatsappLink(acaoModal.customerPhone, acaoModal.customerName)}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full admin-surface-subtle rounded-xl px-4 py-3 hover:bg-emerald-400/10 transition-colors">
                        <span className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-semibold admin-text-primary">Falar no WhatsApp</p>
                          <p className="text-[11px] admin-text-secondary">Abre o chat com o cliente</p>
                        </div>
                      </a>
                    )}
                    <button onClick={() => setRemarcando(true)}
                      className="flex items-center gap-3 w-full admin-surface-subtle rounded-xl px-4 py-3 hover:bg-gold/10 transition-colors">
                      <span className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                        <CalendarClock className="w-4 h-4 text-gold" />
                      </span>
                      <div className="text-left">
                        <p className="text-sm font-semibold admin-text-primary">Remarcar</p>
                        <p className="text-[11px] admin-text-secondary">Mudar data ou horário</p>
                      </div>
                    </button>
                    <button onClick={confirmarCancelamento}
                      className="flex items-center gap-3 w-full admin-surface-subtle rounded-xl px-4 py-3 hover:bg-red-500/10 transition-colors">
                      <span className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </span>
                      <div className="text-left">
                        <p className="text-sm font-semibold admin-text-primary">Cancelar agendamento</p>
                        <p className="text-[11px] admin-text-secondary">Libera o horário</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Modal de configuração da grade */}
      {configurandoGrade && gradeBarberIdEfetivo && (
        <ConfigurarGradeModal
          barberId={gradeBarberIdEfetivo}
          barberName={barberNameAlvo}
          schedule={schedule}
          onClose={() => setConfigurandoGrade(false)}
        />
      )}

      {/* Confirmação: bloquear o dia inteiro */}
      {confirmarBloqueio && (
        <Modal onClose={() => setConfirmarBloqueio(false)}>
          {(close) => (
            <>
              <ModalHeader title="Bloquear o dia inteiro?" onClose={close} />
              <div className="p-5 space-y-4">
                <div className="admin-surface-subtle rounded-xl p-4">
                  <p className="text-sm admin-text-secondary leading-relaxed">
                    Todos os horários de <span className="admin-text-primary font-semibold capitalize">{nomeDia}</span>
                    {" "}ficarão <span className="text-red-400 font-semibold">indisponíveis</span> — somem da landing e ninguém consegue agendar. Você pode desbloquear depois.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={close} className="flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={executarBloqueioDia}
                    disabled={bloqueandoDia}
                    className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {bloqueandoDia ? "Bloqueando..." : <><Ban className="w-4 h-4" /> Bloquear dia</>}
                  </button>
                </div>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
