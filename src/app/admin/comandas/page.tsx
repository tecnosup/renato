import Link from "next/link";
import { FileText, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";

const comandas = [
  { id: "2310621", cliente: "Victor Hugo", profissional: "Franciele Lemos", valor: 80.0, status: "Pago", data: "05/06/2026" },
  { id: "2310620", cliente: "Leandro Lopes", profissional: "Xavier", valor: 40.0, status: "Pago", data: "05/06/2026" },
  { id: "2310619", cliente: "Victor Nunes", profissional: "Matheux + 1", valor: 40.0, status: "Pago", data: "05/06/2026" },
  { id: "2310618", cliente: "Cléberson", profissional: "Franciele Lemos", valor: 40.0, status: "Pago", data: "05/06/2026" },
  { id: "2310617", cliente: "Rafael Mendes", profissional: "Renato", valor: 85.0, status: "Aberto", data: "05/06/2026" },
  { id: "2310616", cliente: "Ana Souza", profissional: "Franciele Lemos", valor: 60.0, status: "Cancelado", data: "04/06/2026" },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  Pago: { label: "Pago", color: "text-emerald-400 bg-emerald-500/10", icon: CheckCircle },
  Aberto: { label: "Aberto", color: "text-amber-400 bg-amber-500/10", icon: Clock },
  Cancelado: { label: "Cancelado", color: "text-red-400 bg-red-500/10", icon: XCircle },
};

export default function ComandasPage() {
  const abertas = comandas.filter((c) => c.status === "Aberto").length;

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Comandas</h1>
          <p className="text-slate-300 text-sm mt-1">
            {abertas > 0 ? `${abertas} comanda${abertas > 1 ? "s" : ""} em aberto` : "Nenhuma comanda em aberto"}
          </p>
        </div>
        <Link href="/admin/comandas/nova" className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-all">
          + Nova
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["Todas", "Abertas", "Pagas", "Canceladas"].map((f) => (
          <button
            key={f}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              f === "Todas" ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 font-bold" : "bg-slate-800/80 text-slate-200 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="rounded-2xl overflow-hidden bg-linear-to-br from-slate-800/80 to-slate-900/60">
        <ul className="divide-y divide-slate-800/60">
          {comandas.map((c) => {
            const s = statusConfig[c.status];
            const StatusIcon = s.icon;
            return (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-slate-800/60 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-200 truncate">{c.cliente}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate mt-0.5">
                    #{c.id} · {c.profissional} · {c.data}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-slate-200">
                    R$ {c.valor.toFixed(2).replace(".", ",")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-200" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
