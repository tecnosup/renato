"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Plus, Minus, Trash2, Scissors, Package, Search, Receipt, X,
} from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { SuccessSplash } from "@/components/ui/SuccessSplash";
import { subscribeToComanda, updateComandaItems, pagarComanda, cancelarComanda } from "@/lib/comandas";
import { subscribeToServices } from "@/lib/services";
import { subscribeToProducts } from "@/lib/products";
import type { Comanda, ComandaItem, ComandaItemTipo, BarberService, Product } from "@/lib/types";

function brl(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

const FORMAS = ["Dinheiro", "Pix", "Cartão de débito", "Cartão de crédito"];

const STATUS_BADGE: Record<Comanda["status"], { label: string; cls: string }> = {
  aberta: { label: "Aberta", cls: "bg-gold/15 text-gold" },
  paga: { label: "Paga", cls: "bg-emerald-400/15 text-emerald-400" },
  cancelada: { label: "Cancelada", cls: "bg-red-500/15 text-red-400" },
};

export default function ComandaDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [comanda, setComanda] = useState<Comanda | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [services, setServices] = useState<BarberService[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [modalAdd, setModalAdd] = useState(false);
  const [tab, setTab] = useState<ComandaItemTipo>("servico");
  const [busca, setBusca] = useState("");
  const [modalPagar, setModalPagar] = useState(false);

  useEffect(() => {
    const unsub = subscribeToComanda(id, (c) => {
      setComanda(c);
      setCarregando(false);
    });
    return unsub;
  }, [id]);

  useEffect(() => subscribeToServices((l) => setServices(l.filter((s) => s.active !== false))), []);
  useEffect(() => subscribeToProducts((l) => setProducts(l.filter((p) => p.active))), []);

  const aberta = comanda?.status === "aberta";

  const adicionarItem = (tipo: ComandaItemTipo, refId: string, nome: string, preco: number) => {
    if (!comanda) return;
    const existente = comanda.items.find((i) => i.refId === refId && i.tipo === tipo);
    const novos: ComandaItem[] = existente
      ? comanda.items.map((i) => (i === existente ? { ...i, qtd: i.qtd + 1 } : i))
      : [...comanda.items, { id: crypto.randomUUID(), tipo, refId, nome, preco, qtd: 1 }];
    updateComandaItems(comanda.id, novos);
  };

  const mudarQtd = (itemId: string, delta: number) => {
    if (!comanda) return;
    const novos = comanda.items
      .map((i) => (i.id === itemId ? { ...i, qtd: i.qtd + delta } : i))
      .filter((i) => i.qtd > 0);
    updateComandaItems(comanda.id, novos);
  };

  const removerItem = (itemId: string) => {
    if (!comanda) return;
    updateComandaItems(comanda.id, comanda.items.filter((i) => i.id !== itemId));
  };

  // Lista do catálogo na aba ativa, filtrada pela busca.
  const catalogo = (tab === "servico" ? services : products).filter((x) =>
    x.name.toLowerCase().includes(busca.trim().toLowerCase())
  );

  if (carregando) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-slate-300">Carregando comanda…</p>
      </div>
    );
  }

  if (!comanda) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <Receipt className="w-10 h-10 text-slate-400" />
        <p className="text-sm text-slate-200">Comanda não encontrada.</p>
        <button onClick={() => router.push("/admin/comandas")} className="text-xs text-gold hover:underline">
          Voltar para comandas
        </button>
      </div>
    );
  }

  const badge = STATUS_BADGE[comanda.status];

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      {/* Header (sobre o fundo) */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button onClick={() => router.back()} className="text-slate-100 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-100 flex-1">Comanda</h1>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
      </div>

      {/* Info da comanda */}
      <div className="transform-gpu mx-4 mb-3 rounded-2xl admin-glass-card p-4">
        <p className="text-base font-bold admin-text-primary">{comanda.customerName}</p>
        <p className="text-sm admin-text-secondary mt-0.5">com {comanda.barberName}</p>
        <p className="text-xs admin-text-secondary mt-1">
          {new Date(comanda.createdAt).toLocaleString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          {comanda.origem === "agendamento" ? " · do agendamento" : " · avulsa"}
        </p>
      </div>

      {/* Itens */}
      <div className="transform-gpu mx-4 mb-3 rounded-2xl overflow-hidden admin-glass-card">
        <div className="px-4 py-3 admin-border-b flex items-center justify-between">
          <p className="text-sm font-bold admin-text-primary">Itens</p>
          {aberta && (
            <button
              onClick={() => { setModalAdd(true); setBusca(""); }}
              className="flex items-center gap-1.5 bg-gold/15 text-gold hover:bg-gold/25 border border-gold/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          )}
        </div>

        {comanda.items.length === 0 ? (
          <p className="text-sm admin-text-secondary text-center py-8">Nenhum item ainda.</p>
        ) : (
          <ul className="admin-divide">
            {comanda.items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 px-4 py-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${it.tipo === "servico" ? "bg-violet-500/15 text-violet-400" : "bg-teal-500/15 text-teal-400"}`}>
                  {it.tipo === "servico" ? <Scissors className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium admin-text-primary truncate">{it.nome}</p>
                  <p className="text-xs admin-text-secondary">{brl(it.preco)} · un</p>
                </div>
                {aberta ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => mudarQtd(it.id, -1)} className="w-7 h-7 rounded-lg admin-surface-subtle admin-text-primary flex items-center justify-center hover:bg-gold/15 hover:text-gold transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold admin-text-primary">{it.qtd}</span>
                    <button onClick={() => mudarQtd(it.id, 1)} className="w-7 h-7 rounded-lg admin-surface-subtle admin-text-primary flex items-center justify-center hover:bg-gold/15 hover:text-gold transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm admin-text-secondary shrink-0">{it.qtd}×</span>
                )}
                <span className="w-20 text-right text-sm font-semibold admin-text-primary shrink-0">{brl(it.preco * it.qtd)}</span>
                {aberta && (
                  <button onClick={() => removerItem(it.id)} className="admin-text-secondary hover:text-red-400 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {comanda.formaPagamento && (
        <p className="text-xs admin-text-secondary text-center mb-3">Pago com {comanda.formaPagamento}</p>
      )}

      {/* Rodapé fixo: total + ações */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-20 admin-glass-modal border-t border-white/10 px-4 py-3 pb-6 md:pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm admin-text-secondary">Total</span>
          <span className="text-xl font-bold admin-text-primary">{brl(comanda.total)}</span>
        </div>
        {aberta && (
          <div className="flex gap-2">
            <button
              onClick={() => cancelarComanda(comanda.id)}
              className="admin-glass-card admin-glass-card-hover admin-text-secondary py-3 px-4 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setModalPagar(true)}
              disabled={comanda.items.length === 0}
              className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" /> Fechar comanda
            </button>
          </div>
        )}
      </div>

      {/* Modal: adicionar item do catálogo */}
      {modalAdd && (
        <Modal onClose={() => setModalAdd(false)}>
          {(close) => (
            <>
              <ModalHeader title="Adicionar item" onClose={close} />
              <div className="p-4 space-y-3">
                {/* Tabs */}
                <div className="flex gap-2">
                  {(["servico", "produto"] as ComandaItemTipo[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        tab === t ? "bg-gold/15 text-gold border border-gold/30" : "admin-surface-subtle admin-text-secondary border border-transparent"
                      }`}
                    >
                      {t === "servico" ? <Scissors className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                      {t === "servico" ? "Serviços" : "Produtos"}
                    </button>
                  ))}
                </div>
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder={`Buscar ${tab === "servico" ? "serviço" : "produto"}…`}
                    className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                {/* Lista */}
                <ul className="space-y-1.5 max-h-[45vh] overflow-y-auto">
                  {catalogo.length === 0 ? (
                    <li className="text-sm admin-text-secondary text-center py-6">Nada encontrado.</li>
                  ) : (
                    catalogo.map((x) => (
                      <li key={x.id}>
                        <button
                          onClick={() => adicionarItem(tab, x.id, x.name, x.price)}
                          className="w-full admin-surface-subtle admin-glass-card-hover rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors text-left"
                        >
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tab === "servico" ? "bg-violet-500/15 text-violet-400" : "bg-teal-500/15 text-teal-400"}`}>
                            {tab === "servico" ? <Scissors className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                          </span>
                          <span className="flex-1 min-w-0 text-sm font-medium admin-text-primary truncate">{x.name}</span>
                          <span className="text-sm font-semibold text-gold shrink-0">{brl(x.price)}</span>
                          <Plus className="w-4 h-4 admin-text-secondary shrink-0" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Modal: fechar comanda (pagamento) */}
      {modalPagar && (
        <PagamentoModal
          total={comanda.total}
          onClose={() => setModalPagar(false)}
          onConfirm={async (forma) => {
            await pagarComanda(comanda.id, forma);
          }}
        />
      )}
    </div>
  );
}

function PagamentoModal({
  total,
  onClose,
  onConfirm,
}: {
  total: number;
  onClose: () => void;
  onConfirm: (forma: string) => Promise<void>;
}) {
  const [forma, setForma] = useState(FORMAS[0]);
  const [stage, setStage] = useState<"escolhendo" | "salvando" | "ok">("escolhendo");

  const confirmar = async () => {
    setStage("salvando");
    try {
      await onConfirm(forma);
      setStage("ok");
      setTimeout(onClose, 1600);
    } catch {
      setStage("escolhendo");
    }
  };

  return (
    <Modal onClose={onClose}>
      {(close) => (
        <>
          {stage === "ok" ? (
            <SuccessSplash message="Comanda paga!" subtitle={`${brl(total)} · ${forma}`} />
          ) : (
            <>
              <ModalHeader title="Fechar comanda" subtitle={brl(total)} onClose={stage === "salvando" ? () => {} : close} />
              <div className="p-5 space-y-3">
                <p className="text-xs admin-text-secondary uppercase tracking-widest font-semibold">Forma de pagamento</p>
                <div className="space-y-1.5">
                  {FORMAS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setForma(f)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-colors ${
                        forma === f ? "bg-gold/10 border-gold/40 text-gold" : "admin-surface-subtle border-transparent admin-text-primary"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={close} disabled={stage === "salvando"} className="flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                    Voltar
                  </button>
                  <button onClick={confirmar} disabled={stage === "salvando"} className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60">
                    {stage === "salvando" ? "Salvando…" : "Confirmar pagamento"}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
}
