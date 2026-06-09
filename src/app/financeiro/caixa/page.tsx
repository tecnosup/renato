import { DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react";

const movimentos = [
  { id: 1, tipo: "entrada", descricao: "Corte + Barba — João Silva", valor: 85.0, hora: "09:15" },
  { id: 2, tipo: "entrada", descricao: "Corte — Pedro Alves", valor: 45.0, hora: "10:30" },
  { id: 3, tipo: "saida", descricao: "Compra de produtos", valor: 120.0, hora: "11:00" },
  { id: 4, tipo: "entrada", descricao: "Barba — Lucas Costa", valor: 40.0, hora: "13:20" },
  { id: 5, tipo: "entrada", descricao: "Corte + Barba — Rafael M.", valor: 85.0, hora: "14:45" },
];

export default function CaixaPage() {
  const totalEntradas = movimentos.filter((m) => m.tipo === "entrada").reduce((a, m) => a + m.valor, 0);
  const totalSaidas = movimentos.filter((m) => m.tipo === "saida").reduce((a, m) => a + m.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-100">Caixa</h1>
        <p className="text-slate-500 text-sm mt-1">Movimentações do dia de hoje.</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="rounded-xl p-3 bg-linear-to-br from-emerald-950/60 to-slate-900/60">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-widest">Entradas</p>
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-400 leading-none">R$ {totalEntradas.toFixed(0)}</p>
        </div>
        <div className="rounded-xl p-3 bg-linear-to-br from-red-950/60 to-slate-900/60">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] font-semibold text-red-600 uppercase tracking-widest">Saídas</p>
            <TrendingDown className="w-3 h-3 text-red-400" />
          </div>
          <p className="text-lg font-bold text-red-400 leading-none">R$ {totalSaidas.toFixed(0)}</p>
        </div>
        <div className="rounded-xl p-3 bg-linear-to-br from-blue-950/60 to-slate-900/60">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-widest">Saldo</p>
            <DollarSign className="w-3 h-3 text-blue-400" />
          </div>
          <p className="text-lg font-bold text-blue-400 leading-none">R$ {saldo.toFixed(0)}</p>
        </div>
      </div>

      {/* Lista de movimentos */}
      <div className="rounded-2xl overflow-hidden bg-linear-to-br from-slate-800/80 to-slate-900/60">
        <div className="px-4 py-3 border-b border-slate-800/60">
          <h2 className="text-sm font-semibold text-slate-200">Movimentos de hoje</h2>
        </div>
        <ul className="divide-y divide-slate-800/60">
          {movimentos.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.tipo === "entrada" ? "bg-emerald-500/10" : "bg-red-500/10"
                }`}>
                  {m.tipo === "entrada"
                    ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                    : <TrendingDown className="w-4 h-4 text-red-400" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate">{m.descricao}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {m.hora}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-semibold shrink-0 ${
                m.tipo === "entrada" ? "text-emerald-400" : "text-red-400"
              }`}>
                {m.tipo === "entrada" ? "+" : "-"} R$ {m.valor.toFixed(2).replace(".", ",")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
