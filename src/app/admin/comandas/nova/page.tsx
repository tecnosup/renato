"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Phone, Check } from "lucide-react";
import { createComanda } from "@/lib/comandas";
import { subscribeToEmployees } from "@/lib/employees";
import type { Employee } from "@/lib/types";

export default function NovaComandaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [barberId, setBarberId] = useState<string>("");
  const [barbeiros, setBarbeiros] = useState<Employee[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    return subscribeToEmployees((lista) => {
      setBarbeiros(lista.filter((e) => e.active && e.role === "barbeiro"));
    });
  }, []);

  const podeSalvar = nome.trim().length > 0 && barberId !== "" && !salvando;

  const salvar = async () => {
    if (!podeSalvar) return;
    const barbeiro = barbeiros.find((b) => b.id === barberId);
    if (!barbeiro) return;
    setSalvando(true);
    try {
      const id = await createComanda({
        customerName: nome.trim(),
        customerPhone: telefone.trim() || undefined,
        barberId: barbeiro.id,
        barberName: barbeiro.name,
        origem: "avulsa",
        items: [],
      });
      router.replace(`/admin/comandas/${id}`);
    } catch {
      setSalvando(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header (sobre o fundo) */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button onClick={() => router.back()} className="text-slate-100 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-100">Nova comanda</h1>
      </div>

      <div className="mx-4 space-y-4">
        {/* Cliente */}
        <div className="transform-gpu rounded-2xl admin-glass-card p-4 space-y-3">
          <div>
            <label className="text-xs admin-text-secondary mb-1 block">Nome do cliente</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs admin-text-secondary mb-1 block">WhatsApp (opcional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Barbeiro responsável */}
        <div className="transform-gpu rounded-2xl admin-glass-card p-4">
          <p className="text-xs admin-text-secondary mb-2.5">Barbeiro responsável</p>
          {barbeiros.length === 0 ? (
            <p className="text-sm admin-text-secondary py-2">Nenhum barbeiro ativo cadastrado.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {barbeiros.map((b) => {
                const sel = b.id === barberId;
                const iniciais = b.name.trim().split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
                return (
                  <button
                    key={b.id}
                    onClick={() => setBarberId(b.id)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors ${
                      sel ? "bg-gold/10 border-gold/40" : "admin-surface-subtle border-transparent hover:border-white/15"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${sel ? "bg-gold text-slate-950" : "bg-white/10 admin-text-secondary"}`}>
                      {iniciais}
                    </span>
                    <span className={`text-sm font-medium truncate ${sel ? "text-gold" : "admin-text-primary"}`}>{b.name.split(" ")[0]}</span>
                    {sel && <Check className="w-3.5 h-3.5 text-gold ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Salvar */}
        <button
          onClick={salvar}
          disabled={!podeSalvar}
          className="w-full bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {salvando ? "Criando…" : "Criar comanda"}
        </button>
      </div>
    </div>
  );
}
