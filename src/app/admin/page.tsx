"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Calendar, Ban, X, Plus, Link2, FileText, ListOrdered, ChevronDown } from "lucide-react";

// Componente que anima a entrada do calendário (slide + fade do lado certo)
function CalSlide({ dir, children }: { dir: "left" | "right"; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = dir === "right" ? "24px" : "-24px";
    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = `translateX(${from})`;
    el.getBoundingClientRect(); // força reflow
    el.style.transition = "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s ease-out";
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
  }, [dir]);

  return <div ref={ref}>{children}</div>;
}

// Anima a transição entre o modo semanal (recolhido) e mensal (expandido)
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

function FabMenu({ onAgendar }: { onAgendar: (hora: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <div className="transform-gpu fixed inset-0 z-30 backdrop-blur-[2px] bg-black/10 md:hidden" onClick={() => setOpen(false)} />}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 md:hidden">
        <div className="flex flex-col items-end gap-2">
          {fabActions.map(({ label, icon: Icon }, i) => (
            <button
              key={label}
              onClick={() => { setOpen(false); if (label === "Agendar horário") onAgendar(""); }}
              style={{
                transitionDelay: open ? `${i * 30}ms` : "0ms",
                transformOrigin: "bottom right",
              }}
              className={`transform-gpu flex items-center gap-3 admin-glass-card admin-glass-card-hover admin-text-primary pl-4 pr-3 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-75 translate-y-2 pointer-events-none"
              }`}
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

const AGENDAMENTOS: Record<string, { hora: string; cliente: string; servico: string; status: "agendado" | "bloqueado" | "concluido" }[]> = {
  "2026-06-08": [
    { hora: "09:00", cliente: "João Silva", servico: "Corte + Barba", status: "concluido" },
    { hora: "10:00", cliente: "Pedro Alves", servico: "Corte", status: "agendado" },
    { hora: "11:00", cliente: "", servico: "", status: "bloqueado" },
    { hora: "14:00", cliente: "Rafael M.", servico: "Barba", status: "agendado" },
  ],
  "2026-06-10": [
    { hora: "09:00", cliente: "Lucas Costa", servico: "Corte", status: "agendado" },
    { hora: "10:30", cliente: "Marcos P.", servico: "Corte + Barba", status: "agendado" },
  ],
  "2026-06-11": [
    { hora: "13:00", cliente: "Felipe A.", servico: "Barba", status: "agendado" },
  ],
};

const HORARIOS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];
const SERVICOS = ["Corte Clássico", "Corte + Barba", "Barba", "Degradê", "Corte Máquina"];
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

export default function AgendaPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(toKey(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  const [expandido, setExpandido] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [calKey, setCalKey] = useState(0);
  const [modal, setModal] = useState<{ hora: string } | null>(null);
  const [form, setForm] = useState({ cliente: "", whatsapp: "", servico: "Corte Clássico", preco: "45", barbeiro: "Qualquer disponível" });

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

  const agendDia = AGENDAMENTOS[diaSelecionado] ?? [];
  const agendPorHora: Record<string, typeof agendDia[0]> = {};
  agendDia.forEach((a) => { agendPorHora[a.hora] = a; });

  const totalAgend = agendDia.filter((a) => a.status !== "bloqueado").length;
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

        {/* Strip semanal (recolhido) */}
        <CalExpand expandido={!expandido}>
          <div className="overflow-hidden">
          <CalSlide key={`week-${calKey}`} dir={slideDir}>
          <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
            {diasDaSemana.map((d) => {
              const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
              const temAgend = !!AGENDAMENTOS[key]?.some((a) => a.status !== "bloqueado");
              const isHoje = key === hojeKey;
              const isSel = key === diaSelecionado;
              const isDom = d.getDay() === 0;
              return (
                <button
                  key={key}
                  onClick={() => setDiaSelecionado(key)}
                  className={`flex flex-col items-center justify-center aspect-square md:aspect-auto md:w-12 md:h-12 md:mx-auto rounded-xl transition-colors ${
                    isSel ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950" : isHoje ? "border border-gold/40 admin-text-primary" : "admin-glass-card-hover admin-text-secondary"
                  }`}
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

        {/* Grade mensal (expandido) */}
        <CalExpand expandido={expandido}>
          <div className="overflow-hidden">
          <CalSlide key={`month-${calKey}`} dir={slideDir}>
          <div className="px-2 pb-4">
            <div className="grid grid-cols-7 gap-y-1">
              {celulas.map((dia, i) => {
                if (!dia) return <div key={`e-${i}`} />;
                const key = toKey(ano, mes, dia);
                const temAgend = !!AGENDAMENTOS[key]?.some((a) => a.status !== "bloqueado");
                const temCaixa = !!AGENDAMENTOS[key];
                const isHoje = key === hojeKey;
                const isSel = key === diaSelecionado;
                const isDom = new Date(ano, mes, dia).getDay() === 0;
                return (
                  <button
                    key={key}
                    onClick={() => selecionarDia(key)}
                    className={`relative flex flex-col items-center justify-center aspect-square md:aspect-auto md:w-12 md:h-12 md:mx-auto rounded-xl transition-colors ${
                      isSel ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950" : isHoje ? "border border-gold/40 admin-text-primary" : "admin-glass-card-hover admin-text-secondary"
                    }`}
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
        <div className="px-4 py-3 admin-border-b">
          <div className="flex items-center gap-2">
            <span className="admin-text-secondary text-sm">⊞</span>
            <p className="text-sm font-bold admin-text-primary">Grade de horários</p>
          </div>
          <p className="text-xs admin-text-secondary mt-0.5 capitalize">{nomeDia} · Clique para agendar ou bloquear</p>
        </div>

        <ul className="admin-divide">
          {HORARIOS.map((hora) => {
            const agend = agendPorHora[hora];

            if (agend?.status === "bloqueado") {
              return (
                <li key={hora} className="flex items-center gap-4 px-4 py-3 admin-surface-subtle">
                  <div className="w-12 shrink-0">
                    <p className="text-sm font-mono font-semibold admin-text-secondary">{hora}</p>
                    <p className="text-[10px] admin-text-secondary">bloqueado</p>
                  </div>
                  <p className="text-sm admin-text-secondary italic flex-1">Agenda bloqueada</p>
                  <Ban className="w-4 h-4 admin-text-secondary" />
                </li>
              );
            }

            if (agend) {
              const isConc = agend.status === "concluido";
              return (
                <li key={hora} className={`flex items-center gap-4 px-4 py-3 ${isConc ? "bg-emerald-400/5" : "bg-gold/5"}`}>
                  <div className="w-12 shrink-0">
                    <p className={`text-sm font-mono font-semibold ${isConc ? "text-emerald-400" : "text-gold"}`}>{hora}</p>
                    <p className="text-[10px] admin-text-secondary">0/1</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium admin-text-primary truncate">{agend.cliente}</p>
                    <p className="text-xs admin-text-secondary truncate">{agend.servico}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${isConc ? "bg-emerald-400/15 text-emerald-400" : "bg-gold/15 text-gold"}`}>
                    {isConc ? "Concluído" : "Agendado"}
                  </span>
                </li>
              );
            }

            return (
              <li key={hora} className="admin-glass-card-hover flex items-center gap-4 px-4 py-3 transition-colors cursor-pointer" onClick={() => setModal({ hora })}>
                <div className="w-12 shrink-0">
                  <p className="text-sm font-mono font-semibold admin-text-primary">{hora}</p>
                  <p className="text-[10px] admin-text-secondary">0/1</p>
                </div>
                <p className="text-sm text-emerald-400 font-medium flex-1">Disponível</p>
                <button className="flex items-center gap-1.5 admin-surface-subtle admin-text-primary text-xs px-3 py-1.5 rounded-lg hover:bg-gold/15 hover:text-gold transition-colors">
                  <Calendar className="w-3 h-3" /> Agendar
                </button>
                <button className="admin-text-secondary hover:text-red-400 transition-colors">
                  <Ban className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <FabMenu onAgendar={(hora) => setModal({ hora })} />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="transform-gpu absolute inset-0 bg-black/10" onClick={() => setModal(null)} />
          <div className="transform-gpu relative admin-glass-modal rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6 pb-10 md:pb-6 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-base font-bold admin-text-primary">Novo agendamento presencial</h3>
                {modal.hora && (
                  <p className="text-xs admin-text-secondary mt-0.5">
                    {dataSelecionadaObj.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} às {modal.hora}
                  </p>
                )}
              </div>
              <button onClick={() => setModal(null)} className="admin-text-secondary hover:opacity-80 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs admin-text-secondary mb-1 block">Nome do cliente</label>
                <input type="text" placeholder="Ex: João Silva" value={form.cliente}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                  className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs admin-text-secondary mb-1 block">WhatsApp (opcional)</label>
                <input type="tel" placeholder="11999999999" value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs admin-text-secondary mb-1 block">Serviço</label>
                <select value={form.servico} onChange={(e) => setForm({ ...form, servico: e.target.value })}
                  className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors">
                  {SERVICOS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs admin-text-secondary mb-1 block">Preço (R$)</label>
                <input type="number" value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs admin-text-secondary mb-1 block">Barbeiro</label>
                <select value={form.barbeiro} onChange={(e) => setForm({ ...form, barbeiro: e.target.value })}
                  className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors">
                  <option>Qualquer disponível</option>
                  <option>Renato</option>
                  <option>Franciele</option>
                  <option>Xavier</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className="transform-gpu flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors">Cancelar</button>
              <button onClick={() => setModal(null)} className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-semibold transition-all">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
