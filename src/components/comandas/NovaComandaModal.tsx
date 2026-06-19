"use client";

import { useEffect, useState } from "react";
import { User, Phone, Check } from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { SuccessSplash } from "@/components/ui/SuccessSplash";
import { ItemPicker } from "@/components/comandas/ItemPicker";
import { createComanda, calcularTotal } from "@/lib/comandas";
import { subscribeToEmployees } from "@/lib/employees";
import { useAuth } from "@/components/providers/AuthProvider";
import { can } from "@/lib/access";
import type { Employee, ComandaItem } from "@/lib/types";

function brl(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

// Nome padrão para venda avulsa (ex: só produto, sem cliente identificado).
// Vem pré-preenchido; ao focar o campo limpa para digitar o nome real.
const NOME_PADRAO = "Cliente diversos";

/**
 * Modal (tela cheia) para abrir uma comanda avulsa: cliente + barbeiro + itens
 * do catálogo. Cabeçalho/cliente/barbeiro/abas/busca ficam fixos; só a lista do
 * catálogo rola. Ao criar, mostra um splash de sucesso e fecha — a comanda já
 * aparece na lista (tempo real), sem navegar. `onCreated(id)` é opcional, para
 * quem quiser reagir à criação.
 */
export function NovaComandaModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const { barberId: myBarberId, perms } = useAuth();
  // Mostra o seletor de barbeiro quando o usuário pode escolher para qual
  // barbeiro abrir (permissão — atendimento presencial) OU quando não é barbeiro
  // (não tem "a si mesmo" pra atribuir). Barbeiro sem a permissão abre pra si.
  const podeEscolherBarbeiro = can(perms, "escolherBarbeiroComanda") || !myBarberId;
  const [nome, setNome] = useState(NOME_PADRAO);
  const [telefone, setTelefone] = useState("");
  const [barberId, setBarberId] = useState(myBarberId ?? "");
  const [barbeiros, setBarbeiros] = useState<Employee[]>([]);
  const [items, setItems] = useState<ComandaItem[]>([]);
  const [stage, setStage] = useState<"form" | "salvando" | "ok">("form");

  useEffect(() => subscribeToEmployees((l) => setBarbeiros(l.filter((e) => e.active && e.role === "barbeiro"))), []);

  const total = calcularTotal(items);
  // Exige barbeiro responsável (base da comissão) e ao menos 1 item. O nome
  // sempre tem valor (padrão ou real), então não precisa ser validado aqui.
  const podeSalvar = barberId !== "" && items.length > 0 && stage === "form";

  const salvar = async (close: () => void) => {
    if (!podeSalvar) return;
    const b = barbeiros.find((x) => x.id === barberId);
    if (!b) return;
    setStage("salvando");
    try {
      const id = await createComanda({
        customerName: nome.trim() || NOME_PADRAO,
        customerPhone: telefone.trim() || undefined,
        barberId: b.id,
        barberName: b.name,
        origem: "avulsa",
        items,
      });
      onCreated?.(id);
      setStage("ok");
      setTimeout(close, 1600);
    } catch {
      setStage("form");
    }
  };

  return (
    <Modal fullHeight onClose={onClose}>
      {(close) =>
        stage === "ok" ? (
          <div className="flex-1 flex items-center justify-center">
            <SuccessSplash message="Comanda aberta!" subtitle={`${nome.trim() || NOME_PADRAO} · ${brl(total)}`} />
          </div>
        ) : (
        <>
          <ModalHeader title="Nova comanda" onClose={close} />

          {/* ── Fixo: dados do cliente + barbeiro ── */}
          <div className="shrink-0 px-5 pt-3 space-y-2.5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onFocus={(e) => { if (e.target.value === NOME_PADRAO) setNome(""); }}
                onBlur={(e) => { if (!e.target.value.trim()) setNome(NOME_PADRAO); }}
                placeholder="Nome do cliente"
                className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="WhatsApp (opcional)"
                className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            {podeEscolherBarbeiro && (
              <div>
                <p className="text-xs admin-text-secondary mb-1.5">Barbeiro responsável</p>
                {barbeiros.length === 0 ? (
                  <p className="text-sm admin-text-secondary py-1">Nenhum barbeiro ativo cadastrado.</p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {barbeiros.map((b) => {
                      const sel = b.id === barberId;
                      const iniciais = b.name.trim().split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBarberId(b.id)}
                          className={`shrink-0 flex items-center gap-2 rounded-xl px-3 py-2 border transition-colors ${
                            sel ? "bg-gold/10 border-gold/40" : "admin-surface-subtle border-transparent hover:border-white/15"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${sel ? "bg-gold text-slate-950" : "bg-white/10 admin-text-secondary"}`}>
                            {iniciais}
                          </span>
                          <span className={`text-sm font-medium ${sel ? "text-gold" : "admin-text-primary"}`}>{b.name.split(" ")[0]}</span>
                          {sel && <Check className="w-3.5 h-3.5 text-gold shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Abas + busca + catálogo (rola) ── */}
          <ItemPicker items={items} onChange={setItems} fill />

          {/* ── Fixo: total + ações ── */}
          <div className="shrink-0 px-5 pt-3 pb-6 sm:pb-4 admin-border-t space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm admin-text-secondary">{items.length} {items.length === 1 ? "item" : "itens"}</span>
              <span className="text-lg font-bold admin-text-primary">{brl(total)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={close} className="flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => salvar(close)}
                disabled={!podeSalvar}
                className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {stage === "salvando" ? "Criando…" : "Abrir comanda"}
              </button>
            </div>
          </div>
        </>
        )
      }
    </Modal>
  );
}
