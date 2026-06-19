"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, Scissors, Package, Search, X } from "lucide-react";
import { subscribeToServices } from "@/lib/services";
import { subscribeToProducts } from "@/lib/products";
import type { ComandaItem, ComandaItemTipo, BarberService, Product } from "@/lib/types";

function brl(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

/**
 * Seletor de itens do catálogo (serviços + produtos) com abas, busca e
 * quantidades. Os itens são controlados pelo pai (value `items` + `onChange`),
 * para que tanto a comanda avulsa quanto o agendamento compartilhem a mesma UI.
 *
 * `fill`: quando true, ocupa a altura disponível como um flex column (abas/busca
 * fixas no topo, lista rolando) — usado no modal de comanda em tela cheia. Quando
 * false (padrão), vira um bloco embutido com lista de altura limitada (`max-h-56`),
 * para encaixar no meio de um formulário comum (ex.: modal de agendamento).
 */
export function ItemPicker({
  items,
  onChange,
  fill = false,
}: {
  items: ComandaItem[];
  onChange: (items: ComandaItem[]) => void;
  fill?: boolean;
}) {
  const [services, setServices] = useState<BarberService[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<ComandaItemTipo>("servico");
  const [busca, setBusca] = useState("");
  const [buscaAberta, setBuscaAberta] = useState(false);

  useEffect(() => subscribeToServices((l) => setServices(l.filter((s) => s.active !== false))), []);
  useEffect(() => subscribeToProducts((l) => setProducts(l.filter((p) => p.active))), []);

  const qtdDe = (tipo: ComandaItemTipo, refId: string) =>
    items.find((i) => i.refId === refId && i.tipo === tipo)?.qtd ?? 0;

  const adicionar = (tipo: ComandaItemTipo, refId: string, nomeItem: string, preco: number) => {
    const ex = items.find((i) => i.refId === refId && i.tipo === tipo);
    onChange(
      ex
        ? items.map((i) => (i === ex ? { ...i, qtd: i.qtd + 1 } : i))
        : [...items, { id: crypto.randomUUID(), tipo, refId, nome: nomeItem, preco, qtd: 1 }]
    );
  };
  const removerUm = (tipo: ComandaItemTipo, refId: string) =>
    onChange(items.map((i) => (i.refId === refId && i.tipo === tipo ? { ...i, qtd: i.qtd - 1 } : i)).filter((i) => i.qtd > 0));

  const catalogo = (tab === "servico" ? services : products).filter((x) =>
    x.name.toLowerCase().includes(busca.trim().toLowerCase())
  );

  return (
    <div className={fill ? "flex flex-col flex-1 min-h-0" : ""}>
      {/* ── Abas + busca ── */}
      <div className={fill ? "px-5 pt-2 pb-1.5 admin-border-b shrink-0" : ""}>
        {buscaAberta ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
            <input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={`Buscar ${tab === "servico" ? "serviço" : "produto"}…`}
              className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-9 py-1.5 text-sm focus:outline-none focus:border-gold/50 transition-colors"
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
                type="button"
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

      {/* ── Lista do catálogo ── */}
      <ul className={fill ? "flex-1 overflow-y-auto px-5 py-2 space-y-1" : "max-h-56 overflow-y-auto py-1 space-y-1 mt-2"}>
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
                    <button type="button" onClick={() => removerUm(tab, x.id)} className="w-7 h-7 rounded-lg admin-glass-card admin-text-primary flex items-center justify-center hover:text-gold transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-gold">{q}</span>
                    <button type="button" onClick={() => adicionar(tab, x.id, x.name, x.price)} className="w-7 h-7 rounded-lg admin-glass-card admin-text-primary flex items-center justify-center hover:text-gold transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
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
    </div>
  );
}
