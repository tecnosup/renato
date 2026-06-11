"use client";

import { useState, useLayoutEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Scissors, TrendingDown, Lock, Plus, X, ChevronDown } from "lucide-react";
import { FaCashRegister } from "react-icons/fa";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

type Atendimento = { id: string; descricao: string; valor: number; profissional: string };
type DiaCaixa = {
  faturamento: number;
  gastos: number;
  atendimentos: Atendimento[];
  status: "fechado" | "aberto" | "pendente";
};

const CAIXAS: Record<string, DiaCaixa> = {
  "2026-06-02": {
    faturamento: 54.90, gastos: 0, status: "fechado",
    atendimentos: [
      { id: "1", descricao: "Corte Clássico", valor: 29.90, profissional: "Renato" },
      { id: "2", descricao: "Barba Completa", valor: 25.00, profissional: "Renato" },
    ],
  },
  "2026-05-14": {
    faturamento: 477.00, gastos: 120.00, status: "fechado",
    atendimentos: [{ id: "3", descricao: "Corte + Barba", valor: 477.00, profissional: "Renato" }],
  },
  "2026-05-13": {
    faturamento: 81.50, gastos: 0, status: "fechado",
    atendimentos: [
      { id: "4", descricao: "Corte Clássico", valor: 29.90, profissional: "Franciele" },
      { id: "5", descricao: "Barba Completa", valor: 25.00, profissional: "Franciele" },
      { id: "6", descricao: "Raspadão", valor: 26.60, profissional: "Xavier" },
    ],
  },
  "2026-05-29": { faturamento: 0, gastos: 0, atendimentos: [], status: "pendente" },
  "2026-05-16": { faturamento: 0, gastos: 0, atendimentos: [], status: "pendente" },
};

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function getDiasSemana(diaKey: string) {
  const base = new Date(diaKey + "T12:00:00");
  const dow = base.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - dow + i);
    return d;
  });
}

// Componente que anima a entrada do calendário (slide in do lado certo)
function CalSlide({ dir, children }: { dir: "left" | "right"; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = dir === "right" ? "100%" : "-100%";
    el.style.transition = "none";
    el.style.transform = `translateX(${from})`;
    el.getBoundingClientRect(); // força reflow
    el.style.transition = "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    el.style.transform = "translateX(0)";
  }, [dir]);

  return <div ref={ref}>{children}</div>;
}

export default function CaixaPage() {
  const hoje = new Date();
  const hojeKey = toKey(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(hojeKey);
  const [expandido, setExpandido] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [calKey, setCalKey] = useState(0);

  const navMes = (dir: number) => {
    setSlideDir(dir > 0 ? "right" : "left");
    setCalKey((k) => k + 1);
    if (expandido) {
      const d = new Date(ano, mes + dir, 1);
      setMes(d.getMonth());
      setAno(d.getFullYear());
    } else {
      // compacto: navega semanas
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

  const caixa = CAIXAS[diaSelecionado];
  const liquido = caixa ? caixa.faturamento - caixa.gastos : 0;
  const isHoje = diaSelecionado === hojeKey;

  const dataFormatada = new Date(diaSelecionado + "T12:00:00")
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const diasDaSemana = getDiasSemana(diaSelecionado);
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas = Array(primeiroDia).fill(null).concat(
    Array.from({ length: diasNoMes }, (_, i) => i + 1)
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
          <FaCashRegister className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-100 leading-none">Caixa</p>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
            Fechamentos e gastos por dia
          </p>
        </div>
      </div>

      {/* Card único: calendário + painel do dia */}
      <div className="mx-4 mb-24 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">

        {/* Header do calendário */}
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

        {/* Cabeçalho dias da semana */}
        <div className="grid grid-cols-7 px-2 mb-1">
          {DIAS_SEMANA.map((d, i) => (
            <p key={d} className={`text-center text-[11px] font-medium ${i === 0 ? "text-red-400" : "text-slate-500"}`}>{d}</p>
          ))}
        </div>

        {/* Strip semanal (recolhido) */}
        {!expandido && (
          <div className="overflow-hidden">
          <CalSlide key={calKey} dir={slideDir}>
          <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
            {diasDaSemana.map((d) => {
              const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
              const dados = CAIXAS[key];
              const isSel = key === diaSelecionado;
              const isToday = key === hojeKey;
              const isDom = d.getDay() === 0;
              return (
                <button key={key} onClick={() => setDiaSelecionado(key)}
                  className={`flex flex-col items-center justify-center aspect-square rounded-xl transition-colors ${
                    isSel ? "bg-blue-500 text-white" : isToday ? "border border-blue-500 text-slate-100" : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isDom && !isSel ? "text-red-400" : ""}`}>{d.getDate()}</span>
                  {dados && <span className={`w-1 h-1 rounded-full mt-0.5 ${dados.status === "pendente" ? "bg-orange-400" : dados.faturamento > 0 ? "bg-emerald-400" : "bg-slate-600"}`} />}
                </button>
              );
            })}
          </div>
          </CalSlide>
          </div>
        )}

        {/* Grade mensal (expandido) */}
        {expandido && (
          <div className="overflow-hidden">
          <CalSlide key={calKey} dir={slideDir}>
          <div className="px-2 pb-3">
            <div className="grid grid-cols-7 gap-y-1">
              {celulas.map((dia, i) => {
                if (!dia) return <div key={`e-${i}`} />;
                const key = toKey(ano, mes, dia);
                const dados = CAIXAS[key];
                const isSel = key === diaSelecionado;
                const isToday = key === hojeKey;
                const isDom = new Date(ano, mes, dia).getDay() === 0;
                return (
                  <button key={key} onClick={() => selecionarDia(key)}
                    className={`flex flex-col items-center justify-center aspect-square rounded-xl transition-colors ${
                      isSel ? "bg-blue-500 text-white" : isToday ? "border border-blue-500 text-slate-100" : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${isDom && !isSel ? "text-red-400" : ""}`}>{dia}</span>
                    {dados && <span className={`w-1 h-1 rounded-full mt-0.5 ${dados.status === "pendente" ? "bg-orange-400" : dados.faturamento > 0 ? "bg-emerald-400" : "bg-slate-600"}`} />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[10px] text-slate-400">caixa fechado</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" /><span className="text-[10px] text-slate-400">pendente</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-blue-500" /><span className="text-[10px] text-slate-400">hoje</span></div>
            </div>
          </div>
          </CalSlide>
          </div>
        )}

        {/* Data + status */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-t border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-slate-100">{dataFormatada}</span>
            {caixa?.status === "fechado" && (
              <span className="flex items-center gap-1 text-[10px] font-bold border border-slate-600 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest">
                <Lock className="w-2.5 h-2.5" /> Fechado
              </span>
            )}
            {caixa?.status === "pendente" && (
              <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Pendente
              </span>
            )}
            {isHoje && !caixa && (
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Hoje
              </span>
            )}
          </div>
          {!isHoje && (
            <button
              onClick={() => {
                const dir = diaSelecionado < hojeKey ? "right" : "left";
                setSlideDir(dir);
                setCalKey((k) => k + 1);
                setDiaSelecionado(hojeKey);
              }}
              className="text-slate-500 hover:text-slate-300 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 border-t border-slate-800">
          <div className="px-4 py-3">
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Faturamento</p>
            <p className="text-base font-bold text-slate-100">R$ {fmt(caixa?.faturamento ?? 0)}</p>
          </div>
          <div className="px-4 py-3 border-x border-slate-800">
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Gastos</p>
            <p className={`text-base font-bold ${(caixa?.gastos ?? 0) > 0 ? "text-red-400" : "text-slate-100"}`}>
              R$ {fmt(caixa?.gastos ?? 0)}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Líquido</p>
            <p className={`text-base font-bold ${liquido > 0 ? "text-emerald-400" : liquido < 0 ? "text-red-400" : "text-slate-100"}`}>
              R$ {fmt(liquido)}
            </p>
          </div>
        </div>

        {/* Atendimentos */}
        {caixa && caixa.atendimentos.length > 0 && (
          <ul className="border-t border-slate-800 divide-y divide-slate-800/60">
            {caixa.atendimentos.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Scissors className="w-3 h-3 text-amber-400" />
                  </div>
                  <p className="text-sm text-slate-200 truncate">
                    <span className="font-bold">{a.profissional}</span>
                    <span className="text-slate-500"> · </span>
                    {a.descricao}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-200 shrink-0">{fmt(a.valor)}</span>
              </li>
            ))}
          </ul>
        )}
        {(!caixa || caixa.atendimentos.length === 0) && (
          <p className="px-4 pb-3 pt-1 text-sm text-slate-600 border-t border-slate-800">
            Nenhum atendimento registrado neste dia.
          </p>
        )}

        {/* Botões */}
        <div className="flex flex-col gap-2 px-4 pb-4 pt-3 border-t border-slate-800">
          {caixa?.status === "fechado" ? (
            <>
              <button className="flex items-center justify-center gap-2 w-full border border-red-700/40 text-red-400 hover:bg-red-500/10 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-colors">
                <TrendingDown className="w-4 h-4" /> Despesa do Dia
              </button>
              <button className="flex items-center justify-center gap-2 w-full border border-slate-700 text-slate-400 hover:bg-slate-800 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-colors">
                <Lock className="w-4 h-4" /> Reabrir Caixa
              </button>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center gap-1 border border-amber-600/40 text-amber-400 hover:bg-amber-500/10 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors">
                <Plus className="w-4 h-4" /> Novo Atend.
              </button>
              <button className="flex flex-col items-center gap-1 border border-red-700/40 text-red-400 hover:bg-red-500/10 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors">
                <TrendingDown className="w-4 h-4" /> Despesa
              </button>
              <button className="flex flex-col items-center gap-1 border border-slate-700 text-slate-400 hover:bg-slate-800 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors">
                <Lock className="w-4 h-4" /> Fechar Caixa
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
