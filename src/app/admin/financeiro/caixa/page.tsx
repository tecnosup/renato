"use client";

import { useState, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Scissors, TrendingDown, Lock, Plus, X, ChevronDown, Banknote, CreditCard, QrCode, Trash2, Check } from "lucide-react";
import { FaCashRegister } from "react-icons/fa";
import { Modal } from "@/components/ui/Modal";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const FORMAS_PAGAMENTO = ["Dinheiro", "Pix", "Cartão Débito", "Cartão Crédito"] as const;
type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

const PAGAMENTO_ICONS: Record<FormaPagamento, React.ElementType> = {
  "Dinheiro": Banknote,
  "Pix": QrCode,
  "Cartão Débito": CreditCard,
  "Cartão Crédito": CreditCard,
};

type ItemComanda = { descricao: string; valor: number };
type Comanda = {
  id: string;
  cliente: string;
  profissional: string;
  itens: ItemComanda[];
  formaPagamento?: FormaPagamento;
  status: "aberta" | "fechada";
};
type Despesa = { id: string; descricao: string; valor: number };
type DiaCaixa = {
  comandas: Comanda[];
  despesas: Despesa[];
  status: "fechado" | "aberto" | "pendente";
};

const CAIXAS_INICIAL: Record<string, DiaCaixa> = {
  "2026-06-02": {
    status: "fechado",
    comandas: [
      {
        id: "1", cliente: "João Pedro", profissional: "Renato", formaPagamento: "Pix", status: "fechada",
        itens: [{ descricao: "Corte Clássico", valor: 29.90 }, { descricao: "Barba Completa", valor: 25.00 }],
      },
    ],
    despesas: [],
  },
  "2026-05-14": {
    status: "fechado",
    comandas: [
      {
        id: "3", cliente: "Marcos Lima", profissional: "Renato", formaPagamento: "Cartão Crédito", status: "fechada",
        itens: [{ descricao: "Corte + Barba", valor: 477.00 }],
      },
    ],
    despesas: [{ id: "d1", descricao: "Material de limpeza", valor: 120.00 }],
  },
  "2026-05-13": {
    status: "fechado",
    comandas: [
      {
        id: "4", cliente: "Carlos Eduardo", profissional: "Franciele", formaPagamento: "Dinheiro", status: "fechada",
        itens: [{ descricao: "Corte Clássico", valor: 29.90 }, { descricao: "Barba Completa", valor: 25.00 }],
      },
      {
        id: "6", cliente: "Bruno Souza", profissional: "Xavier", formaPagamento: "Pix", status: "fechada",
        itens: [{ descricao: "Raspadão", valor: 26.60 }],
      },
    ],
    despesas: [],
  },
  "2026-05-29": { comandas: [], despesas: [], status: "pendente" },
  "2026-05-16": { comandas: [], despesas: [], status: "pendente" },
};

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function totalComanda(c: Comanda) {
  return c.itens.reduce((s, i) => s + i.valor, 0);
}
function totalFaturamento(dia: DiaCaixa) {
  return dia.comandas.filter((c) => c.status === "fechada").reduce((s, c) => s + totalComanda(c), 0);
}
function totalDespesas(dia: DiaCaixa) {
  return dia.despesas.reduce((s, d) => s + d.valor, 0);
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

// Modal de Fechar/Pagar Comanda
function FecharComandaModal({
  comanda,
  onClose,
  onConfirmar,
}: {
  comanda: Comanda;
  onClose: () => void;
  onConfirmar: (forma: FormaPagamento) => void;
}) {
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("Dinheiro");
  const total = totalComanda(comanda);

  return (
    <Modal onClose={onClose}>
      {(close) => (
        <>
          <div className="admin-border-b flex items-center justify-between px-4 pt-4 pb-3">
            <h2 className="text-base font-bold admin-text-primary">Fechar Comanda</h2>
            <button onClick={close} className="admin-text-secondary hover:opacity-80">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="admin-surface-subtle transform-gpu rounded-xl px-3 py-2.5">
              <p className="text-sm font-bold admin-text-primary">{comanda.cliente}</p>
              <p className="text-xs admin-text-secondary">
                {comanda.profissional} · {comanda.itens.map((i) => i.descricao).join(", ")}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                {FORMAS_PAGAMENTO.map((forma) => {
                  const Icon = PAGAMENTO_ICONS[forma];
                  const ativo = formaPagamento === forma;
                  return (
                    <button
                      key={forma}
                      onClick={() => setFormaPagamento(forma)}
                      className={`transform-gpu flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        ativo ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950" : "admin-surface-subtle admin-text-secondary hover:opacity-80"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {forma}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="admin-border-t flex items-center justify-between pt-2">
              <span className="text-sm font-semibold admin-text-secondary">Total</span>
              <span className="text-lg font-bold admin-text-primary">R$ {fmt(total)}</span>
            </div>

            <button
              onClick={() => onConfirmar(formaPagamento)}
              className="w-full bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-bold transition-all"
            >
              Confirmar Pagamento
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// Modal de Nova Despesa
function NovaDespesaModal({
  onClose,
  onSalvar,
}: {
  onClose: () => void;
  onSalvar: (d: Despesa) => void;
}) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const podeSalvar = descricao.trim() && Number(valor.replace(",", ".")) > 0;

  const salvar = (close: () => void) => {
    onSalvar({ id: `d-${Date.now()}`, descricao: descricao.trim(), valor: Number(valor.replace(",", ".")) });
    close();
  };

  return (
    <Modal onClose={onClose}>
      {(close) => (
        <>
          <div className="admin-border-b flex items-center justify-between px-4 pt-4 pb-3">
            <h2 className="text-base font-bold admin-text-primary">Nova Despesa</h2>
            <button onClick={close} className="admin-text-secondary hover:opacity-80">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <label className="block text-[10px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Descrição</label>
              <input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Material de limpeza"
                className="admin-surface-subtle admin-input transform-gpu w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Valor</label>
              <input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                className="admin-surface-subtle admin-input transform-gpu w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400/50"
              />
            </div>

            <button
              onClick={() => salvar(close)}
              disabled={!podeSalvar}
              className="transform-gpu w-full bg-red-400/15 backdrop-blur-md hover:bg-red-400/20 disabled:bg-white/5 disabled:text-slate-600 text-red-400 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors"
            >
              Salvar Despesa
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default function CaixaPage() {
  const hoje = new Date();
  const hojeKey = toKey(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const [caixas, setCaixas] = useState<Record<string, DiaCaixa>>(CAIXAS_INICIAL);
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(hojeKey);
  const [expandido, setExpandido] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [calKey, setCalKey] = useState(0);
  const [modalAberto, setModalAberto] = useState<"comanda" | "despesa" | null>(null);
  const [comandaParaFechar, setComandaParaFechar] = useState<Comanda | null>(null);
  const [confirmarFechamento, setConfirmarFechamento] = useState(false);

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

  const getCaixaDoDia = (key: string): DiaCaixa =>
    caixas[key] ?? { comandas: [], despesas: [], status: key === hojeKey ? "aberto" : "pendente" };

  const caixa = getCaixaDoDia(diaSelecionado);
  const faturamento = totalFaturamento(caixa);
  const gastos = totalDespesas(caixa);
  const liquido = faturamento - gastos;
  const isHoje = diaSelecionado === hojeKey;
  const caixaExiste = Boolean(caixas[diaSelecionado]);
  const comandasAbertas = caixa.comandas.filter((c) => c.status === "aberta");
  const comandasFechadas = caixa.comandas.filter((c) => c.status === "fechada");

  const dataFormatada = new Date(diaSelecionado + "T12:00:00")
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const diasDaSemana = getDiasSemana(diaSelecionado);
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas = Array(primeiroDia).fill(null).concat(
    Array.from({ length: diasNoMes }, (_, i) => i + 1)
  );

  const atualizarDia = (key: string, fn: (dia: DiaCaixa) => DiaCaixa) => {
    setCaixas((prev) => {
      const atual = prev[key] ?? { comandas: [], despesas: [], status: key === hojeKey ? "aberto" : "pendente" };
      return { ...prev, [key]: fn(atual) };
    });
  };

  const router = useRouter();

  const adicionarDespesa = (d: Despesa) => {
    atualizarDia(diaSelecionado, (dia) => ({ ...dia, despesas: [...dia.despesas, d] }));
  };

  const fecharComanda = (id: string, formaPagamento: FormaPagamento) => {
    atualizarDia(diaSelecionado, (dia) => ({
      ...dia,
      comandas: dia.comandas.map((c) => (c.id === id ? { ...c, status: "fechada", formaPagamento } : c)),
    }));
  };

  const fecharCaixa = () => {
    if (comandasAbertas.length > 0 && !confirmarFechamento) {
      setConfirmarFechamento(true);
      return;
    }
    setConfirmarFechamento(false);
    atualizarDia(diaSelecionado, (dia) => ({ ...dia, status: "fechado" }));
  };

  const reabrirCaixa = () => {
    atualizarDia(diaSelecionado, (dia) => ({ ...dia, status: "aberto" }));
  };

  return (
    <div className="flex-1 overflow-y-auto">

      {/* Header — sobre o fundo, sempre branco */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <div className="admin-glass-card transform-gpu w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
          <FaCashRegister className="w-4 h-4 text-gold" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-100 leading-none">Caixa</p>
          <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest mt-0.5">
            Fechamentos e gastos por dia
          </p>
        </div>
      </div>

      {/* Card único: calendário + painel do dia */}
      <div className="transform-gpu mx-4 mb-3 rounded-2xl overflow-hidden admin-glass-card">

        {/* Header do calendário */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button onClick={() => navMes(-1)} className="admin-text-secondary hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex items-center gap-1.5 text-sm font-semibold admin-text-primary hover:text-gold transition-colors"
          >
            {MESES[mes]} {ano}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandido ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => navMes(1)} className="admin-text-secondary hover:opacity-80 transition-opacity">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Cabeçalho dias da semana */}
        <div className="grid grid-cols-7 px-2 mb-1">
          {DIAS_SEMANA.map((d, i) => (
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
              const dados = caixas[key];
              const isSel = key === diaSelecionado;
              const isToday = key === hojeKey;
              const isDom = d.getDay() === 0;
              return (
                <button key={key} onClick={() => setDiaSelecionado(key)}
                  className={`flex flex-col items-center justify-center aspect-square rounded-xl transition-colors ${
                    isSel ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950" : isToday ? "border border-gold/40 admin-text-primary" : "admin-glass-card-hover admin-text-secondary"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isDom && !isSel ? "text-red-400" : ""}`}>{d.getDate()}</span>
                  {dados && <span className={`w-1 h-1 rounded-full mt-0.5 ${dados.status === "pendente" ? "bg-orange-400" : totalFaturamento(dados) > 0 ? "bg-emerald-400" : "bg-slate-600"}`} />}
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
          <div className="px-2 pb-3">
            <div className="grid grid-cols-7 gap-y-1">
              {celulas.map((dia, i) => {
                if (!dia) return <div key={`e-${i}`} />;
                const key = toKey(ano, mes, dia);
                const dados = caixas[key];
                const isSel = key === diaSelecionado;
                const isToday = key === hojeKey;
                const isDom = new Date(ano, mes, dia).getDay() === 0;
                return (
                  <button key={key} onClick={() => selecionarDia(key)}
                    className={`flex flex-col items-center justify-center h-9 rounded-xl transition-colors ${
                      isSel ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950" : isToday ? "border border-gold/40 admin-text-primary" : "admin-glass-card-hover admin-text-secondary"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${isDom && !isSel ? "text-red-400" : ""}`}>{dia}</span>
                    {dados && <span className={`w-1 h-1 rounded-full mt-0.5 ${dados.status === "pendente" ? "bg-orange-400" : totalFaturamento(dados) > 0 ? "bg-emerald-400" : "bg-slate-600"}`} />}
                  </button>
                );
              })}
            </div>
            <div className="admin-border-t flex items-center gap-4 mt-3 pt-3">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[10px] admin-text-secondary">caixa fechado</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" /><span className="text-[10px] admin-text-secondary">pendente</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-gold/40" /><span className="text-[10px] admin-text-secondary">hoje</span></div>
            </div>
          </div>
          </CalSlide>
          </div>
        </CalExpand>

        {/* Data + status */}
        <div className="admin-border-t flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold admin-text-primary">{dataFormatada}</span>
            {caixa.status === "fechado" && (
              <span className="admin-surface-subtle transform-gpu flex items-center gap-1 text-[10px] font-bold admin-text-secondary px-2 py-0.5 rounded-full uppercase tracking-widest">
                <Lock className="w-2.5 h-2.5" /> Fechado
              </span>
            )}
            {caixa.status === "pendente" && (
              <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Pendente
              </span>
            )}
            {isHoje && caixa.status === "aberto" && (
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
              className="admin-text-secondary hover:opacity-80 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Métricas */}
        <div className="admin-border-t grid grid-cols-3">
          <div className="px-4 py-3">
            <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Faturamento</p>
            <p className="text-base font-bold admin-text-primary">R$ {fmt(faturamento)}</p>
          </div>
          <div className="admin-border-x px-4 py-3">
            <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Gastos</p>
            <p className={`text-base font-bold ${gastos > 0 ? "text-red-400" : "admin-text-primary"}`}>
              R$ {fmt(gastos)}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Líquido</p>
            <p className={`text-base font-bold ${liquido > 0 ? "text-emerald-400" : liquido < 0 ? "text-red-400" : "admin-text-primary"}`}>
              R$ {fmt(liquido)}
            </p>
          </div>
        </div>

        {/* Comandas fechadas (já pagas, somam no faturamento) */}
        {comandasFechadas.length > 0 && (
          <div className="admin-border-t px-4 py-3 space-y-2">
            {comandasFechadas.map((c) => {
              const PagIcon = PAGAMENTO_ICONS[c.formaPagamento!];
              return (
                <div key={c.id} className="admin-surface-subtle transform-gpu flex items-start justify-between gap-3 rounded-xl px-3 py-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold admin-text-primary truncate">{c.cliente}</p>
                      <p className="text-xs admin-text-secondary truncate">
                        {c.profissional} · {c.itens.map((i) => i.descricao).join(", ")}
                      </p>
                      <p className="flex items-center gap-1 text-[10px] admin-text-secondary mt-0.5">
                        <PagIcon className="w-3 h-3" /> {c.formaPagamento}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold admin-text-primary shrink-0">{fmt(totalComanda(c))}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Despesas */}
        {caixa.despesas.length > 0 && (
          <div className="admin-border-t px-4 py-3 space-y-2">
            {caixa.despesas.map((d) => (
              <div key={d.id} className="admin-surface-subtle transform-gpu flex items-center justify-between gap-3 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-red-400/10 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <p className="text-sm admin-text-primary truncate">{d.descricao}</p>
                </div>
                <span className="text-sm font-semibold text-red-400 shrink-0">- {fmt(d.valor)}</span>
              </div>
            ))}
          </div>
        )}

        {comandasFechadas.length === 0 && caixa.despesas.length === 0 && (
          <p className="admin-border-t px-4 pb-3 pt-1 text-sm admin-text-secondary">
            Nenhuma comanda fechada neste dia.
          </p>
        )}

        {/* Botões */}
        <div className="admin-border-t flex flex-col gap-2 px-4 pb-4 pt-3">
          {caixa.status === "fechado" ? (
            <button
              onClick={reabrirCaixa}
              className="admin-surface-subtle admin-text-secondary transform-gpu flex items-center justify-center gap-2 w-full hover:opacity-80 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-opacity"
            >
              <Lock className="w-4 h-4" /> Reabrir Caixa
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => router.push("/admin/comandas/nova")}
                className="flex flex-col items-center gap-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 hover:brightness-110 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                <Plus className="w-4 h-4" /> Nova Comanda
              </button>
              <button
                onClick={() => setModalAberto("despesa")}
                className="transform-gpu flex flex-col items-center gap-1 bg-red-400/10 backdrop-blur-md text-red-400 hover:bg-red-400/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                <TrendingDown className="w-4 h-4" /> Despesa
              </button>
              <button
                onClick={fecharCaixa}
                disabled={!caixaExiste && caixa.comandas.length === 0 && caixa.despesas.length === 0}
                className="admin-surface-subtle admin-text-secondary transform-gpu flex flex-col items-center gap-1 hover:opacity-80 disabled:opacity-40 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-opacity"
              >
                <Lock className="w-4 h-4" /> Fechar Caixa
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Card: Comandas do dia (abertas) */}
      <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card">
        <div className="px-4 pt-4 pb-3">
          <p className="text-sm font-bold admin-text-primary">Comandas do dia</p>
          <p className="text-[10px] font-semibold admin-text-secondary uppercase tracking-widest mt-0.5">
            {comandasAbertas.length > 0 ? `${comandasAbertas.length} em aberto` : "Nenhuma comanda em aberto"}
          </p>
        </div>

        {comandasAbertas.length > 0 ? (
          <div className="px-4 pb-4 space-y-2">
            {comandasAbertas.map((c) => (
              <div key={c.id} className="admin-surface-subtle transform-gpu flex items-center justify-between gap-3 rounded-xl px-3 py-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold admin-text-primary truncate">{c.cliente}</p>
                    <p className="text-xs admin-text-secondary truncate">
                      {c.profissional} · {c.itens.map((i) => i.descricao).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold admin-text-primary">{fmt(totalComanda(c))}</span>
                  <button
                    onClick={() => setComandaParaFechar(c)}
                    className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 hover:brightness-110 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 pb-4 text-sm admin-text-secondary">
            Comandas abertas aparecem aqui até serem pagas.
          </p>
        )}
      </div>

      {modalAberto === "despesa" && (
        <NovaDespesaModal onClose={() => setModalAberto(null)} onSalvar={adicionarDespesa} />
      )}

      {comandaParaFechar && (
        <FecharComandaModal
          comanda={comandaParaFechar}
          onClose={() => setComandaParaFechar(null)}
          onConfirmar={(forma) => {
            fecharComanda(comandaParaFechar.id, forma);
            setComandaParaFechar(null);
          }}
        />
      )}

      {confirmarFechamento && (
        <Modal onClose={() => setConfirmarFechamento(false)}>
          {(close) => (
            <div className="p-4 space-y-4">
              <div>
                <h2 className="text-base font-bold admin-text-primary">Comandas em aberto</h2>
                <p className="text-sm admin-text-secondary mt-1">
                  Ainda há {comandasAbertas.length} comanda{comandasAbertas.length > 1 ? "s" : ""} em aberto neste dia.
                  Tem certeza que deseja fechar o caixa mesmo assim?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={close}
                  className="admin-surface-subtle admin-text-secondary transform-gpu flex-1 hover:opacity-80 py-3 rounded-xl text-sm font-semibold transition-opacity"
                >
                  Cancelar
                </button>
                <button
                  onClick={fecharCaixa}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-bold transition-all"
                >
                  Fechar mesmo assim
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

    </div>
  );
}
