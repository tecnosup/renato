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
      {/* Header — sobre o fundo, sempre branco */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold text-slate-100">
          Comissões <span className="text-slate-300 font-normal text-base">· Todas</span>
        </h1>
        <button className="text-slate-100 hover:text-white transition-colors">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-4 pb-20 space-y-3">
        {/* Profissional */}
        <div className="admin-glass-card rounded-xl overflow-hidden">
          <label className="block text-[9px] font-semibold admin-text-secondary uppercase tracking-widest px-4 pt-3 pb-1">Profissional</label>
          <select
            value={profissional}
            onChange={(e) => setProfissional(e.target.value)}
            className="w-full bg-transparent px-4 pb-3 text-sm admin-text-primary focus:outline-none appearance-none"
          >
            {profissionais.map((p) => (
              <option key={p} value={p} className="bg-slate-900 text-slate-100">{p}</option>
            ))}
          </select>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-2">
          <div className="admin-glass-card rounded-xl px-4 pt-3 pb-3">
            <label className="block text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Data inicial</label>
            <input type="text" defaultValue={hoje} className="w-full bg-transparent text-sm admin-text-primary focus:outline-none" />
          </div>
          <div className="admin-glass-card rounded-xl px-4 pt-3 pb-3">
            <label className="block text-[9px] font-semibold admin-text-secondary uppercase tracking-widest mb-1">Data final</label>
            <input type="text" defaultValue={hoje} className="w-full bg-transparent text-sm admin-text-primary focus:outline-none" />
          </div>
        </div>

        {/* Toggle Sintético / Analítico */}
        <div className="admin-surface-subtle flex rounded-xl overflow-hidden p-1 gap-1">
          <button
            onClick={() => setModo("sintetico")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              modo === "sintetico" ? "admin-toggle-active" : "admin-text-secondary hover:opacity-80"
            }`}
          >
            Sintético
          </button>
          <button
            onClick={() => setModo("analitico")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              modo === "analitico" ? "admin-toggle-active" : "admin-text-secondary hover:opacity-80"
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
            <div className="admin-glass-card rounded-xl p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm admin-text-secondary">Corte + Barba</span>
                <span className="text-sm font-semibold admin-text-primary">R$ 17,00</span>
              </div>
              <p className="text-xs admin-text-secondary">Comissão 20% · Victor Hugo</p>
            </div>
            <div className="admin-glass-card rounded-xl p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm admin-text-secondary">Corte</span>
                <span className="text-sm font-semibold admin-text-primary">R$ 9,00</span>
              </div>
              <p className="text-xs admin-text-secondary">Comissão 20% · Pedro Alves</p>
            </div>
            <div className="admin-glass-card rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm font-semibold admin-text-secondary">Total</span>
              <span className="text-base font-bold text-emerald-400">R$ 26,00</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
