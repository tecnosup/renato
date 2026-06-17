"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Plus, Pencil, Trash2, Package, ChevronDown, ChevronUp,
  EyeOff, Eye, Sparkles, Search, AlertCircle, AlertTriangle, DollarSign, Boxes,
} from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import {
  subscribeToProducts,
  createProduct,
  updateProduct,
  deactivateProduct,
  activateProduct,
  deleteProduct,
  seedProductsIfEmpty,
  swapProductOrder,
} from "@/lib/products";
import { subscribeToCategories } from "@/lib/categories";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { CategoryManagerModal } from "@/components/admin/CategoryManagerModal";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Product, Category } from "@/lib/types";

// Limite abaixo do qual o estoque é sinalizado como baixo.
const LOW_STOCK = 5;

type FormState = {
  name: string;
  price: string;
  cost: string;
  stock: string;
  volume: string;
  description: string;
  categoryId: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  price: "",
  cost: "",
  stock: "0",
  volume: "",
  description: "",
  categoryId: "",
  active: true,
};

const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;
const margem = (price: number, cost: number) =>
  price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

export default function ProdutosPage() {
  // Suspense exigido pelo useSearchParams (abrir cadastro via ?novo=1 da sidebar).
  return (
    <Suspense fallback={null}>
      <ProdutosPageInner />
    </Suspense>
  );
}

function ProdutosPageInner() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Margem/custo são dados sensíveis -> só admin master (perms undefined ou
  // verFinanceiroGeral). Demais veem o cadastro sem os números de custo.
  const { perms } = useAuth();
  const podeVerCustos = perms === undefined || perms.verFinanceiroGeral === true;

  // modal: null = fechado, { id: null } = novo, { id } = editando
  const [modal, setModal] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  // Busca + filtro (estado local).
  const [busca, setBusca] = useState("");
  // null = todos; "inativos"; "estoque-baixo"; senão = id de categoria.
  const [filtro, setFiltro] = useState<string | "inativos" | "estoque-baixo" | null>(null);

  // Categorias dinâmicas (Firestore, type "produto").
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [gerenciarCat, setGerenciarCat] = useState(false);

  const [erro, setErro] = useState<string | null>(null);
  const [formErros, setFormErros] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = subscribeToProducts((lista) => {
      setProdutos(lista);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeToCategories("produto", setCategorias);
    return unsub;
  }, []);

  const abrirNovo = () => {
    setForm({ ...EMPTY_FORM, active: true, categoryId: categorias[0]?.id ?? "" });
    setFormErros({});
    setModal({ id: null });
  };

  // Abre o cadastro automaticamente quando chega via ?novo=1 (atalho da sidebar).
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("novo") === "1") {
      abrirNovo();
      router.replace(pathname);
    }
  }, [searchParams, pathname, router]);

  const abrirEdicao = (p: Product) => {
    setForm({
      name: p.name,
      price: String(p.price),
      cost: String(p.cost),
      stock: String(p.stock),
      volume: p.volume,
      description: p.description,
      categoryId: p.categoryId ?? "",
      active: p.active ?? true,
    });
    setFormErros({});
    setModal({ id: p.id });
  };

  const validarForm = (): Record<string, string> => {
    const e: Record<string, string> = {};
    const name = form.name.trim();
    const price = Number(form.price);
    const cost = Number(form.cost);
    const stock = Number(form.stock);

    if (!name) e.name = "Informe o nome do produto.";
    else {
      const dup = produtos.some(
        (p) => p.id !== modal?.id && p.name.trim().toLowerCase() === name.toLowerCase()
      );
      if (dup) e.name = "Já existe um produto com esse nome.";
    }
    if (form.price === "" || Number.isNaN(price) || price <= 0) e.price = "Preço deve ser maior que zero.";
    if (form.cost !== "" && (Number.isNaN(cost) || cost < 0)) e.cost = "Custo inválido.";
    if (form.stock === "" || Number.isNaN(stock) || stock < 0) e.stock = "Estoque inválido.";
    return e;
  };

  const salvar = async (close: () => void) => {
    if (saving) return;
    const errs = validarForm();
    setFormErros(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        cost: form.cost === "" ? 0 : Number(form.cost),
        stock: Number(form.stock),
        volume: form.volume.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        active: form.active,
      };
      if (modal?.id) {
        await updateProduct(modal.id, payload);
      } else {
        await createProduct({ ...payload, order: produtos.length });
      }
      close();
    } catch {
      setErro("Não foi possível salvar o produto. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const remover = async (close: () => void) => {
    if (!confirmDelete) return;
    try {
      await deleteProduct(confirmDelete.id);
      close();
    } catch {
      setErro("Não foi possível excluir o produto. Tente novamente.");
    }
  };

  const toggleAtivo = async (p: Product) => {
    try {
      await ((p.active ?? true) ? deactivateProduct(p.id) : activateProduct(p.id));
    } catch {
      setErro("Não foi possível alterar o status do produto.");
    }
  };

  const popular = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      await seedProductsIfEmpty();
    } finally {
      setSeeding(false);
    }
  };

  const reordenar = async (lista: Product[], from: number, to: number) => {
    const a = lista[from];
    const b = lista[to];
    if (!a || !b) return;
    try {
      await swapProductOrder(
        { id: a.id, order: a.order ?? from },
        { id: b.id, order: b.order ?? to }
      );
    } catch {
      setErro("Não foi possível reordenar. Tente novamente.");
    }
  };

  const ativos = produtos.filter((p) => p.active ?? true).length;
  const estoqueBaixo = produtos.filter((p) => (p.active ?? true) && p.stock <= LOW_STOCK);
  const valorEstoque = useMemo(
    () => produtos.reduce((acc, p) => acc + p.cost * p.stock, 0),
    [produtos]
  );

  // Categoria de um produto (id pode ser vazio -> grupo "Sem categoria").
  const catName = (id?: string) =>
    (id && categorias.find((c) => c.id === id)?.name) || "Sem categoria";

  // Busca + filtro.
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      if (termo && !p.name.toLowerCase().includes(termo)) return false;
      if (filtro === "inativos") return !(p.active ?? true);
      if (filtro === "estoque-baixo") return (p.active ?? true) && p.stock <= LOW_STOCK;
      if (filtro) return (p.categoryId ?? "") === filtro;
      return true;
    });
  }, [produtos, busca, filtro]);

  // Sem busca nem filtro, agrupa por categoria e a reordenação fica ativa.
  const semFiltro = !busca.trim() && filtro === null;

  // Grupos por categoria (na ordem das categorias; "Sem categoria" por último).
  const grupos = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const c of categorias) map.set(c.id, []);
    map.set("", []); // sem categoria
    for (const p of filtrados) {
      const id = p.categoryId && map.has(p.categoryId) ? p.categoryId : "";
      map.get(id)!.push(p);
    }
    return map;
  }, [filtrados, categorias]);

  const renderItem = (p: Product, lista?: Product[], idx?: number) => {
    const active = p.active ?? true;
    const low = active && p.stock <= LOW_STOCK;
    const podeReordenar = lista !== undefined && idx !== undefined;
    return (
      <li key={p.id} className="flex items-center gap-3 px-4 py-3">
        {podeReordenar && (
          <div className="flex flex-col shrink-0 -my-1">
            <button
              onClick={() => idx! > 0 && reordenar(lista!, idx!, idx! - 1)}
              disabled={idx === 0}
              className="admin-text-secondary hover:text-gold disabled:opacity-25 disabled:hover:text-current transition-colors"
              aria-label="Mover para cima"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => idx! < lista!.length - 1 && reordenar(lista!, idx!, idx! + 1)}
              disabled={idx === lista!.length - 1}
              className="admin-text-secondary hover:text-gold disabled:opacity-25 disabled:hover:text-current transition-colors"
              aria-label="Mover para baixo"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className={`w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0 ${!active ? "opacity-40" : ""}`}>
          <Package className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium admin-text-primary truncate max-w-full">{p.name}</p>
            {p.volume && (
              <span className="text-[10px] admin-text-secondary shrink-0">{p.volume}</span>
            )}
            {!active && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full admin-surface-subtle admin-text-secondary shrink-0">
                Inativo
              </span>
            )}
            {low && (
              <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 shrink-0">
                <AlertTriangle className="w-2.5 h-2.5" /> Estoque baixo
              </span>
            )}
          </div>
          <p className="text-xs admin-text-secondary truncate mt-0.5">
            {brl(p.price)} · {p.stock} em estoque
            {podeVerCustos && p.cost > 0 ? ` · margem ${margem(p.price, p.cost)}%` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggleAtivo(p)}
            className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-gold transition-colors"
            aria-label={active ? "Desativar" : "Ativar"}
            title={active ? "Desativar" : "Ativar"}
          >
            {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => abrirEdicao(p)}
            className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-gold transition-colors"
            aria-label="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete(p)}
            className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-red-400 transition-colors"
            aria-label="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Produtos</h1>
          <p className="text-slate-300 text-sm mt-1">
            {produtos.length} cadastrados · {ativos} ativos
          </p>
        </div>
        <button
          onClick={abrirNovo}
          className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Produto</span>
        </button>
      </div>

      {/* Banner de erro de operação */}
      {erro && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300 flex-1">{erro}</p>
          <button onClick={() => setErro(null)} className="text-red-400 hover:text-red-300 text-xs font-medium">
            Fechar
          </button>
        </div>
      )}

      {/* Resumo de estoque */}
      {produtos.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          <div className="transform-gpu rounded-2xl admin-glass-card p-4">
            <div className="flex items-center gap-2 admin-text-secondary text-xs mb-1">
              <Boxes className="w-3.5 h-3.5" /> Produtos
            </div>
            <p className="text-xl font-bold admin-text-primary">{produtos.length}</p>
            <p className="text-[11px] admin-text-secondary mt-0.5">{ativos} ativos</p>
          </div>
          <div className="transform-gpu rounded-2xl admin-glass-card p-4">
            <div className="flex items-center gap-2 admin-text-secondary text-xs mb-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Estoque baixo
            </div>
            <p className="text-xl font-bold admin-text-primary">{estoqueBaixo.length}</p>
            <p className="text-[11px] admin-text-secondary mt-0.5">≤ {LOW_STOCK} unidades</p>
          </div>
          {podeVerCustos && (
            <div className="transform-gpu rounded-2xl admin-glass-card p-4 col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 admin-text-secondary text-xs mb-1">
                <DollarSign className="w-3.5 h-3.5" /> Valor em estoque
              </div>
              <p className="text-xl font-bold admin-text-primary">{brl(valorEstoque)}</p>
              <p className="text-[11px] admin-text-secondary mt-0.5">a custo de compra</p>
            </div>
          )}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="transform-gpu rounded-2xl admin-glass-card p-8 text-center">
          <p className="text-sm admin-text-secondary">Carregando...</p>
        </div>
      ) : produtos.length === 0 ? (
        <div className="transform-gpu rounded-2xl admin-glass-card p-8 text-center">
          <div className="w-12 h-12 rounded-full admin-surface-subtle flex items-center justify-center mx-auto mb-3">
            <Package className="w-5 h-5 text-gold" />
          </div>
          <p className="text-sm font-medium admin-text-primary">Nenhum produto cadastrado</p>
          <p className="text-xs admin-text-secondary mt-1">
            Cadastre os produtos para que apareçam na vitrine da landing.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={abrirNovo}
              className="inline-flex items-center gap-2 admin-surface-subtle admin-text-primary text-xs px-4 py-2 rounded-lg hover:bg-gold/15 hover:text-gold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Cadastrar primeiro
            </button>
            <button
              onClick={popular}
              disabled={seeding}
              className="inline-flex items-center gap-2 admin-surface-subtle admin-text-primary text-xs px-4 py-2 rounded-lg hover:bg-gold/15 hover:text-gold transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" /> {seeding ? "Populando..." : "Popular catálogo inicial"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Busca + filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 admin-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto..."
                className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm admin-text-primary focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { key: null as string | null, label: "Todos" },
                ...categorias.map((c) => ({ key: c.id as string | null, label: c.name })),
                { key: "estoque-baixo" as string | null, label: "Estoque baixo" },
                { key: "inativos" as string | null, label: "Inativos" },
              ].map(({ key, label }) => {
                const sel = filtro === key;
                return (
                  <button
                    key={label}
                    onClick={() => setFiltro(key)}
                    className={`shrink-0 text-xs px-3 py-2 rounded-lg transition-colors ${
                      sel ? "bg-gold text-slate-950 font-semibold" : "admin-surface-subtle admin-text-secondary hover:text-gold"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {filtrados.length === 0 ? (
            <div className="transform-gpu rounded-2xl admin-glass-card p-8 text-center">
              <p className="text-sm admin-text-secondary">Nenhum produto encontrado.</p>
            </div>
          ) : semFiltro ? (
            // Agrupado por categoria, com reordenação por setas dentro do grupo.
            <div className="space-y-4">
              {Array.from(grupos.entries()).map(([catId, itens]) => {
                if (itens.length === 0) return null;
                return (
                  <div key={catId || "sem-categoria"}>
                    <h3 className="text-[11px] font-bold admin-text-secondary uppercase tracking-wider px-1 mb-2">
                      {catName(catId)} · {itens.length}
                    </h3>
                    <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card">
                      <ul className="admin-divide">
                        {itens.map((p, i) => renderItem(p, itens, i))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card">
              <ul className="admin-divide">
                {filtrados.map((p) => renderItem(p))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Modal criar/editar */}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          {(close) => (
            <>
              <ModalHeader
                title={modal.id ? "Editar Produto" : "Novo Produto"}
                subtitle={modal.id ? form.name : "Cadastre um produto do catálogo"}
                onClose={close}
              />
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs admin-text-secondary mb-1.5 block">Nome</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Pomada Matte"
                    className={`transform-gpu w-full admin-surface-subtle admin-input border rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none transition-colors ${formErros.name ? "border-red-500/60" : "border-transparent focus:border-gold/50"}`}
                  />
                  {formErros.name && <p className="text-[11px] text-red-400 mt-1">{formErros.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs admin-text-secondary mb-1.5 block">Preço (R$)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="65"
                      className={`transform-gpu w-full admin-surface-subtle admin-input border rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none transition-colors ${formErros.price ? "border-red-500/60" : "border-transparent focus:border-gold/50"}`}
                    />
                    {formErros.price && <p className="text-[11px] text-red-400 mt-1">{formErros.price}</p>}
                  </div>
                  <div>
                    <label className="text-xs admin-text-secondary mb-1.5 block">Custo (R$)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={form.cost}
                      onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                      placeholder="30"
                      className={`transform-gpu w-full admin-surface-subtle admin-input border rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none transition-colors ${formErros.cost ? "border-red-500/60" : "border-transparent focus:border-gold/50"}`}
                    />
                    {formErros.cost && <p className="text-[11px] text-red-400 mt-1">{formErros.cost}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs admin-text-secondary mb-1.5 block">Estoque (un.)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                      placeholder="0"
                      className={`transform-gpu w-full admin-surface-subtle admin-input border rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none transition-colors ${formErros.stock ? "border-red-500/60" : "border-transparent focus:border-gold/50"}`}
                    />
                    {formErros.stock && <p className="text-[11px] text-red-400 mt-1">{formErros.stock}</p>}
                  </div>
                  <div>
                    <label className="text-xs admin-text-secondary mb-1.5 block">Volume</label>
                    <input
                      value={form.volume}
                      onChange={(e) => setForm((f) => ({ ...f, volume: e.target.value }))}
                      placeholder="100g"
                      className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs admin-text-secondary mb-1.5 block">Categoria</label>
                  <CategorySelect
                    value={form.categoryId}
                    categorias={categorias}
                    onChange={(categoryId) => setForm((f) => ({ ...f, categoryId }))}
                    onGerenciar={() => setGerenciarCat(true)}
                  />
                </div>
                <div>
                  <label className="text-xs admin-text-secondary mb-1.5 block">Descrição</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Breve descrição exibida na vitrine"
                    rows={3}
                    className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none focus:border-gold/50 transition-colors resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  className="flex items-center justify-between w-full admin-surface-subtle rounded-xl px-4 py-3"
                >
                  <span className="text-sm admin-text-primary">Ativo (visível na vitrine)</span>
                  <span className={`w-10 h-6 rounded-full transition-colors relative ${form.active ? "bg-gold" : "admin-surface-subtle"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.active ? "left-[1.125rem]" : "left-0.5"}`} />
                  </span>
                </button>
              </div>
              <div className="p-5 pt-0 flex gap-2">
                <button
                  onClick={close}
                  className="flex-1 admin-surface-subtle admin-text-primary rounded-xl py-3 text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => salvar(close)}
                  disabled={saving || !form.name.trim()}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          {(close) => (
            <>
              <ModalHeader title="Excluir produto" onClose={close} />
              <div className="p-5">
                <p className="text-sm admin-text-secondary">
                  Excluir <span className="admin-text-primary font-medium">{confirmDelete.name}</span> em definitivo?
                  Para apenas escondê-lo da vitrine, use <span className="admin-text-primary">desativar</span>.
                </p>
              </div>
              <div className="p-5 pt-0 flex gap-2">
                <button
                  onClick={close}
                  className="flex-1 admin-surface-subtle admin-text-primary rounded-xl py-3 text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => remover(close)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-bold transition-colors"
                >
                  Excluir
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Gerenciar categorias */}
      {gerenciarCat && (
        <CategoryManagerModal
          type="produto"
          categorias={categorias}
          onClose={() => setGerenciarCat(false)}
        />
      )}
    </div>
  );
}
