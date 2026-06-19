"use client";

import { useState, useLayoutEffect, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Scissors, TrendingDown, Lock, Plus, X, ChevronDown, Banknote, CreditCard, QrCode, Package, Users, Search, ChevronRight as ChevronRightSm } from "lucide-react";
import { FaCashRegister } from "react-icons/fa";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { SuccessSplash } from "@/components/ui/SuccessSplash";
import { NovaComandaModal } from "@/components/comandas/NovaComandaModal";
import { EditarComandaModal } from "@/components/comandas/EditarComandaModal";
import { SeletorBarbeiro } from "@/components/admin/SeletorBarbeiro";
import { PageHeader } from "@/components/admin/PageHeader";
import { subscribeToComandas, pagarComanda, cancelarComanda } from "@/lib/comandas";
import { subscribeToCaixas, salvarDespesasCaixa, fecharCaixaDia, reabrirCaixaDia, type Despesa, type CaixaStatus, type DiaCaixaDoc } from "@/lib/caixa";
import type { Comanda as ComandaFB } from "@/lib/types";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const FORMAS_PAGAMENTO = ["Dinheiro", "Pix", "Cartão Débito", "Cartão Crédito"] as const;
type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

// Aceita tanto as chaves do FecharComandaModal quanto as vindas do modal de detalhe
const PAGAMENTO_ICONS: Record<string, React.ElementType> = {
  "Dinheiro": Banknote,
  "Pix": QrCode,
  "Cartão Débito": CreditCard,
  "Cartão Crédito": CreditCard,
  "Cartão de débito": CreditCard,
  "Cartão de crédito": CreditCard,
};

// Caixa "resolvido" do dia: status sempre presente (derivado na getCaixaDoDia).
type DiaCaixa = { despesas: Despesa[]; status: CaixaStatus };

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function FecharComandaModal({
  comanda,
  onClose,
}: {
  comanda: ComandaFB;
  onClose: () => void;
}) {
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("Dinheiro");
  const [valorStr, setValorStr] = useState(String(comanda.total));
  const [stage, setStage] = useState<"escolhendo" | "salvando" | "ok">("escolhendo");

  const valorFinal = Number(valorStr) || comanda.total;

  const confirmar = async (close: () => void) => {
    setStage("salvando");
    try {
      await pagarComanda(comanda.id, formaPagamento, valorFinal);
      setStage("ok");
      setTimeout(close, 1600);
    } catch {
      setStage("escolhendo");
    }
  };

  return (
    <Modal onClose={onClose}>
      {(close) =>
        stage === "ok" ? (
          <SuccessSplash message="Comanda fechada!" subtitle={`${comanda.customerName} · R$ ${fmt(valorFinal)}`} />
        ) : (
          <>
            <div className="admin-border-b flex items-center justify-between px-4 pt-4 pb-3">
              <h2 className="text-base font-bold admin-text-primary">Fechar Comanda</h2>
              <button onClick={close} className="group admin-text-secondary hover:opacity-80 transition-colors">
                <X className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="admin-surface-subtle transform-gpu rounded-xl px-3 py-2.5">
                <p className="text-sm font-bold admin-text-primary">{comanda.customerName}</p>
                <p className="text-xs admin-text-secondary">
                  {comanda.barberName} · {comanda.items.map((i) => i.nome).join(", ")}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMAS_PAGAMENTO.map((forma) => {
                    const Icon = PAGAMENTO_ICONS[forma] ?? Banknote;
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

              <div className="admin-border-t pt-2">
                <label className="block text-[10px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Valor a cobrar (R$)</label>
                <input
                  type="number"
                  value={valorStr}
                  onChange={(e) => setValorStr(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-3 py-2.5 text-lg font-bold focus:outline-none focus:border-gold/50 transition-colors"
                />
                {valorFinal !== comanda.total && (
                  <p className="text-[10px] admin-text-secondary mt-1">
                    Itens: R$ {fmt(comanda.total)} · ajuste de {valorFinal < comanda.total ? "-" : "+"}R$ {fmt(Math.abs(comanda.total - valorFinal))}
                  </p>
                )}
              </div>

              <button
                onClick={() => confirmar(close)}
                disabled={stage === "salvando"}
                className="w-full bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
              >
                {stage === "salvando" ? "Salvando…" : "Confirmar Pagamento"}
              </button>
            </div>
          </>
        )
      }
    </Modal>
  );
}

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
            <button onClick={close} className="group admin-text-secondary hover:opacity-80 transition-colors">
              <X className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90" />
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

  const [caixas, setCaixas] = useState<Record<string, DiaCaixaDoc>>({});
  const [comandasFirebase, setcomandasFirebase] = useState<ComandaFB[]>([]);
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(hojeKey);
  const [expandido, setExpandido] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [calKey, setCalKey] = useState(0);
  const [modalAberto, setModalAberto] = useState<"comanda" | "despesa" | null>(null);
  const [comandaParaFechar, setComandaParaFechar] = useState<ComandaFB | null>(null);
  const [comandaParaEditar, setComandaParaEditar] = useState<ComandaFB | null>(null);
  const [confirmarFechamento, setConfirmarFechamento] = useState(false);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tabComandas, setTabComandas] = useState<"abertas" | "fechadas">("abertas");
  const [buscaComanda, setBuscaComanda] = useState("");
  const [barbeiroFiltro, setBarbeiroFiltro] = useState<string>("todos");

  useEffect(() => subscribeToComandas((list) => setcomandasFirebase(list)), []);
  useEffect(() => subscribeToCaixas(setCaixas), []);

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

  // Status real vem do Firestore quando o dia foi fechado/reaberto; senão é
  // derivado (hoje = aberto, passado = pendente).
  const getCaixaDoDia = (key: string): DiaCaixa => {
    const d = caixas[key];
    return {
      despesas: d?.despesas ?? [],
      status: d?.status ?? (key === hojeKey ? "aberto" : "pendente"),
    };
  };

  const caixa = getCaixaDoDia(diaSelecionado);

  // Comandas do dia filtradas do Firebase pelo dia selecionado
  const comandasDoDia = comandasFirebase.filter((c) => {
    const d = new Date(c.createdAt);
    return toKey(d.getFullYear(), d.getMonth(), d.getDate()) === diaSelecionado;
  });
  const comandasAbertas = comandasDoDia.filter((c) => c.status === "aberta" || c.status === "pagamento_pendente");
  const comandasFechadas = comandasDoDia.filter((c) => c.status === "paga");

  // Barbeiros com comanda no dia (para o filtro do card "Comandas do dia"). O
  // filtro só navega/conferência da LISTA — os totais do topo seguem globais.
  // Fallback para "todos" se o barbeiro selecionado não tiver comanda no dia.
  const barbeirosDoDia = Array.from(
    new Map(comandasDoDia.map((c) => [c.barberId, c.barberName])).entries()
  ).map(([id, name]) => ({ id, name }));
  const barbeiroAtivo = barbeirosDoDia.some((b) => b.id === barbeiroFiltro) ? barbeiroFiltro : "todos";

  // Dias com alguma comanda no Firebase (para dots no calendário)
  const diasComComandas = new Set(
    comandasFirebase.map((c) => {
      const d = new Date(c.createdAt);
      return toKey(d.getFullYear(), d.getMonth(), d.getDate());
    })
  );

  const faturamento = comandasFechadas.reduce((s, c) => s + c.total, 0);
  const gastos = totalDespesas(caixa);
  const liquido = faturamento - gastos;
  const isHoje = diaSelecionado === hojeKey;
  const caixaExiste = Boolean(caixas[diaSelecionado]) || diasComComandas.has(diaSelecionado);

  const dataFormatada = new Date(diaSelecionado + "T12:00:00")
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const diasDaSemana = getDiasSemana(diaSelecionado);
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas = Array(primeiroDia).fill(null).concat(
    Array.from({ length: diasNoMes }, (_, i) => i + 1)
  );

  const adicionarDespesa = (d: Despesa) => {
    salvarDespesasCaixa(diaSelecionado, [...caixa.despesas, d]);
  };

  // Sempre abre a confirmação (dupla verificação). Com comanda aberta, o modal
  // bloqueia e deixa resolver cada uma; sem nenhuma, confirma antes de encerrar.
  const fecharCaixa = () => {
    setConfirmarFechamento(true);
  };

  const reabrirCaixa = () => {
    reabrirCaixaDia(diaSelecionado);
  };

  return (
    <div className="flex-1 overflow-y-auto">

      <PageHeader icon={FaCashRegister} title="Caixa" subtitle="Fechamentos e gastos por dia" />

      <div className="transform-gpu mx-4 mb-3 rounded-2xl overflow-hidden admin-glass-card">

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

        <div className="grid grid-cols-7 px-2 mb-1">
          {DIAS_SEMANA.map((d, i) => (
            <p key={d} className={`text-center text-[11px] font-medium ${i === 0 ? "text-red-400" : "admin-text-secondary"}`}>{d}</p>
          ))}
        </div>

        <CalExpand expandido={!expandido}>
          <div className="overflow-hidden">
          <CalSlide key={`week-${calKey}`} dir={slideDir}>
          <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
            {diasDaSemana.map((d) => {
              const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
              const temComanda = diasComComandas.has(key);
              const temDespesa = Boolean(caixas[key]?.despesas.length);
              const isSel = key === diaSelecionado;
              const isToday = key === hojeKey;
              const isDom = d.getDay() === 0;
              // Dia passado com movimento e caixa NÃO fechado = esqueceram de fechar.
              const caixaPendente = !isSel && key < hojeKey && (temComanda || temDespesa) && caixas[key]?.status !== "fechado";
              return (
                <button key={key} onClick={() => setDiaSelecionado(key)}
                  className={`flex flex-col items-center justify-center aspect-square rounded-xl transition-colors ${
                    isSel ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950" : isToday ? "border border-gold/40 admin-text-primary" : "admin-glass-card-hover admin-text-secondary"
                  }${caixaPendente ? " ring-2 ring-inset ring-amber-500/70" : ""}`}
                >
                  <span className={`text-sm font-semibold ${isDom && !isSel ? "text-red-400" : ""}`}>{d.getDate()}</span>
                  {(temComanda || temDespesa) && <span className={`w-1 h-1 rounded-full mt-0.5 ${temComanda ? "bg-emerald-400" : "bg-orange-400"}`} />}
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
          <div className="px-2 pb-3">
            <div className="grid grid-cols-7 gap-y-1">
              {celulas.map((dia, i) => {
                if (!dia) return <div key={`e-${i}`} />;
                const key = toKey(ano, mes, dia);
                const temComanda = diasComComandas.has(key);
                const temDespesa = Boolean(caixas[key]?.despesas.length);
                const isSel = key === diaSelecionado;
                const isToday = key === hojeKey;
                const isDom = new Date(ano, mes, dia).getDay() === 0;
                const caixaPendente = !isSel && key < hojeKey && (temComanda || temDespesa) && caixas[key]?.status !== "fechado";
                return (
                  <button key={key} onClick={() => selecionarDia(key)}
                    className={`flex flex-col items-center justify-center h-9 rounded-xl transition-colors ${
                      isSel ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950" : isToday ? "border border-gold/40 admin-text-primary" : "admin-glass-card-hover admin-text-secondary"
                    }${caixaPendente ? " ring-2 ring-inset ring-amber-500/70" : ""}`}
                  >
                    <span className={`text-sm font-semibold ${isDom && !isSel ? "text-red-400" : ""}`}>{dia}</span>
                    {(temComanda || temDespesa) && <span className={`w-1 h-1 rounded-full mt-0.5 ${temComanda ? "bg-emerald-400" : "bg-orange-400"}`} />}
                  </button>
                );
              })}
            </div>
            <div className="admin-border-t flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 pt-3">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[10px] admin-text-secondary">com comandas</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" /><span className="text-[10px] admin-text-secondary">só despesas</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded ring-2 ring-inset ring-amber-500/70" /><span className="text-[10px] admin-text-secondary">caixa não fechado</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-gold/40" /><span className="text-[10px] admin-text-secondary">hoje</span></div>
            </div>
          </div>
          </CalSlide>
          </div>
        </CalExpand>

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

        {/* Comandas pagas do dia (somam no faturamento) */}
        {comandasFechadas.length > 0 && (
          <div className="admin-border-t px-4 py-3 space-y-2 max-h-[40vh] overflow-y-auto">
            {comandasFechadas.map((c) => {
              const PagIcon = PAGAMENTO_ICONS[c.formaPagamento ?? ""] ?? Banknote;
              return (
                <div key={c.id} className="admin-surface-subtle transform-gpu flex items-start justify-between gap-3 rounded-xl px-3 py-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold admin-text-primary truncate">{c.customerName}</p>
                      <p className="text-xs admin-text-secondary truncate">
                        {c.barberName} · {c.items.map((i) => i.nome).join(", ")}
                      </p>
                      <p className="flex items-center gap-1 text-[10px] admin-text-secondary mt-0.5">
                        <PagIcon className="w-3 h-3" /> {c.formaPagamento}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-semibold admin-text-primary">R$ {fmt(c.total)}</span>
                    <button onClick={() => setComandaParaEditar(c)} className="text-[10px] text-gold hover:underline">
                      ver
                    </button>
                  </div>
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
                onClick={() => setModalAberto("comanda")}
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
                disabled={!caixaExiste}
                className="admin-surface-subtle admin-text-secondary transform-gpu flex flex-col items-center gap-1 hover:opacity-80 disabled:opacity-40 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-opacity"
              >
                <Lock className="w-4 h-4" /> Fechar Caixa
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Card: Comandas do dia */}
      <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card">
        {/* Header + abas */}
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold admin-text-primary">Comandas do dia</p>
              <p className="text-[10px] font-semibold admin-text-secondary uppercase tracking-widest mt-0.5">
                {comandasDoDia.length > 0
                  ? `${comandasAbertas.length} aberta${comandasAbertas.length !== 1 ? "s" : ""} · ${comandasFechadas.length} fechada${comandasFechadas.length !== 1 ? "s" : ""}`
                  : "Nenhuma comanda neste dia"}
              </p>
            </div>
            <Link
              href="/admin/comandas"
              className="shrink-0 flex items-center gap-1 admin-glass-card admin-glass-card-hover text-gold px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              Conferir <ChevronRightSm className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex gap-2">
            {(["abertas", "fechadas"] as const).map((t) => {
              const count = t === "abertas" ? comandasAbertas.length : comandasFechadas.length;
              return (
                <button
                  key={t}
                  onClick={() => { setTabComandas(t); setExpandedId(null); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    tabComandas === t ? "bg-gold/15 text-gold border border-gold/30" : "admin-surface-subtle admin-text-secondary border border-transparent"
                  }`}
                >
                  {t === "abertas" ? "Abertas" : "Fechadas"} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
          {/* Filtro por barbeiro (só navega a lista; aparece com 2+ barbeiros no dia) */}
          {barbeirosDoDia.length > 1 && (
            <SeletorBarbeiro
              barbeiros={barbeirosDoDia}
              value={barbeiroAtivo}
              onChange={(id) => { setBarbeiroFiltro(id); setExpandedId(null); }}
              extra={{ id: "todos", label: "Todos", icon: Users }}
            />
          )}
          {/* Busca por cliente — atalho pra quem está no caixa */}
          {comandasDoDia.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
              <input
                value={buscaComanda}
                onChange={(e) => { setBuscaComanda(e.target.value); setExpandedId(null); }}
                placeholder="Buscar cliente…"
                className="w-full admin-surface-subtle admin-input border border-transparent rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          )}
        </div>

        {(() => {
          const base = tabComandas === "abertas" ? comandasAbertas : comandasFechadas;
          const porBarbeiro = barbeiroAtivo === "todos" ? base : base.filter((c) => c.barberId === barbeiroAtivo);
          const termo = buscaComanda.trim().toLowerCase();
          const lista = termo ? porBarbeiro.filter((c) => c.customerName.toLowerCase().includes(termo)) : porBarbeiro;
          if (lista.length === 0) {
            const msg = termo
              ? `Nenhum cliente "${buscaComanda.trim()}" neste dia.`
              : barbeiroAtivo !== "todos" && base.length > 0
                ? "Nenhuma comanda deste barbeiro neste dia."
                : tabComandas === "abertas" ? "Nenhuma comanda aberta neste dia." : "Nenhuma comanda fechada neste dia.";
            return <p className="px-4 pb-4 text-sm admin-text-secondary">{msg}</p>;
          }
          return (
            <div className="px-4 pb-4 space-y-2 max-h-[55vh] overflow-y-auto">
              {lista.map((c) => {
                const isExpanded = expandedId === c.id;
                const isPaga = c.status === "paga";
                const PagIcon = isPaga ? (PAGAMENTO_ICONS[c.formaPagamento ?? ""] ?? Banknote) : null;
                return (
                  <div key={c.id} className={`transform-gpu rounded-xl border transition-colors overflow-hidden ${isExpanded ? "admin-glass-card border-white/15" : "admin-surface-subtle border-transparent"}`}>
                    {/* Linha principal — clica pra expandir */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0">
                        <Scissors className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold admin-text-primary truncate">{c.customerName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs admin-text-secondary truncate">{c.barberName}</p>
                          {c.status === "pagamento_pendente" && (
                            <span className="shrink-0 text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                              Ag. pgto
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm font-semibold admin-text-primary">R$ {fmt(c.total)}</span>
                        <ChevronRightSm className={`w-4 h-4 admin-text-secondary transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    {/* Expansão */}
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden">
                        <div className="admin-border-t mx-3 pt-2 pb-3 space-y-2">
                          <ul className="space-y-1">
                            {c.items.map((it) => (
                              <li key={it.id} className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${it.tipo === "servico" ? "bg-violet-500/15 text-violet-400" : "bg-teal-500/15 text-teal-400"}`}>
                                  {it.tipo === "servico" ? <Scissors className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                                </span>
                                <span className="flex-1 text-xs admin-text-primary truncate">{it.nome}</span>
                                {it.qtd > 1 && <span className="text-[10px] admin-text-secondary">{it.qtd}×</span>}
                                <span className="text-xs font-medium admin-text-secondary shrink-0">R$ {fmt(it.preco * it.qtd)}</span>
                              </li>
                            ))}
                            {c.items.length === 0 && <li className="text-xs admin-text-secondary">Nenhum item.</li>}
                          </ul>
                          {isPaga && PagIcon && (
                            <p className="flex items-center gap-1 text-[10px] admin-text-secondary">
                              <PagIcon className="w-3 h-3" /> {c.formaPagamento}
                            </p>
                          )}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => { setComandaParaEditar(c); setExpandedId(null); }}
                              className="flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-2 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Editar comanda
                            </button>
                            {!isPaga && (
                              <button
                                onClick={() => { setComandaParaFechar(c); setExpandedId(null); }}
                                className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 hover:brightness-110 py-2 rounded-lg text-xs font-bold transition-all"
                              >
                                Fechar comanda
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {modalAberto === "comanda" && (
        <NovaComandaModal onClose={() => setModalAberto(null)} />
      )}
      {modalAberto === "despesa" && (
        <NovaDespesaModal onClose={() => setModalAberto(null)} onSalvar={adicionarDespesa} />
      )}

      {comandaParaEditar && (
        <EditarComandaModal comanda={comandaParaEditar} onClose={() => setComandaParaEditar(null)} />
      )}

      {comandaParaFechar && (
        <FecharComandaModal
          comanda={comandaParaFechar}
          onClose={() => setComandaParaFechar(null)}
        />
      )}

      {confirmarFechamento && (
        <Modal onClose={() => { setConfirmarFechamento(false); setCancelandoId(null); }}>
          {(close) => (
            <div className="p-4 space-y-3">
              <div>
                <h2 className="text-base font-bold admin-text-primary">
                  {comandasAbertas.length > 0 ? "Resolva as comandas abertas" : "Fechar o caixa?"}
                </h2>
                <p className="text-sm admin-text-secondary mt-1">
                  {comandasAbertas.length > 0
                    ? "Não dá pra fechar o caixa com comanda aberta — o dia ficaria com dinheiro não contabilizado. Receba ou cancele cada uma:"
                    : "Nenhuma comanda em aberto. Depois de fechado, o dia fica encerrado — confira que está tudo certo."}
                </p>
              </div>

              {comandasAbertas.length > 0 && (
                <ul className="space-y-2 max-h-[44vh] overflow-y-auto">
                  {comandasAbertas.map((c) => (
                    <li key={c.id} className="admin-surface-subtle rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold admin-text-primary truncate">{c.customerName}</p>
                        <p className="text-xs admin-text-secondary truncate">{c.barberName} · R$ {fmt(c.total)}</p>
                      </div>
                      {cancelandoId === c.id ? (
                        <>
                          <span className="shrink-0 text-[11px] text-rose-400 font-medium">Cancelar?</span>
                          <button
                            onClick={() => { cancelarComanda(c.id); setCancelandoId(null); }}
                            className="shrink-0 text-rose-400 hover:text-rose-300 text-xs font-bold px-2 py-1.5 transition-colors"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setCancelandoId(null)}
                            className="shrink-0 admin-text-secondary hover:admin-text-primary text-xs font-semibold px-2 py-1.5 transition-colors"
                          >
                            Não
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Receber NÃO fecha o modal: o pagamento abre por cima e,
                              ao concluir, volta pra esta lista (já sem a comanda paga). */}
                          <button
                            onClick={() => setComandaParaFechar(c)}
                            className="shrink-0 bg-gold/15 text-gold hover:bg-gold/25 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Receber
                          </button>
                          <button
                            onClick={() => setCancelandoId(c.id)}
                            className="shrink-0 text-rose-400 hover:text-rose-300 text-xs font-semibold px-2 py-1.5 transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={close}
                  className="admin-surface-subtle admin-text-secondary transform-gpu flex-1 hover:opacity-80 py-3 rounded-xl text-sm font-semibold transition-opacity"
                >
                  Voltar
                </button>
                <button
                  onClick={() => { fecharCaixaDia(diaSelecionado); close(); }}
                  disabled={comandasAbertas.length > 0}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fechar caixa
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

    </div>
  );
}
