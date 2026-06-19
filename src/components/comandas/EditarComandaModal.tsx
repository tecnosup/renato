"use client";

import { Fragment, useEffect, useState, type ElementType } from "react";
import { User, Phone, Check, Plus, Minus, Scissors, Package, Search, X, Banknote, QrCode, CreditCard } from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { SuccessSplash } from "@/components/ui/SuccessSplash";
import { updateComanda, finalizarComanda, pagarComanda, calcularTotal } from "@/lib/comandas";
import { subscribeToEmployees } from "@/lib/employees";
import { useAuth } from "@/components/providers/AuthProvider";
import { can } from "@/lib/access";
import { subscribeToServices } from "@/lib/services";
import { subscribeToProducts } from "@/lib/products";
import type { Comanda, ComandaItem, ComandaItemTipo, BarberService, Product, Employee } from "@/lib/types";

function brl(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

const FORMAS_PAGAMENTO = ["Dinheiro", "Pix", "Cartão Débito", "Cartão Crédito"] as const;
type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];
const PAGAMENTO_ICONS: Record<FormaPagamento, ElementType> = {
  "Dinheiro": Banknote,
  "Pix": QrCode,
  "Cartão Débito": CreditCard,
  "Cartão Crédito": CreditCard,
};

export function EditarComandaModal({
  comanda,
  onClose,
  iniciarFechando = false,
}: {
  comanda: Comanda;
  onClose: () => void;
  // Pula a edição e vai direto pro formulário de pagamento — usado quando a
  // intenção já é fechar a comanda (ex: resolver retroativa).
  iniciarFechando?: boolean;
}) {
  const { barberId: myBarberId, perms } = useAuth();
  const [nome, setNome] = useState(comanda.customerName);
  const [telefone, setTelefone] = useState(comanda.customerPhone ?? "");
  const [barberId, setBarberId] = useState(comanda.barberId);
  const [barbeiros, setBarbeiros] = useState<Employee[]>([]);
  const [services, setServices] = useState<BarberService[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<ComandaItem[]>(comanda.items);
  const [tab, setTab] = useState<ComandaItemTipo>("servico");
  const [busca, setBusca] = useState("");
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [stage, setStage] = useState<"form" | "salvando" | "ok">("form");
  const [successMsg, setSuccessMsg] = useState({ message: "Comanda atualizada!", subtitle: "" });
  const [showFecharForm, setShowFecharForm] = useState(iniciarFechando);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("Dinheiro");

  useEffect(() => subscribeToEmployees((l) => setBarbeiros(l.filter((e) => e.active && e.bookable))), []);
  useEffect(() => subscribeToServices((l) => setServices(l.filter((s) => s.active !== false))), []);
  useEffect(() => subscribeToProducts((l) => setProducts(l.filter((p) => p.active))), []);

  const qtdDe = (tipo: ComandaItemTipo, refId: string) =>
    items.find((i) => i.refId === refId && i.tipo === tipo)?.qtd ?? 0;

  const adicionar = (tipo: ComandaItemTipo, refId: string, nomeItem: string, preco: number) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.refId === refId && i.tipo === tipo);
      return ex
        ? prev.map((i) => (i === ex ? { ...i, qtd: i.qtd + 1 } : i))
        : [...prev, { id: crypto.randomUUID(), tipo, refId, nome: nomeItem, preco, qtd: 1 }];
    });
  };

  const removerUm = (tipo: ComandaItemTipo, refId: string) =>
    setItems((prev) =>
      prev.map((i) => (i.refId === refId && i.tipo === tipo ? { ...i, qtd: i.qtd - 1 } : i)).filter((i) => i.qtd > 0)
    );

  const total = calcularTotal(items);
  const podeSalvar = nome.trim().length > 0 && barberId !== "" && stage === "form";
  const catalogo = (tab === "servico" ? services : products).filter((x) =>
    x.name.toLowerCase().includes(busca.trim().toLowerCase())
  );
  const isAberta = comanda.status === "aberta";
  const isPendente = comanda.status === "pagamento_pendente";
  const podeAcionar = isAberta || isPendente;

  const salvar = async (close: () => void) => {
    if (!podeSalvar) return;
    const b = barbeiros.find((x) => x.id === barberId) ?? (myBarberId ? { id: myBarberId, name: comanda.barberName } : null);
    if (!b) return;
    setStage("salvando");
    try {
      await updateComanda(comanda.id, {
        customerName: nome.trim(),
        customerPhone: telefone.trim() || undefined,
        barberId: b.id,
        barberName: b.name,
        items,
      });
      setSuccessMsg({ message: "Comanda atualizada!", subtitle: `${nome.trim()} · ${brl(total)}` });
      setStage("ok");
      setTimeout(close, 1600);
    } catch {
      setStage("form");
    }
  };

  const handleFinalizar = async (close: () => void) => {
    setStage("salvando");
    try {
      await finalizarComanda(comanda.id);
      setSuccessMsg({ message: "Serviço finalizado!", subtitle: `${nome.trim()} · Aguardando pagamento` });
      setStage("ok");
      setTimeout(close, 1600);
    } catch {
      setStage("form");
    }
  };

  const handleFechar = async (close: () => void) => {
    const b = barbeiros.find((x) => x.id === barberId) ?? (myBarberId ? { id: myBarberId, name: comanda.barberName } : null);
    setStage("salvando");
    try {
      await updateComanda(comanda.id, {
        customerName: nome.trim(),
        customerPhone: telefone.trim() || undefined,
        barberId: b?.id ?? comanda.barberId,
        barberName: b?.name ?? comanda.barberName,
        items,
      });
      await pagarComanda(comanda.id, formaPagamento, total);
      setSuccessMsg({ message: "Comanda fechada!", subtitle: `${nome.trim()} · ${brl(total)}` });
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
            <SuccessSplash message={successMsg.message} subtitle={successMsg.subtitle} />
          </div>
        ) : (
          <>
            <ModalHeader title={showFecharForm ? "Fechar comanda" : "Editar comanda"} onClose={close} />

            {iniciarFechando && (
              <div className="shrink-0 flex flex-col items-center gap-1.5 pt-2 pb-1.5">
                <div className="flex items-center gap-2">
                  {[1, 2].map((p) => {
                    const passoAtual = showFecharForm ? 2 : 1;
                    return (
                      <Fragment key={p}>
                        {p > 1 && <div className={`h-px w-5 rounded-full transition-colors ${passoAtual >= p ? "bg-gold" : "bg-white/10"}`} />}
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                            passoAtual === p
                              ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 scale-105"
                              : passoAtual > p
                                ? "bg-gold/15 text-gold border border-gold/30"
                                : "admin-surface-subtle admin-text-secondary border border-white/10"
                          }`}
                        >
                          {passoAtual > p ? "✓" : p}
                        </span>
                      </Fragment>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[8px] text-gold/80 tracking-widest font-bold uppercase">Passo {showFecharForm ? 2 : 1}/2 •</span>
                  <span className="text-sm font-bold admin-text-primary uppercase tracking-wide">{showFecharForm ? "Pagamento" : "Conferir comanda"}</span>
                </div>
              </div>
            )}

            {showFecharForm ? (
              <>
                {/* ── Rola: resumo do pagamento ── */}
                <div className="flex-1 overflow-y-auto px-5 pt-3 space-y-3">
                  <div className="admin-glass-card rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold admin-text-primary">{nome.trim() || "Cliente"}</p>
                      <span className="text-xl font-bold text-gold">{brl(total)}</span>
                    </div>
                    <ul className="space-y-1">
                      {items.map((i) => (
                        <li key={i.id} className="flex items-center justify-between text-xs admin-text-secondary">
                          <span className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${i.tipo === "servico" ? "bg-violet-500/15 text-violet-400" : "bg-teal-500/15 text-teal-400"}`}>
                              {i.tipo === "servico" ? <Scissors className="w-2.5 h-2.5" /> : <Package className="w-2.5 h-2.5" />}
                            </span>
                            {i.qtd}x {i.nome}
                          </span>
                          <span>{brl(i.preco * i.qtd)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs admin-text-secondary mb-1.5">Forma de pagamento</p>
                    <div className="grid grid-cols-2 gap-2">
                      {FORMAS_PAGAMENTO.map((forma) => {
                        const Icon = PAGAMENTO_ICONS[forma];
                        const ativo = formaPagamento === forma;
                        return (
                          <button
                            key={forma}
                            onClick={() => setFormaPagamento(forma)}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
                              ativo
                                ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950"
                                : "admin-surface-subtle admin-text-secondary hover:opacity-80"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {forma}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Fixo: ações do pagamento ── */}
                <div className="shrink-0 px-5 pt-3 pb-6 sm:pb-4 admin-border-t flex gap-2">
                  <button
                    onClick={() => setShowFecharForm(false)}
                    className="flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => handleFechar(close)}
                    disabled={stage === "salvando"}
                    className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                  >
                    {stage === "salvando" ? "Salvando…" : "Confirmar pagamento"}
                  </button>
                </div>
              </>
            ) : (
              <>
            {/* ── Fixo: dados do cliente + barbeiro ── */}
            <div className="shrink-0 px-5 pt-2.5 space-y-1.5">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="WhatsApp (opcional)"
                  className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
              {!myBarberId && (
                <div>
                  <p className="text-xs admin-text-secondary mb-1">Barbeiro responsável</p>
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
                            className={`shrink-0 flex items-center gap-2 rounded-xl px-3 py-1.5 border transition-colors ${
                              sel ? "bg-gold/10 border-gold/40" : "admin-surface-subtle border-transparent hover:border-white/15"
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${sel ? "bg-gold text-slate-950" : "bg-white/10 admin-text-secondary"}`}>
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

            {/* ── Fixo: abas + busca ── */}
            <div className="shrink-0 px-5 pt-2 pb-1.5 space-y-1.5 admin-border-b">
              {buscaAberta ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
                  <input
                    autoFocus
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder={`Buscar ${tab === "servico" ? "serviço" : "produto"}…`}
                    className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-9 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => { setBusca(""); setBuscaAberta(false); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 admin-text-secondary hover:text-gold transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  {(["servico", "produto"] as ComandaItemTipo[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        tab === t ? "bg-gold/15 text-gold border border-gold/30" : "admin-surface-subtle admin-text-secondary border border-transparent"
                      }`}
                    >
                      {t === "servico" ? <Scissors className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                      {t === "servico" ? "Serviços" : "Produtos"}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBuscaAberta(true)}
                    className="shrink-0 w-9 rounded-lg admin-surface-subtle admin-text-secondary border border-transparent flex items-center justify-center hover:text-gold transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Rola: catálogo ── */}
            <ul className="flex-1 overflow-y-auto px-5 py-2 space-y-1">
              {catalogo.length === 0 ? (
                <li className="text-sm admin-text-secondary text-center py-6">Nada encontrado.</li>
              ) : (
                catalogo.map((x) => {
                  const q = qtdDe(tab, x.id);
                  return (
                    <li
                      key={x.id}
                      className={`rounded-xl px-3 py-2.5 flex items-center gap-2 border transition-colors ${
                        q > 0 ? "bg-gold/10 border-gold/30" : "admin-surface-subtle border-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium admin-text-primary truncate">{x.name}</p>
                        <p className="text-xs text-gold">{brl(x.price)}</p>
                      </div>
                      {q > 0 ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => removerUm(tab, x.id)} className="w-7 h-7 rounded-lg admin-glass-card admin-text-primary flex items-center justify-center hover:text-gold transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center text-sm font-bold text-gold">{q}</span>
                          <button onClick={() => adicionar(tab, x.id, x.name, x.price)} className="w-7 h-7 rounded-lg admin-glass-card admin-text-primary flex items-center justify-center hover:text-gold transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => adicionar(tab, x.id, x.name, x.price)}
                          className="w-8 h-8 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 flex items-center justify-center shrink-0 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  );
                })
              )}
            </ul>

            {/* ── Fixo: total + ações ── */}
            <div className="shrink-0 px-5 pt-2 pb-5 sm:pb-3 admin-border-t space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm admin-text-secondary">{items.length} {items.length === 1 ? "item" : "itens"}</span>
                <span className="text-lg font-bold admin-text-primary">{brl(total)}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex gap-3">
                  <button onClick={close} className="flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={() => salvar(close)}
                    disabled={!podeSalvar}
                    className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {stage === "salvando" ? "Salvando…" : "Salvar alterações"}
                  </button>
                </div>
                {podeAcionar && (
                  <div className="flex gap-2">
                    {isAberta && (
                      <button
                        onClick={() => handleFinalizar(close)}
                        disabled={stage === "salvando"}
                        className="flex-1 admin-surface-subtle border border-white/10 admin-text-secondary hover:opacity-80 disabled:opacity-40 py-2 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Finalizar serviço
                      </button>
                    )}
                    {can(perms, "fecharComandas") && (
                      <button
                        onClick={() => setShowFecharForm(true)}
                        disabled={stage === "salvando"}
                        className="flex-1 admin-surface-subtle border border-emerald-500/20 text-emerald-400 hover:border-emerald-500/40 disabled:opacity-40 py-2 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Ir para pagamento
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
              </>
            )}
          </>
        )
      }
    </Modal>
  );
}
