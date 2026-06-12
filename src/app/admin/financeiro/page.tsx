"use client";

import { useState } from "react";
import { AlertTriangle, Bell, Check, ChevronDown, X, Calendar as CalendarIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Settings, Pencil, Trash2, BellRing, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { DatePicker } from "@/components/ui/DatePicker";

const caixasRetroativos = [
  { label: "Sex., 29 Mai." },
  { label: "Sáb., 16 Mai." },
  { label: "Sex., 15 Mai." },
];

const vencimentosProximos = [
  { nome: "Água", vence: "Vence em 4d · 14/06/2026", valor: 100.0 },
  { nome: "Conta de Luz", vence: "Vence em 3d · 13/06/2026", valor: 289.78 },
];

type Vencimento = (typeof vencimentosProximos)[number];

const PERIODOS = ["Todo período", "Últimos 7 dias", "Últimos 30 dias", "Este mês", "Mês anterior"] as const;

const RESUMO = {
  faturamento: 1724.8,
  gastos: 1389.78,
  lucro: 335.02,
  receitaTotal: 1724.8,
  gastosAtivos: 3,
};

const RECEITA_ACUMULADA = 3724.1;
const GASTOS_REGISTRADOS = 302.0;

const HISTORICO = [
  { mes: "Abr", bruto: 0, liquido: 0, despesas: 0 },
  { mes: "", bruto: 600, liquido: 540, despesas: 80 },
  { mes: "Mai", bruto: 1300, liquido: 1100, despesas: 220 },
  { mes: "", bruto: 1750, liquido: 1430, despesas: 280 },
  { mes: "Jun", bruto: 1800, liquido: 1450, despesas: 200 },
];

const SERVICOS_PERIODO = [
  { nome: "Corte Clássico", qtd: 12, valor: 483.0 },
  { nome: "Barba Clássica", qtd: 3, valor: 75.0 },
  { nome: "Barba Completa", qtd: 2, valor: 87.75 },
  { nome: "Corte Clássico + Barba Completa", qtd: 1, valor: 53.25 },
  { nome: "Raspadão", qtd: 1, valor: 29.9 },
];
const SERVICOS_MAX = Math.max(...SERVICOS_PERIODO.map((s) => s.valor));

const GASTOS_CATEGORIA = [
  { nome: "Aluguel", valor: 1000.0, cor: "#fbbf24" },
  { nome: "Água", valor: 100.0, cor: "#60a5fa" },
];

const GASTOS_EMPRESA = [
  { id: 1, nome: "Conta de luz", categoria: "Aluguel", recorrencia: "Mensal", vence: "Vence em 13/06/2026 · 2d", valor: 289.78, alerta: true, lembrete: true },
  { id: 2, nome: "Água", categoria: "Água", recorrencia: "Mensal", vence: "Vence em 14/06/2026 · 3d", valor: 100.0, alerta: true, lembrete: true },
  { id: 3, nome: "Aluguel", categoria: "Aluguel", recorrencia: "Mensal", vence: "Vence em 14/05/2026", valor: 1000.0, alerta: false, lembrete: false },
];

// dd/mm/aaaa <-> aaaa-mm-dd (formato esperado pelo <input type="date">)
function brParaIso(data: string) {
  const [d, m, y] = data.split("/");
  return `${y}-${m}-${d}`;
}
function isoParaBr(data: string) {
  const [y, m, d] = data.split("-");
  return `${d}/${m}/${y}`;
}

// Modal de confirmação de pagamento — permite ajustar o valor final pago e a data de vencimento (boletos periódicos)
function ConfirmarPagamentoModal({
  vencimento,
  onClose,
  onConfirmar,
}: {
  vencimento: Vencimento;
  onClose: () => void;
  onConfirmar: (valorPago: number, novoVencimento: string) => void;
}) {
  const dataVencimento = vencimento.vence.split("·").pop()?.trim() ?? "";
  const [valor, setValor] = useState(vencimento.valor.toFixed(2).replace(".", ","));
  const [data, setData] = useState(dataVencimento);
  const [pickerAberto, setPickerAberto] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [fechando, setFechando] = useState(false);

  return (
    <Modal onClose={onClose} panelClassName="admin-glass-modal sm:rounded-3xl rounded-t-3xl">
      {(close) =>
        confirmado ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 px-4">
            <div className="success-pop flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 shadow-[0_0_28px_rgba(194,163,93,0.55)]">
              <Check className="w-8 h-8" strokeWidth={3} />
            </div>
            <p className="text-base font-bold admin-text-primary">Pagamento confirmado!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 admin-border-b">
              <h2 className="text-base font-bold admin-text-primary">Confirmar pagamento</h2>
              <button
                onClick={() => {
                  setFechando(true);
                  setTimeout(close, 150);
                }}
                className="group admin-text-secondary hover:opacity-80"
              >
                <X className={`w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90 ${fechando ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative rounded-xl admin-surface-subtle px-3 py-2.5">
                <p className="text-sm font-semibold admin-text-primary mb-1.5">{vencimento.nome}</p>
                <button
                  onClick={() => setPickerAberto((v) => !v)}
                  className="w-full flex items-center justify-between gap-2 admin-glass-card admin-text-secondary rounded-lg px-2.5 py-2 text-xs hover:opacity-80 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-gold" />
                    Vencimento: {data}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${pickerAberto ? "rotate-180" : ""}`} />
                </button>
                <Collapse expandido={pickerAberto}>
                  <div className="pt-2">
                    <DatePicker
                      value={brParaIso(data)}
                      onChange={(iso) => setData(isoParaBr(iso))}
                      onClose={() => setPickerAberto(false)}
                    />
                  </div>
                </Collapse>
              </div>

              <div>
                <label className="block text-[11px] font-bold admin-text-secondary uppercase tracking-widest mb-1.5">Valor pago (R$)</label>
                <input
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  inputMode="decimal"
                  className="transform-gpu w-full admin-glass-card admin-input rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-shadow"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onConfirmar(Number(valor.replace(",", ".")) || 0, data);
                    setConfirmado(true);
                    setTimeout(close, 700);
                  }}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 border border-white/30 text-slate-950 py-3 rounded-full text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-all"
                >
                  Confirmar pagamento
                </button>
                <button onClick={close} className="px-5 py-3 rounded-full text-sm font-semibold admin-glass-card admin-glass-card-hover admin-text-secondary transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </>
        )
      }
    </Modal>
  );
}

// Recolhe/expande conteúdo com transição suave de altura
function Collapse({ expandido, children }: { expandido: boolean; children: React.ReactNode }) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ gridTemplateRows: expandido ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

export default function FinanceiroPage() {
  const [periodo, setPeriodo] = useState<(typeof PERIODOS)[number]>("Todo período");
  const [caixasExpandido, setCaixasExpandido] = useState(false);
  const [vencimentosExpandido, setVencimentosExpandido] = useState(false);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Vencimento | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Financeiro</h1>
          <p className="text-slate-300 text-sm mt-1">Faturamento, gastos e lucro estimado</p>
        </div>
      </div>

      {/* Alerta: caixas retroativos em aberto */}
      {caixasRetroativos.length > 0 && (
        <div className="transform-gpu rounded-2xl overflow-hidden bg-red-950/50 backdrop-blur-md backdrop-saturate-150 border border-red-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_20px_rgba(0,0,0,0.25)] mb-3">
          <button
            onClick={() => setCaixasExpandido((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-3"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm font-semibold text-red-400">
              {caixasRetroativos.length} caixa{caixasRetroativos.length > 1 ? "s" : ""} retroativo{caixasRetroativos.length > 1 ? "s" : ""} em aberto
            </span>
            <ChevronDown className={`w-4 h-4 text-red-400 ml-auto shrink-0 transition-transform duration-300 ${caixasExpandido ? "rotate-180" : ""}`} />
          </button>
          <Collapse expandido={caixasExpandido}>
            <div className="flex gap-2 flex-wrap px-4 pb-3">
              {caixasRetroativos.map((c) => (
                <span
                  key={c.label}
                  className="text-xs font-medium text-red-300 bg-red-500/25 border border-red-400/40 rounded-lg px-2.5 py-1"
                >
                  {c.label}
                </span>
              ))}
            </div>
          </Collapse>
        </div>
      )}

      {/* Alerta: vencimentos próximos */}
      {vencimentosProximos.length > 0 && (
        <div className="transform-gpu rounded-2xl overflow-hidden bg-amber-500/10 backdrop-blur-md backdrop-saturate-150 border border-amber-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_20px_rgba(0,0,0,0.25)] mb-4">
          <button
            onClick={() => setVencimentosExpandido((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-3"
          >
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-sm font-semibold text-amber-300">
              {vencimentosProximos.length} vencimento{vencimentosProximos.length > 1 ? "s" : ""} próximo{vencimentosProximos.length > 1 ? "s" : ""}
            </span>
            <ChevronDown className={`w-4 h-4 text-amber-300 ml-auto shrink-0 transition-transform duration-300 ${vencimentosExpandido ? "rotate-180" : ""}`} />
          </button>
          <Collapse expandido={vencimentosExpandido}>
            <div className="space-y-3 px-4 pb-3">
              {vencimentosProximos.map((v, i) => (
                <div key={v.nome} className={`space-y-2 ${i > 0 ? "pt-3 border-t border-amber-400/10" : ""}`}>
                  <div>
                    <p className="text-sm font-semibold text-amber-200">{v.nome}</p>
                    <p className="text-xs text-amber-300/80">
                      {v.vence} · R$ {v.valor.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <button
                    onClick={() => setPagamentoSelecionado(v)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Confirmar pagamento
                  </button>
                </div>
              ))}
            </div>
          </Collapse>
        </div>
      )}

      {/* Filtros de período */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {PERIODOS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              p === periodo
                ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_16px_rgba(194,163,93,0.4)]"
                : "admin-glass-card admin-text-secondary hover:opacity-80"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="transform-gpu rounded-xl p-3 admin-glass-card">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Faturamento</p>
          <p className="text-xl font-bold admin-text-primary leading-none">R$ {RESUMO.faturamento.toFixed(2).replace(".", ",")}</p>
        </div>
        <div className="transform-gpu rounded-xl p-3 admin-glass-card">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Gastos/Mês</p>
          <p className="text-xl font-bold text-red-400 leading-none">R$ {RESUMO.gastos.toFixed(2).replace(".", ",")}</p>
          <p className="text-[10px] admin-text-secondary mt-1">{RESUMO.gastosAtivos} ativos</p>
        </div>
        <div className="transform-gpu rounded-xl p-3 admin-glass-card">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Lucro Estimado</p>
          <p className="text-xl font-bold text-emerald-400 leading-none">R$ {RESUMO.lucro.toFixed(2).replace(".", ",")}</p>
        </div>
        <div className="transform-gpu rounded-xl p-3 admin-glass-card">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Receita Total</p>
          <p className="text-xl font-bold admin-text-primary leading-none">R$ {RESUMO.receitaTotal.toFixed(2).replace(".", ",")}</p>
        </div>
      </div>

      {/* Gráfico: faturamento por fechamento de caixa */}
      <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card p-4 mb-4">
        <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Faturamento por fechamento de caixa</p>
        <p className="text-[9px] font-semibold text-amber-400 uppercase tracking-widest mb-1">Receita acumulada</p>
        <p className="text-2xl font-bold admin-text-primary leading-none mb-1">R$ {RECEITA_ACUMULADA.toFixed(2).replace(".", ",")}</p>
        <p className="text-xs text-red-400 mb-2">Gastos registrados: R$ {GASTOS_REGISTRADOS.toFixed(2).replace(".", ",")}</p>

        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HISTORICO} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: "#cbd5e1", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#cbd5e1", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${v >= 1000 ? `${v / 1000}k` : v}`}
              />
              <Tooltip
                contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(value) => `R$ ${Number(value ?? 0).toFixed(2).replace(".", ",")}`}
              />
              <Line type="monotone" dataKey="bruto" name="Faturamento Bruto" stroke="#fbbf24" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="liquido" name="Faturamento Líquido" stroke="#34d399" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#fb923c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-xs admin-text-secondary">Faturamento Bruto</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /><span className="text-xs admin-text-secondary">Faturamento Líquido</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" /><span className="text-xs admin-text-secondary">Despesas</span></div>
        </div>
      </div>

      {/* Serviços no período */}
      <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card p-4 mb-4">
        <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-3">Serviços no período</p>
        <ul className="space-y-3">
          {SERVICOS_PERIODO.map((s, i) => (
            <li key={s.nome}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold admin-text-primary truncate">
                  <span className="admin-text-secondary mr-2">{i + 1}</span>
                  {s.nome}
                </p>
                <span className="text-xs admin-text-secondary shrink-0">
                  {s.qtd}x · R$ {s.valor.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="h-1.5 rounded-full admin-surface-subtle overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400/80"
                  style={{ width: `${(s.valor / SERVICOS_MAX) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Gastos por categoria + Gastos da empresa */}
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        {/* Donut */}
        <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card p-4">
          <p className="text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-3">Gastos por categoria</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={GASTOS_CATEGORIA} dataKey="valor" nameKey="nome" innerRadius="65%" outerRadius="85%" paddingAngle={2}>
                  {GASTOS_CATEGORIA.map((g) => (
                    <Cell key={g.nome} fill={g.cor} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#e2e8f0" }}
                  formatter={(value) => `R$ ${Number(value ?? 0).toFixed(2).replace(".", ",")}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap justify-center">
            {GASTOS_CATEGORIA.map((g) => (
              <div key={g.nome} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.cor }} />
                <span className="text-xs admin-text-secondary">{g.nome}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gastos da empresa */}
        <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold admin-text-primary">Gastos da empresa</p>
            <div className="flex items-center gap-2">
              <button className="admin-text-secondary hover:opacity-80 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1.5 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Novo gasto
              </button>
            </div>
          </div>
          <ul className="space-y-2">
            {GASTOS_EMPRESA.map((g) => (
              <li key={g.id} className="flex items-center gap-3 pl-3 border-l-2 border-amber-400/60">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold admin-text-primary">{g.nome}</p>
                    <span className="text-[10px] font-medium text-gold bg-gold/15 border border-gold/20 rounded-full px-2 py-0.5">{g.categoria}</span>
                    <span className="text-[10px] font-medium admin-text-secondary admin-surface-subtle border border-transparent rounded-full px-2 py-0.5">{g.recorrencia}</span>
                    {g.lembrete && <BellRing className="w-3 h-3 text-amber-400" />}
                  </div>
                  <p className={`text-xs mt-0.5 ${g.alerta ? "text-amber-400" : "admin-text-secondary"}`}>{g.vence}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-red-400">R$ {g.valor.toFixed(2).replace(".", ",")}</span>
                  <button className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/25 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button className="admin-text-secondary hover:opacity-80 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="admin-text-secondary hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {pagamentoSelecionado && (
        <ConfirmarPagamentoModal
          vencimento={pagamentoSelecionado}
          onClose={() => setPagamentoSelecionado(null)}
          onConfirmar={() => {}}
        />
      )}

    </div>
  );
}
