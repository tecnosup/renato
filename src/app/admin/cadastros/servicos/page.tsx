"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Plus, Pencil, Trash2, Scissors, ChevronUp, ChevronDown, Clock,
  EyeOff, Eye, Sparkles, TrendingUp, Tag, Search, AlertCircle, DollarSign,
} from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  subscribeToServices,
  createService,
  updateService,
  deactivateService,
  activateService,
  deleteService,
  seedServicesIfEmpty,
  swapServiceOrder,
} from "@/lib/services";
import {
  subscribeToCategories,
  seedServiceCategoriesIfEmpty,
  migrateServiceCategories,
  serviceCategoryId,
} from "@/lib/categories";
import { CategoryManagerModal } from "@/components/admin/CategoryManagerModal";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { subscribeToServiceStats, type ServiceStat } from "@/lib/appointments";
import { useAuth } from "@/components/providers/AuthProvider";
import type { BarberService, ServiceCategory, Category } from "@/lib/types";

type FormState = {
  name: string;
  price: string;
  duration: string;
  description: string;
  categoryId: string;
  category: ServiceCategory; // mantido para compatibilidade do payload legado
  active: boolean;
  imageUrl: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  price: "",
  duration: "30",
  description: "",
  categoryId: "",
  category: "cabelo",
  active: true,
  imageUrl: "",
};

const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

export default function ServicosPage() {
  // Suspense exigido pelo useSearchParams (abrir cadastro via ?novo=1 da sidebar).
  return (
    <Suspense fallback={null}>
      <ServicosPageInner />
    </Suspense>
  );
}

function ServicosPageInner() {
  const [servicos, setServicos] = useState<BarberService[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // stats de agendamentos por serviceId (analise simples)
  const [statsByService, setStatsByService] = useState<Record<string, ServiceStat>>({});

  // Análise lê appointments sem filtro -> só liberada para quem vê a agenda de
  // todos (owner raiz = perms undefined, ou verAgendaTodos). Casa com a rule
  // canSeeAllAgenda(); evita o permission-denied para barbeiro restrito.
  const { perms } = useAuth();
  const podeVerAnalise = perms === undefined || perms.verAgendaTodos === true;
  // Seed/migração escrevem no Firestore -> só quem tem gerenciarCadastros
  // (owner raiz = perms undefined). Casa com a rule canManageCadastros(); evita
  // o permission-denied silencioso para barbeiro restrito ao abrir a tela.
  const podeGerenciarCadastros = perms === undefined || perms.gerenciarCadastros === true;

  // modal: null = fechado, { id: null } = novo, { id } = editando
  const [modal, setModal] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<BarberService | null>(null);

  // Busca + filtro (estado local, não toca o Firestore).
  const [busca, setBusca] = useState("");
  // null = todas; "inativos" = só os desativados; senão = id de categoria.
  const [filtroCategoria, setFiltroCategoria] = useState<string | "inativos" | null>(null);

  // Categorias dinâmicas (Firestore, type "servico").
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [gerenciarCat, setGerenciarCat] = useState(false);

  // Feedback de erro inline (operações de escrita que falham).
  const [erro, setErro] = useState<string | null>(null);
  // Erros de validação por campo no modal.
  const [formErros, setFormErros] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = subscribeToServices((lista) => {
      setServicos(lista);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Garante as categorias legadas e migra serviços antigos (enum -> categoryId)
  // uma vez ao montar; depois assina a lista em tempo real. Seed/migração só
  // para quem pode escrever cadastros — senão as Rules negam (permission-denied).
  useEffect(() => {
    if (podeGerenciarCadastros) {
      seedServiceCategoriesIfEmpty()
        .then(() => migrateServiceCategories())
        .catch(() => {});
    }
    const unsub = subscribeToCategories("servico", setCategorias);
    return unsub;
  }, [podeGerenciarCadastros]);

  // Analise simples: agrega agendamentos por serviceId (toda a coleção).
  // Só assina se o usuário pode ver a agenda de todos (senão a query é negada).
  useEffect(() => {
    if (!podeVerAnalise) return;
    const unsub = subscribeToServiceStats(setStatsByService);
    return unsub;
  }, [podeVerAnalise]);

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

  const abrirEdicao = (s: BarberService) => {
    setForm({
      name: s.name,
      price: String(s.price),
      duration: String(s.duration),
      description: s.description,
      category: s.category,
      // categoryId existente, ou derivado do enum legado.
      categoryId: s.categoryId ?? serviceCategoryId(s.category),
      active: s.active ?? true,
      imageUrl: s.imageUrl ?? "",
    });
    setFormErros({});
    setModal({ id: s.id });
  };

  // Valida o formulário; retorna o mapa de erros (vazio = ok).
  const validarForm = (): Record<string, string> => {
    const e: Record<string, string> = {};
    const name = form.name.trim();
    const price = Number(form.price);
    const duration = Number(form.duration);

    if (!name) e.name = "Informe o nome do serviço.";
    else {
      // nome duplicado (ignora o próprio em edição)
      const dup = servicos.some(
        (s) => s.id !== modal?.id && s.name.trim().toLowerCase() === name.toLowerCase()
      );
      if (dup) e.name = "Já existe um serviço com esse nome.";
    }
    if (form.price === "" || Number.isNaN(price) || price <= 0) e.price = "Preço deve ser maior que zero.";
    if (form.duration === "" || Number.isNaN(duration) || duration <= 0) e.duration = "Duração deve ser maior que zero.";
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
        duration: Number(form.duration),
        description: form.description.trim(),
        category: form.category, // mantém o enum legado preenchido
        categoryId: form.categoryId,
        active: form.active,
        imageUrl: form.imageUrl.trim() || undefined,
      };
      if (modal?.id) {
        await updateService(modal.id, payload);
      } else {
        // novo entra no fim da ordem
        await createService({ ...payload, order: servicos.length });
      }
      close();
    } catch {
      setErro("Não foi possível salvar o serviço. Verifique sua conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const remover = async (close: () => void) => {
    if (!confirmDelete) return;
    try {
      await deleteService(confirmDelete.id);
      close();
    } catch {
      setErro("Não foi possível excluir o serviço. Tente novamente.");
    }
  };

  // Wrappers com feedback de erro para as ações rápidas da lista.
  const toggleAtivo = async (s: BarberService) => {
    try {
      await ((s.active ?? true) ? deactivateService(s.id) : activateService(s.id));
    } catch {
      setErro("Não foi possível alterar o status do serviço.");
    }
  };

  const popular = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      await seedServicesIfEmpty();
    } finally {
      setSeeding(false);
    }
  };

  // Reordena trocando `order` entre o item e o vizinho (cima/baixo) no grupo.
  const reordenar = async (grupo: BarberService[], from: number, to: number) => {
    const a = grupo[from];
    const b = grupo[to];
    if (!a || !b) return;
    try {
      await swapServiceOrder(
        { id: a.id, order: a.order ?? from },
        { id: b.id, order: b.order ?? to }
      );
    } catch {
      setErro("Não foi possível reordenar. Tente novamente.");
    }
  };

  const ativos = servicos.filter((s) => s.active ?? true).length;

  // Servico mais procurado (analise simples)
  const maisProcurado = useMemo(() => {
    let topId: string | null = null;
    let topCount = 0;
    for (const [id, stat] of Object.entries(statsByService)) {
      if (stat.count > topCount) { topCount = stat.count; topId = id; }
    }
    const svc = servicos.find((s) => s.id === topId);
    return svc ? { name: svc.name, count: topCount } : null;
  }, [statsByService, servicos]);

  // Totais agregados para análise (faturamento e nº de agendamentos).
  const { totalBookings, totalRevenue } = useMemo(() => {
    let b = 0, r = 0;
    for (const stat of Object.values(statsByService)) { b += stat.count; r += stat.revenue; }
    return { totalBookings: b, totalRevenue: r };
  }, [statsByService]);

  // Resolve o id de categoria de um serviço (dinâmico, com fallback do enum).
  const catIdOf = (s: BarberService) => s.categoryId ?? serviceCategoryId(s.category);
  // Nome de uma categoria pelo id (para exibição).
  const catName = (id: string) => categorias.find((c) => c.id === id)?.name ?? "Outros";

  // Aplica busca (nome) + filtro de categoria/inativos.
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return servicos.filter((s) => {
      if (termo && !s.name.toLowerCase().includes(termo)) return false;
      if (filtroCategoria === "inativos") return !(s.active ?? true);
      if (filtroCategoria) return catIdOf(s) === filtroCategoria;
      return true;
    });
  }, [servicos, busca, filtroCategoria]);

  // Sem busca nem filtro de categoria, exibimos agrupado por categoria e a
  // reordenação por setas fica ativa (ordem reflete o campo `order`/landing).
  const semFiltro = !busca.trim() && filtroCategoria === null;

  // Grupos por categoria (na ordem das categorias), preservando a ordem dos
  // serviços. Categorias sem itens são omitidas na renderização.
  const grupos = useMemo(() => {
    const map = new Map<string, BarberService[]>();
    for (const c of categorias) map.set(c.id, []);
    for (const s of filtrados) {
      const id = catIdOf(s);
      if (!map.has(id)) map.set(id, []); // categoria removida -> grupo "Outros"
      map.get(id)!.push(s);
    }
    return map;
  }, [filtrados, categorias]);

  // Renderiza um item da lista. Quando recebe `grupo`+`idx` (modo agrupado sem
  // filtro), habilita as setas de reordenação dentro daquele grupo.
  const renderItem = (s: BarberService, grupo?: BarberService[], idx?: number) => {
    const active = s.active ?? true;
    const stat = statsByService[s.id];
    const bookings = stat?.count ?? 0;
    const revenue = stat?.revenue ?? 0;
    const podeReordenar = grupo !== undefined && idx !== undefined;
    return (
      <li key={s.id} className="flex items-center gap-3 px-4 py-3">
        {podeReordenar && (
          <div className="flex flex-col shrink-0 -my-1">
            <button
              onClick={() => idx! > 0 && reordenar(grupo!, idx!, idx! - 1)}
              disabled={idx === 0}
              className="admin-text-secondary hover:text-gold disabled:opacity-25 disabled:hover:text-current transition-colors"
              aria-label="Mover para cima"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => idx! < grupo!.length - 1 && reordenar(grupo!, idx!, idx! + 1)}
              disabled={idx === grupo!.length - 1}
              className="admin-text-secondary hover:text-gold disabled:opacity-25 disabled:hover:text-current transition-colors"
              aria-label="Mover para baixo"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
        {s.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagem do R2/CDN
          <img
            src={s.imageUrl}
            alt={s.name}
            className={`w-10 h-10 rounded-xl object-cover shrink-0 ${!active ? "opacity-40" : ""}`}
          />
        ) : (
          <div className={`w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0 ${!active ? "opacity-40" : ""}`}>
            <Scissors className="w-5 h-5 text-gold" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium admin-text-primary truncate">{s.name}</p>
            {!active && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full admin-surface-subtle admin-text-secondary shrink-0">
                Inativo
              </span>
            )}
          </div>
          <p className="text-xs admin-text-secondary truncate mt-0.5">
            {brl(s.price)} · {s.duration}min · {catName(catIdOf(s))}
            {podeVerAnalise && bookings > 0 ? ` · ${bookings} agend. · ${brl(revenue)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggleAtivo(s)}
            className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-gold transition-colors"
            aria-label={active ? "Desativar" : "Ativar"}
            title={active ? "Desativar" : "Ativar"}
          >
            {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => abrirEdicao(s)}
            className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-gold transition-colors"
            aria-label="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete(s)}
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
      <PageHeader
        className="mb-5"
        icon={Scissors}
        title="Serviços"
        subtitle={`${servicos.length} cadastrados · ${ativos} ativos`}
        action={
          <button
            onClick={abrirNovo}
            className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Serviço</span>
          </button>
        }
      />

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

      {/* Analise simples — só para quem vê a agenda de todos (admin master) */}
      {servicos.length > 0 && podeVerAnalise && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="transform-gpu rounded-2xl admin-glass-card p-4">
            <div className="flex items-center gap-2 admin-text-secondary text-xs mb-1">
              <Tag className="w-3.5 h-3.5" /> Total
            </div>
            <p className="text-xl font-bold admin-text-primary">{servicos.length}</p>
            <p className="text-[11px] admin-text-secondary mt-0.5">{ativos} ativos</p>
          </div>
          <div className="transform-gpu rounded-2xl admin-glass-card p-4">
            <div className="flex items-center gap-2 admin-text-secondary text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Mais procurado
            </div>
            <p className="text-sm font-bold admin-text-primary truncate">
              {maisProcurado ? maisProcurado.name : "—"}
            </p>
            <p className="text-[11px] admin-text-secondary mt-0.5">
              {maisProcurado ? `${maisProcurado.count} agendamentos` : "sem dados ainda"}
            </p>
          </div>
          <div className="transform-gpu rounded-2xl admin-glass-card p-4">
            <div className="flex items-center gap-2 admin-text-secondary text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" /> Faturamento
            </div>
            <p className="text-xl font-bold admin-text-primary">{brl(totalRevenue)}</p>
            <p className="text-[11px] admin-text-secondary mt-0.5">{totalBookings} agendamentos</p>
          </div>
          <div className="transform-gpu rounded-2xl admin-glass-card p-4">
            <div className="flex items-center gap-2 admin-text-secondary text-xs mb-1">
              <Clock className="w-3.5 h-3.5" /> Ticket médio
            </div>
            <p className="text-xl font-bold admin-text-primary">
              {servicos.length > 0
                ? brl(Math.round(servicos.reduce((acc, s) => acc + s.price, 0) / servicos.length))
                : "—"}
            </p>
            <p className="text-[11px] admin-text-secondary mt-0.5">preço médio do catálogo</p>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="transform-gpu rounded-2xl admin-glass-card p-8 text-center">
          <p className="text-sm admin-text-secondary">Carregando...</p>
        </div>
      ) : servicos.length === 0 ? (
        <div className="transform-gpu rounded-2xl admin-glass-card p-8 text-center">
          <div className="w-12 h-12 rounded-full admin-surface-subtle flex items-center justify-center mx-auto mb-3">
            <Scissors className="w-5 h-5 text-gold" />
          </div>
          <p className="text-sm font-medium admin-text-primary">Nenhum serviço cadastrado</p>
          <p className="text-xs admin-text-secondary mt-1">
            Cadastre os serviços para que apareçam no agendamento da landing.
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
          {/* Busca + filtros por categoria. Envolto num card para ter contraste
              sobre a imagem de fundo (sem card, o glass deixa o fundo vazar e o
              texto some — ver docs/admin-theme.md). */}
          <div className="transform-gpu rounded-2xl admin-glass-card p-3 flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 admin-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar serviço..."
                className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm admin-text-primary focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { key: null as string | null, label: "Todos" },
                ...categorias.map((c) => ({ key: c.id as string | null, label: c.name })),
                { key: "inativos" as string | null, label: "Inativos" },
              ].map(({ key, label }) => {
                const sel = filtroCategoria === key;
                return (
                  <button
                    key={label}
                    onClick={() => setFiltroCategoria(key)}
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
              <p className="text-sm admin-text-secondary">Nenhum serviço encontrado.</p>
            </div>
          ) : semFiltro ? (
            // Agrupado por categoria, com reordenação por setas dentro de cada grupo.
            <div className="space-y-4">
              {Array.from(grupos.entries()).map(([catId, itens]) => {
                if (itens.length === 0) return null;
                return (
                  <div key={catId}>
                    {/* Label solto sobre a imagem de fundo -> branco fixo
                        (regra "texto sobre o fundo" de docs/admin-theme.md),
                        senão o cinza translúcido some no fundo. */}
                    <h3 className="text-[11px] font-bold text-slate-100 uppercase tracking-wider px-1 mb-2 drop-shadow">
                      {catName(catId)} · {itens.length}
                    </h3>
                    <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card">
                      <ul className="admin-divide">
                        {itens.map((s, i) => renderItem(s, itens, i))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Lista plana (busca ou filtro ativo) — sem reordenação.
            <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card">
              <ul className="admin-divide">
                {filtrados.map((s) => renderItem(s))}
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
                title={modal.id ? "Editar Serviço" : "Novo Serviço"}
                subtitle={modal.id ? form.name : "Cadastre um serviço do catálogo"}
                onClose={close}
              />
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs admin-text-secondary mb-1.5 block">Nome</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Corte de Assinatura"
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
                      placeholder="90"
                      className={`transform-gpu w-full admin-surface-subtle admin-input border rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none transition-colors ${formErros.price ? "border-red-500/60" : "border-transparent focus:border-gold/50"}`}
                    />
                    {formErros.price && <p className="text-[11px] text-red-400 mt-1">{formErros.price}</p>}
                  </div>
                  <div>
                    <label className="text-xs admin-text-secondary mb-1.5 block">Duração (min)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={form.duration}
                      onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                      placeholder="30"
                      className={`transform-gpu w-full admin-surface-subtle admin-input border rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none transition-colors ${formErros.duration ? "border-red-500/60" : "border-transparent focus:border-gold/50"}`}
                    />
                    {formErros.duration && <p className="text-[11px] text-red-400 mt-1">{formErros.duration}</p>}
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
                    placeholder="Breve descrição exibida na landing"
                    rows={3}
                    className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none focus:border-gold/50 transition-colors resize-none"
                  />
                </div>
                <ImageUploadField
                  value={form.imageUrl}
                  folder="servicos"
                  label="Foto do serviço"
                  onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  className="flex items-center justify-between w-full admin-surface-subtle rounded-xl px-4 py-3"
                >
                  <span className="text-sm admin-text-primary">Ativo (visível na landing)</span>
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
              <ModalHeader title="Excluir serviço" onClose={close} />
              <div className="p-5">
                <p className="text-sm admin-text-secondary">
                  Excluir <span className="admin-text-primary font-medium">{confirmDelete.name}</span> em definitivo?
                  Para apenas escondê-lo da landing, use <span className="admin-text-primary">desativar</span>.
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
          type="servico"
          categorias={categorias}
          onClose={() => setGerenciarCat(false)}
        />
      )}
    </div>
  );
}
