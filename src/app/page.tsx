"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Calendar, Ban, X, Plus, Link2, FileText, ListOrdered, ChevronDown } from "lucide-react";

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
      {open && <div className="fixed inset-0 z-30 md:hidden" onClick={() => setOpen(false)} />}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 md:hidden">
        {open && (
          <div className="flex flex-col items-end gap-2">
            {fabActions.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => { setOpen(false); if (label === "Agendar horário") onAgendar(""); }}
                className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-100 pl-4 pr-3 py-2.5 rounded-full shadow-lg transition-colors text-sm font-medium"
              >
                {label}
                <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-300" />
                </span>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center shadow-xl transition-all"
        >
          {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>
    </>
  );
}

// --- Dados mockados ---
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
  const [modal, setModal] = useState<{ hora: string } | null>(null);
  const [form, setForm] = useState({ cliente: "", whatsapp: "", servico: "Corte Clássico", preco: "45", barbeiro: "Qualquer disponível" });

  const navMes = (dir: number) => {
    const d = new Date(ano, mes + dir, 1);
    setMes(d.getMonth());
    setAno(d.getFullYear());
  };

  const selecionarDia = (key: string) => {
    setDiaSelecionado(key);
    setExpandido(false);
  };

  // Dados do dia selecionado
  const agendDia = AGENDAMENTOS[diaSelecionado] ?? [];
  const agendPorHora: Record<string, typeof agendDia[0]> = {};
  agendDia.forEach((a) => { agendPorHora[a.hora] = a; });

  const totalAgend = agendDia.filter((a) => a.status !== "bloqueado").length;
  const concluidos = agendDia.filter((a) => a.status === "concluido").length;
  const faturado = concluidos * 65;
  const livres = HORARIOS.length - agendDia.length;

  const dataSelecionadaObj = new Date(diaSelecionado + "T12:00:00");
  const nomeDia = dataSelecionadaObj.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  // Semana do dia selecionado
  const diasDaSemana = getDiasSemana(diaSelecionado);

  // Grid do mês
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas = Array(primeiroDia).fill(null).concat(Array.from({ length: diasNoMes }, (_, i) => i + 1));

  const hojeKey = toKey(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  return (
    <div id="agenda-scroll" className="flex-1 overflow-y-auto bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-slate-100">Agendamentos</h1>
        <button className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <div className="rounded-xl p-3 bg-linear-to-br from-slate-800/80 to-slate-900/60">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Agendamentos</p>
          <p className="text-2xl font-bold text-slate-100 leading-none">{totalAgend}</p>
          <p className="text-[10px] text-slate-500 mt-1 truncate capitalize">{nomeDia}</p>
        </div>
        <div className="rounded-xl p-3 bg-linear-to-br from-slate-800/80 to-slate-900/60">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Horários Livres</p>
          <p className="text-2xl font-bold text-slate-100 leading-none">{livres}</p>
          <p className="text-[10px] text-slate-500 mt-1">de {HORARIOS.length} no dia</p>
        </div>
        <div className="rounded-xl p-3 bg-linear-to-br from-emerald-950/60 to-slate-900/60">
          <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-widest mb-1">Faturado</p>
          <p className="text-xl font-bold text-emerald-400 leading-none">R$ {faturado.toFixed(2).replace(".", ",")}</p>
          <p className="text-[10px] text-slate-500 mt-1">{concluidos} concluídos</p>
        </div>
        <div className="rounded-xl p-3 bg-linear-to-br from-slate-800/80 to-slate-900/60">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Caixa</p>
          <p className="text-xs font-semibold text-slate-300 leading-none mt-0.5">🔒 Em aberto</p>
          <button className="text-[9px] text-blue-400 font-semibold mt-1 uppercase tracking-widest">Ver no Financeiro</button>
        </div>
      </div>

      {/* Calendário compacto / expansível */}
      <div className="mx-4 mb-4 rounded-2xl overflow-hidden bg-linear-to-br from-slate-800/80 to-slate-900/60">

        {/* Header do card — sempre visível */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button onClick={() => navMes(-1)} className="text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-100 hover:text-blue-400 transition-colors"
          >
            {MESES[mes]} {ano}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandido ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => navMes(1)} className="text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Cabeçalho dias semana — sempre visível */}
        <div className="grid grid-cols-7 px-2 mb-1">
          {DIAS_SEMANA_CURTO.map((d, i) => (
            <p key={d} className={`text-center text-[11px] font-medium ${i === 0 ? "text-red-400" : "text-slate-500"}`}>{d}</p>
          ))}
        </div>

        {/* Strip de dias da semana — visível quando recolhido */}
        {!expandido && (
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
                  className={`flex flex-col items-center justify-center aspect-square rounded-xl transition-colors ${
                    isSel ? "bg-blue-500 text-white" : isHoje ? "border border-blue-500 text-slate-100" : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isDom && !isSel ? "text-red-400" : ""}`}>{d.getDate()}</span>
                  {temAgend && <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Grid mensal completo — visível quando expandido */}
        {expandido && (
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
                    className={`relative flex flex-col items-center justify-center aspect-square rounded-xl transition-colors ${
                      isSel ? "bg-blue-500 text-white" : isHoje ? "border border-blue-500 text-slate-100" : "hover:bg-slate-800 text-slate-300"
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

            {/* Legenda */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[10px] text-slate-400">agendamentos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-slate-400">caixa aberto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-blue-500" />
                <span className="text-[10px] text-slate-400">hoje</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grade de horários */}
      <div className="mx-4 mb-24 rounded-2xl overflow-hidden bg-linear-to-br from-slate-800/80 to-slate-900/60">
        <div className="px-4 py-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">⊞</span>
            <p className="text-sm font-bold text-slate-100">Grade de horários</p>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 capitalize">{nomeDia} · Clique para agendar ou bloquear</p>
        </div>

        <ul className="divide-y divide-slate-800/60">
          {HORARIOS.map((hora) => {
            const agend = agendPorHora[hora];

            if (agend?.status === "bloqueado") {
              return (
                <li key={hora} className="flex items-center gap-4 px-4 py-3 bg-slate-800/50">
                  <div className="w-12 shrink-0">
                    <p className="text-sm font-mono font-semibold text-slate-500">{hora}</p>
                    <p className="text-[10px] text-slate-600">bloqueado</p>
                  </div>
                  <p className="text-sm text-slate-500 italic flex-1">Agenda bloqueada</p>
                  <Ban className="w-4 h-4 text-slate-600" />
                </li>
              );
            }

            if (agend) {
              const isConc = agend.status === "concluido";
              return (
                <li key={hora} className={`flex items-center gap-4 px-4 py-3 ${isConc ? "bg-emerald-500/5" : "bg-blue-500/5"}`}>
                  <div className="w-12 shrink-0">
                    <p className={`text-sm font-mono font-semibold ${isConc ? "text-emerald-400" : "text-blue-400"}`}>{hora}</p>
                    <p className="text-[10px] text-slate-500">0/1</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{agend.cliente}</p>
                    <p className="text-xs text-slate-400 truncate">{agend.servico}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${isConc ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>
                    {isConc ? "Concluído" : "Agendado"}
                  </span>
                </li>
              );
            }

            return (
              <li key={hora} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800/40 transition-colors cursor-pointer" onClick={() => setModal({ hora })}>
                <div className="w-12 shrink-0">
                  <p className="text-sm font-mono font-semibold text-slate-400">{hora}</p>
                  <p className="text-[10px] text-slate-600">0/1</p>
                </div>
                <p className="text-sm text-emerald-400 font-medium flex-1">Disponível</p>
                <button className="flex items-center gap-1.5 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg hover:border-blue-500 hover:text-blue-400 transition-colors">
                  <Calendar className="w-3 h-3" /> Agendar
                </button>
                <button className="text-slate-600 hover:text-red-400 transition-colors">
                  <Ban className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* FAB mobile */}
      <FabMenu onAgendar={(hora) => setModal({ hora })} />

      {/* Modal novo agendamento */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModal(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6 pb-10 md:pb-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-base font-bold text-slate-100">Novo agendamento presencial</h3>
                {modal.hora && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {dataSelecionadaObj.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })} às {modal.hora}
                  </p>
                )}
              </div>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nome do cliente</label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={form.cliente}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">WhatsApp (opcional)</label>
                <input
                  type="tel"
                  placeholder="11999999999"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Serviço</label>
                <select
                  value={form.servico}
                  onChange={(e) => setForm({ ...form, servico: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {SERVICOS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Preço (R$)</label>
                <input
                  type="number"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Barbeiro</label>
                <select
                  value={form.barbeiro}
                  onChange={(e) => setForm({ ...form, barbeiro: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option>Qualquer disponível</option>
                  <option>Renato</option>
                  <option>Franciele</option>
                  <option>Xavier</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={() => setModal(null)} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 py-3 rounded-xl text-sm font-semibold transition-colors">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
