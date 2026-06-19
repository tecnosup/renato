"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, Scissors, Banknote, CreditCard, QrCode, X, ChevronLeft, ChevronRight, Package, Plus, Calendar } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { DatePicker } from "@/components/ui/DatePicker";
import { SuccessSplash } from "@/components/ui/SuccessSplash";
import { EditarComandaModal } from "@/components/comandas/EditarComandaModal";
import { NovaComandaModal } from "@/components/comandas/NovaComandaModal";
import { subscribeToMinhasComandas, finalizarComanda, pagarComanda } from "@/lib/comandas";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Comanda } from "@/lib/types";

type Period = "todo" | "7d" | "30d" | "mesAtual" | "mesAnterior";

const PERIOD_LABELS: { value: Period; label: string }[] = [
  { value: "mesAtual", label: "Este mês" },
  { value: "mesAnterior", label: "Mês anterior" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "todo", label: "Todo período" },
];

const FORMAS_PAGAMENTO = ["Dinheiro", "Pix", "Cartão Débito", "Cartão Crédito"] as const;
type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

const PAGAMENTO_ICONS: Record<string, React.ElementType> = {
  "Dinheiro": Banknote,
  "Pix": QrCode,
  "Cartão Débito": CreditCard,
  "Cartão Crédito": CreditCard,
  "Cartão de débito": CreditCard,
  "Cartão de crédito": CreditCard,
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getPeriodRange(period: Period): { start: Date; end: Date } | null {
  const now = new Date();
  if (period === "todo") return null;
  if (period === "7d") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (period === "30d") {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (period === "mesAtual") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
  // mesAnterior
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return { start, end };
}

function filterByPeriod(comandas: Comanda[], period: Period): Comanda[] {
  const range = getPeriodRange(period);
  if (!range) return comandas;
  return comandas.filter(
    (c) => c.createdAt >= range.start.getTime() && c.createdAt <= range.end.getTime()
  );
}

type BarData = { label: string; value: number };

function getChartData(comandas: Comanda[], period: Period): BarData[] {
  const MESES_ABREV = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const DIAS_ABREV = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

  const paga = comandas.filter((c) => c.status === "paga");

  if (period === "todo") {
    const byMonth: Record<string, number> = {};
    paga.forEach((c) => {
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] ?? 0) + c.total;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        label: MESES_ABREV[parseInt(key.split("-")[1]) - 1],
        value,
      }));
  }

  const range = getPeriodRange(period)!;
  const days: BarData[] = [];
  const cur = new Date(range.start);
  while (cur <= range.end) {
    const key = toKey(cur);
    const dayTotal = paga
      .filter((c) => toKey(new Date(c.createdAt)) === key)
      .reduce((s, c) => s + c.total, 0);
    days.push({
      label: period === "7d" ? DIAS_ABREV[cur.getDay()] : String(cur.getDate()),
      value: dayTotal,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function FecharComandaModal({
  comanda,
  onClose,
}: {
  comanda: Comanda;
  onClose: () => void;
}) {
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("Dinheiro");
  const [stage, setStage] = useState<"escolhendo" | "salvando" | "ok">("escolhendo");

  const confirmar = async (close: () => void) => {
    setStage("salvando");
    try {
      await pagarComanda(comanda.id, formaPagamento);
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
          <SuccessSplash
            message="Comanda fechada!"
            subtitle={`${comanda.customerName} · R$ ${fmt(comanda.total)}`}
          />
        ) : (
          <>
            <div className="admin-border-b flex items-center justify-between px-4 pt-4 pb-3">
              <h2 className="text-base font-bold admin-text-primary">Fechar Comanda</h2>
              <button onClick={close} className="group admin-text-secondary hover:opacity-80 transition-colors">
                <X className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="admin-surface-subtle rounded-xl px-3 py-2.5">
                <p className="text-sm font-bold admin-text-primary">{comanda.customerName}</p>
                <p className="text-xs admin-text-secondary">
                  {comanda.barberName} · {comanda.items.map((i) => i.nome).join(", ")}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMAS_PAGAMENTO.map((forma) => {
                    const Icon = PAGAMENTO_ICONS[forma] ?? Banknote;
                    const ativo = formaPagamento === forma;
                    return (
                      <button
                        key={forma}
                        onClick={() => setFormaPagamento(forma)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          ativo
                            ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950"
                            : "admin-surface-subtle admin-text-secondary hover:opacity-80"
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
                <span className="text-lg font-bold admin-text-primary">R$ {fmt(comanda.total)}</span>
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

export default function MeuFinanceiroPage() {
  const { barberId, perms } = useAuth();
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [period, setPeriod] = useState<Period>("mesAtual");
  const [tabComandas, setTabComandas] = useState<"ativas" | "concluidas">("ativas");
  const [diaVisto, setDiaVisto] = useState(() => toKey(new Date()));
  const [pickerAberto, setPickerAberto] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [novaModal, setNovaModal] = useState(false);
  const [comandaParaEditar, setComandaParaEditar] = useState<Comanda | null>(null);
  const [comandaParaFechar, setComandaParaFechar] = useState<Comanda | null>(null);
  const [finalizando, setFinalizando] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barberId) return;
    return subscribeToMinhasComandas(barberId, setComandas);
  }, [barberId]);

  // Ao abrir o calendário, rola suave pro fim (espera a expansão terminar).
  useEffect(() => {
    if (!pickerAberto) return;
    const el = scrollRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 320);
    return () => clearTimeout(t);
  }, [pickerAberto]);

  const filtradas = filterByPeriod(comandas, period);
  const atendimentos = filtradas.filter(
    (c) => c.status === "paga" || c.status === "pagamento_pendente"
  ).length;
  const faturado = filtradas
    .filter((c) => c.status === "paga")
    .reduce((s, c) => s + c.total, 0);

  const chartData = getChartData(filtradas, period);
  const maxBar = Math.max(...chartData.map((d) => d.value), 1);

  // A lista de comandas é operacional (abrir/finalizar/fechar durante o
  // expediente): mostra o dia selecionado (hoje por padrão, ou um dia
  // retroativo via as setas), independente do período das métricas.
  const hojeKey = toKey(new Date());
  const ehHoje = diaVisto === hojeKey;
  const comandasDoDia = comandas.filter((c) => toKey(new Date(c.createdAt)) === diaVisto);
  const ativas = comandasDoDia.filter(
    (c) => c.status === "aberta" || c.status === "pagamento_pendente"
  );
  const concluidas = comandasDoDia.filter((c) => c.status === "paga");

  // Label do dia: "Hoje" / "Ontem" / "dd/mm".
  const ontemKey = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toKey(d);
  })();
  const labelDia = ehHoje
    ? "Hoje"
    : diaVisto === ontemKey
      ? "Ontem"
      : new Date(diaVisto + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  // Navega de dia em dia; nunca passa de hoje (não há comanda no futuro).
  const navDia = (dir: number) => {
    const base = new Date(diaVisto + "T12:00:00");
    base.setDate(base.getDate() + dir);
    const key = toKey(base);
    if (key > hojeKey) return;
    setDiaVisto(key);
    setExpandedId(null);
  };

  const handleFinalizar = async (id: string) => {
    setFinalizando(id);
    try {
      await finalizarComanda(id);
    } finally {
      setFinalizando(null);
    }
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto pb-24">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="admin-glass-card transform-gpu w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-gold" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-100 leading-none">Meu Financeiro</p>
            <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest mt-0.5">
              Atendimentos e comissões
            </p>
          </div>
        </div>
        <button
          onClick={() => setNovaModal(true)}
          className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 hover:brightness-110 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Nova comanda
        </button>
      </div>

      {/* Period selector */}
      <div className="px-4 mb-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {PERIOD_LABELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                period === value
                  ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_16px_rgba(194,163,93,0.4)]"
                  : "admin-glass-card admin-glass-card-hover admin-text-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="px-4 mb-4 grid grid-cols-3 gap-2">
        <div className="admin-glass-card rounded-2xl px-3 py-3">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest leading-tight">
            Atendimentos
          </p>
          <p className="text-2xl font-bold admin-text-primary mt-1">{atendimentos}</p>
        </div>
        <div className="admin-glass-card rounded-2xl px-3 py-3">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest leading-tight">
            Faturado
          </p>
          <p className="text-sm font-bold text-emerald-400 mt-1">R$ {fmt(faturado)}</p>
        </div>
        <div className="admin-glass-card rounded-2xl px-3 py-3">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest leading-tight">
            Comissão
          </p>
          <p className="text-2xl font-bold admin-text-secondary mt-1">—</p>
        </div>
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="transform-gpu mx-4 mb-4 rounded-2xl overflow-hidden admin-glass-card px-4 pt-3 pb-4">
          <p className="text-[10px] font-semibold admin-text-secondary uppercase tracking-widest mb-3">
            Faturamento {period === "todo" ? "por mês" : "por dia"}
          </p>
          <div className="flex items-end gap-px h-20">
            {chartData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div className="w-full flex items-end justify-center" style={{ height: "56px" }}>
                  <div
                    className="w-full rounded-sm bg-emerald-400/60 transition-all duration-500"
                    style={{
                      height: `${Math.max((bar.value / maxBar) * 56, bar.value > 0 ? 3 : 0)}px`,
                    }}
                  />
                </div>
                <span className="text-[7px] admin-text-secondary truncate w-full text-center leading-none">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comandas list */}
      <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card">
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold admin-text-primary">
                {ehHoje ? "Comandas de hoje" : "Comandas"}
              </p>
              <p className="text-[10px] font-semibold admin-text-secondary uppercase tracking-widest mt-0.5">
                {comandasDoDia.length > 0
                  ? `${ativas.length} em aberto · ${concluidas.length} concluída${concluidas.length !== 1 ? "s" : ""}`
                  : ehHoje
                    ? "Nenhuma comanda hoje"
                    : "Nenhuma comanda neste dia"}
              </p>
            </div>
            {/* Navegação por dia: setas pra ±1 dia, botão central abre o calendário */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => navDia(-1)}
                aria-label="Dia anterior"
                className="admin-glass-card admin-glass-card-hover admin-text-secondary w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPickerAberto((v) => !v)}
                className={`flex items-center gap-1.5 min-w-[72px] justify-center px-2.5 h-8 rounded-lg text-xs font-bold transition-colors ${
                  ehHoje
                    ? "admin-glass-card admin-glass-card-hover admin-text-secondary"
                    : "bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {labelDia}
              </button>
              <button
                type="button"
                onClick={() => navDia(1)}
                disabled={ehHoje}
                aria-label="Próximo dia"
                className="admin-glass-card admin-glass-card-hover admin-text-secondary w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendário expansível pra pular pra qualquer dia */}
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ gridTemplateRows: pickerAberto ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="pt-1 pb-1">
                {!ehHoje && (
                  <button
                    type="button"
                    onClick={() => { setDiaVisto(hojeKey); setExpandedId(null); setPickerAberto(false); }}
                    className="mb-2 w-full admin-surface-subtle admin-text-secondary hover:text-gold rounded-lg py-1.5 text-xs font-semibold transition-colors"
                  >
                    Voltar pra hoje
                  </button>
                )}
                <DatePicker
                  value={diaVisto}
                  onChange={(iso) => {
                    setDiaVisto(iso > hojeKey ? hojeKey : iso);
                    setExpandedId(null);
                  }}
                  onClose={() => setPickerAberto(false)}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {(["ativas", "concluidas"] as const).map((t) => {
              const count = t === "ativas" ? ativas.length : concluidas.length;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setTabComandas(t);
                    setExpandedId(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    tabComandas === t
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "admin-surface-subtle admin-text-secondary border border-transparent"
                  }`}
                >
                  {t === "ativas" ? "Em aberto" : "Concluídas"} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {(() => {
          const lista = tabComandas === "ativas" ? ativas : concluidas;
          if (lista.length === 0) {
            return (
              <p className="px-4 pb-4 text-sm admin-text-secondary">
                {tabComandas === "ativas"
                  ? "Nenhuma comanda em aberto hoje."
                  : "Nenhuma comanda concluída hoje."}
              </p>
            );
          }
          return (
            <div className="px-4 pb-4 space-y-2">
              {lista.map((c) => {
                const isExpanded = expandedId === c.id;
                const isPaga = c.status === "paga";
                const isPendente = c.status === "pagamento_pendente";
                const PagIcon = isPaga ? (PAGAMENTO_ICONS[c.formaPagamento ?? ""] ?? Banknote) : null;
                const isFinalizando = finalizando === c.id;

                return (
                  <div
                    key={c.id}
                    className={`transform-gpu rounded-xl border transition-colors overflow-hidden ${
                      isExpanded
                        ? "admin-glass-card border-white/15"
                        : "admin-surface-subtle border-transparent"
                    }`}
                  >
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
                        {isPendente && (
                          <span className="inline-block text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wide mt-0.5">
                            Ag. pagamento
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm font-semibold admin-text-primary">
                          R$ {fmt(c.total)}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 admin-text-secondary transition-transform duration-300 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="admin-border-t mx-3 pt-2 pb-3 space-y-2">
                          <ul className="space-y-1">
                            {c.items.map((it) => (
                              <li key={it.id} className="flex items-center gap-2">
                                <span
                                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                    it.tipo === "servico"
                                      ? "bg-violet-500/15 text-violet-400"
                                      : "bg-teal-500/15 text-teal-400"
                                  }`}
                                >
                                  {it.tipo === "servico" ? (
                                    <Scissors className="w-3 h-3" />
                                  ) : (
                                    <Package className="w-3 h-3" />
                                  )}
                                </span>
                                <span className="flex-1 text-xs admin-text-primary truncate">
                                  {it.nome}
                                </span>
                                {it.qtd > 1 && (
                                  <span className="text-[10px] admin-text-secondary">{it.qtd}×</span>
                                )}
                                <span className="text-xs font-medium admin-text-secondary shrink-0">
                                  R$ {fmt(it.preco * it.qtd)}
                                </span>
                              </li>
                            ))}
                            {c.items.length === 0 && (
                              <li className="text-xs admin-text-secondary">Nenhum item.</li>
                            )}
                          </ul>
                          {isPaga && PagIcon && (
                            <p className="flex items-center gap-1 text-[10px] admin-text-secondary">
                              <PagIcon className="w-3 h-3" /> {c.formaPagamento}
                            </p>
                          )}
                          <div className="flex gap-2 pt-1 flex-wrap">
                            <button
                              onClick={() => {
                                setComandaParaEditar(c);
                                setExpandedId(null);
                              }}
                              className="flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-2 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Editar
                            </button>
                            {c.status === "aberta" && (
                              <button
                                onClick={() => handleFinalizar(c.id)}
                                disabled={isFinalizando}
                                className="flex-1 admin-surface-subtle border border-white/10 admin-text-secondary hover:opacity-80 disabled:opacity-40 py-2 rounded-lg text-xs font-semibold transition-colors"
                              >
                                {isFinalizando ? "Finalizando…" : "Finalizar serviço"}
                              </button>
                            )}
                            {(c.status === "aberta" || c.status === "pagamento_pendente") &&
                              perms?.fecharComandas && (
                                <button
                                  onClick={() => {
                                    setComandaParaFechar(c);
                                    setExpandedId(null);
                                  }}
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

      {novaModal && <NovaComandaModal onClose={() => setNovaModal(false)} />}
      {comandaParaEditar && (
        <EditarComandaModal
          comanda={comandaParaEditar}
          onClose={() => setComandaParaEditar(null)}
        />
      )}
      {comandaParaFechar && (
        <FecharComandaModal
          comanda={comandaParaFechar}
          onClose={() => setComandaParaFechar(null)}
        />
      )}
    </div>
  );
}
