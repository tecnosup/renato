"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

const profissionais = ["RENATO", "FRANCIELE", "XAVIER", "MATHEUX", "LEANDRO"];

export default function ComissoesPage() {
  const [profissional, setProfissional] = useState("RENATO");
  const [modo, setModo] = useState<"sintetico" | "analitico">("sintetico");
  const [buscado, setBuscado] = useState(false);

  const hoje = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold text-slate-100">
          Comissões <span className="text-slate-300 font-normal text-base">· Todas</span>
        </h1>
        <button className="text-slate-200 hover:text-white transition-colors">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-4 pb-20 space-y-3">
        {/* Profissional */}
        <div className="rounded-xl overflow-hidden bg-linear-to-br from-slate-800/80 to-slate-900/60">
          <label className="block text-[9px] font-semibold text-slate-300 uppercase tracking-widest px-4 pt-3 pb-1">Profissional</label>
          <select
            value={profissional}
            onChange={(e) => setProfissional(e.target.value)}
            className="w-full bg-transparent px-4 pb-3 text-sm text-slate-200 focus:outline-none appearance-none"
          >
            {profissionais.map((p) => (
              <option key={p} value={p} className="bg-slate-900">{p}</option>
            ))}
          </select>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-linear-to-br from-slate-800/80 to-slate-900/60 px-4 pt-3 pb-3">
            <label className="block text-[9px] font-semibold text-slate-300 uppercase tracking-widest mb-1">Data inicial</label>
            <input type="text" defaultValue={hoje} className="w-full bg-transparent text-sm text-slate-200 focus:outline-none" />
          </div>
          <div className="rounded-xl bg-linear-to-br from-slate-800/80 to-slate-900/60 px-4 pt-3 pb-3">
            <label className="block text-[9px] font-semibold text-slate-300 uppercase tracking-widest mb-1">Data final</label>
            <input type="text" defaultValue={hoje} className="w-full bg-transparent text-sm text-slate-200 focus:outline-none" />
          </div>
        </div>

        {/* Toggle Sintético / Analítico */}
        <div className="flex rounded-xl overflow-hidden bg-slate-800/60 p-1 gap-1">
          <button
            onClick={() => setModo("sintetico")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              modo === "sintetico" ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Sintético
          </button>
          <button
            onClick={() => setModo("analitico")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              modo === "analitico" ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Analítico
          </button>
        </div>

        {/* Botão buscar */}
        <button
          onClick={() => setBuscado(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Buscar Comissões
        </button>

        {/* Resultado */}
        {!buscado ? (
          <p className="text-center text-sm text-slate-300 pt-6">
            Toque no botão acima para filtrar as comissões
          </p>
        ) : (
          <div className="space-y-2">
            <div className="rounded-xl p-4 bg-linear-to-br from-slate-800/80 to-slate-900/60">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-300">Corte + Barba</span>
                <span className="text-sm font-semibold text-slate-100">R$ 17,00</span>
              </div>
              <p className="text-xs text-slate-300">Comissão 20% · Victor Hugo</p>
            </div>
            <div className="rounded-xl p-4 bg-linear-to-br from-slate-800/80 to-slate-900/60">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-300">Corte</span>
                <span className="text-sm font-semibold text-slate-100">R$ 9,00</span>
              </div>
              <p className="text-xs text-slate-300">Comissão 20% · Pedro Alves</p>
            </div>
            <div className="rounded-xl p-4 bg-linear-to-br from-emerald-950/60 to-slate-900/60 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-300">Total</span>
              <span className="text-base font-bold text-emerald-400">R$ 26,00</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
