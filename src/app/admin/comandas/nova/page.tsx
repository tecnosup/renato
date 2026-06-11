"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function NovaComandaPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<"cliente" | "profissional">("cliente");

  const now = new Date();
  const dataFormatada = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-slate-100">
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 flex-1 text-center pr-6">Nova Comanda</h1>
      </div>

      <div className="flex-1 p-5 space-y-4">
        {/* Abrir comanda para */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Abrir comanda para:</p>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <button
              onClick={() => setTipo("cliente")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors rounded-xl ${
                tipo === "cliente"
                  ? "bg-slate-800 text-white"
                  : "text-slate-500"
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => setTipo("profissional")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors rounded-xl ${
                tipo === "profissional"
                  ? "bg-slate-800 text-white"
                  : "text-slate-500"
              }`}
            >
              Profissional
            </button>
          </div>
        </div>

        {/* Data */}
        <div className="relative">
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-slate-500">Data</label>
          <input
            type="text"
            defaultValue={dataFormatada}
            readOnly
            className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Cliente / Profissional */}
        <input
          type="text"
          placeholder={tipo === "cliente" ? "Escolha o cliente" : "Escolha o profissional"}
          className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-500 placeholder-slate-400 bg-white focus:outline-none focus:border-blue-500 transition-colors"
        />

        {/* Observação */}
        <input
          type="text"
          placeholder="Observação"
          className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-500 placeholder-slate-400 bg-white focus:outline-none focus:border-blue-500 transition-colors"
        />

        {/* Nº Card */}
        <input
          type="text"
          placeholder="Nº Card (opcional)"
          className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-500 placeholder-slate-400 bg-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Botão salvar */}
      <div className="p-5 pb-8">
        <button className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white py-4 rounded-xl text-sm font-semibold transition-colors">
          Salvar
        </button>
      </div>
    </div>
  );
}
