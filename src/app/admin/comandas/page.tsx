"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle, XCircle, ChevronRight, Plus } from "lucide-react";
import { subscribeToComandas } from "@/lib/comandas";
import type { Comanda } from "@/lib/types";

function brl(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

const STATUS: Record<Comanda["status"], { label: string; cls: string; icon: React.ElementType }> = {
  aberta: { label: "Aberta", cls: "text-gold bg-gold/10", icon: Clock },
  paga: { label: "Paga", cls: "text-emerald-400 bg-emerald-500/10", icon: CheckCircle },
  cancelada: { label: "Cancelada", cls: "text-red-400 bg-red-500/10", icon: XCircle },
};

const FILTROS = ["Todas", "Abertas", "Pagas", "Canceladas"] as const;
type Filtro = (typeof FILTROS)[number];

const FILTRO_STATUS: Record<Filtro, Comanda["status"] | null> = {
  Todas: null,
  Abertas: "aberta",
  Pagas: "paga",
  Canceladas: "cancelada",
};

export default function ComandasPage() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("Todas");

  useEffect(() => {
    const unsub = subscribeToComandas((list) => {
      setComandas(list);
      setCarregando(false);
    });
    return unsub;
  }, []);

  const alvo = FILTRO_STATUS[filtro];
  const visiveis = alvo ? comandas.filter((c) => c.status === alvo) : comandas;
  const abertas = comandas.filter((c) => c.status === "aberta").length;

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
      {/* Header (sobre o fundo) */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Comandas</h1>
          <p className="text-slate-300 text-sm mt-1">
            {abertas > 0 ? `${abertas} comanda${abertas > 1 ? "s" : ""} em aberto` : "Nenhuma comanda em aberto"}
          </p>
        </div>
        <Link
          href="/admin/comandas/nova"
          className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nova
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              f === filtro
                ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950"
                : "admin-glass-card admin-text-secondary hover:opacity-80"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista */}
      {carregando ? (
        <p className="text-sm text-slate-300 text-center py-12">Carregando comandas…</p>
      ) : visiveis.length === 0 ? (
        <div className="transform-gpu rounded-2xl admin-glass-card flex flex-col items-center justify-center gap-2 py-14 px-6 text-center">
          <FileText className="w-9 h-9 admin-text-secondary" />
          <p className="text-sm admin-text-secondary">Nenhuma comanda {filtro !== "Todas" ? filtro.toLowerCase() : "ainda"}.</p>
        </div>
      ) : (
        <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card">
          <ul className="admin-divide">
            {visiveis.map((c) => {
              const st = STATUS[c.status];
              const Icon = st.icon;
              return (
                <li key={c.id}>
                  <Link href={`/admin/comandas/${c.id}`} className="admin-glass-card-hover flex items-center gap-3 px-4 py-3.5 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold admin-text-primary truncate">{c.customerName}</p>
                      <p className="text-xs admin-text-secondary truncate">
                        {c.barberName} · {new Date(c.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className="text-sm font-bold admin-text-primary shrink-0">{brl(c.total)}</span>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 shrink-0 ${st.cls}`}>
                      <Icon className="w-3 h-3" /> {st.label}
                    </span>
                    <ChevronRight className="w-4 h-4 admin-text-secondary shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
