"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Plus, Pencil, Trash2, Scissors, Check, ChevronDown, Clock,
  EyeOff, Eye, Sparkles, TrendingUp, Tag,
} from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import {
  subscribeToServices,
  createService,
  updateService,
  deactivateService,
  activateService,
  deleteService,
  seedServicesIfEmpty,
} from "@/lib/services";
import { subscribeToServiceStats, type ServiceStat } from "@/lib/appointments";
import { useAuth } from "@/components/providers/AuthProvider";
import type { BarberService, ServiceCategory } from "@/lib/types";

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  cabelo: "Cabelo",
  barba: "Barba",
  tratamento: "Tratamento",
};

const CATEGORIES: ServiceCategory[] = ["cabelo", "barba", "tratamento"];

type FormState = {
  name: string;
  price: string;
  duration: string;
  description: string;
  category: ServiceCategory;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  price: "",
  duration: "30",
  description: "",
  category: "cabelo",
  active: true,
};

const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

// Dropdown tematizado (substitui o <select> nativo, cujo menu aberto usa o
// estilo branco do SO e quebra o tema do admin). Mesmo padrao do RoleSelect.
function CategorySelect({
  value,
  onChange,
}: {
  value: ServiceCategory;
  onChange: (c: ServiceCategory) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:border-gold/50 transition-colors"
      >
        <span className="admin-text-primary">{CATEGORY_LABEL[value]}</span>
        <ChevronDown className={`w-4 h-4 admin-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="admin-surface-subtle rounded-xl p-1 mt-1">
            {CATEGORIES.map((c) => {
              const sel = c === value;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => { onChange(c); setOpen(false); }}
                  className={`admin-glass-card-hover flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${sel ? "text-gold" : "admin-text-primary"}`}
                >
                  {CATEGORY_LABEL[c]}
                  {sel && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // modal: null = fechado, { id: null } = novo, { id } = editando
  const [modal, setModal] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<BarberService | null>(null);

  useEffect(() => {
    const unsub = subscribeToServices((lista) => {
      setServicos(lista);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Analise simples: agrega agendamentos por serviceId (toda a coleção).
  // Só assina se o usuário pode ver a agenda de todos (senão a query é negada).
  useEffect(() => {
    if (!podeVerAnalise) return;
    const unsub = subscribeToServiceStats(setStatsByService);
    return unsub;
  }, [podeVerAnalise]);

  const abrirNovo = () => {
    setForm({ ...EMPTY_FORM, active: true });
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
      active: s.active ?? true,
    });
    setModal({ id: s.id });
  };

  const salvar = async (close: () => void) => {
    const name = form.name.trim();
    const price = Number(form.price);
    const duration = Number(form.duration);
    if (!name || saving || Number.isNaN(price) || Number.isNaN(duration)) return;
    setSaving(true);
    try {
      const payload = {
        name,
        price,
        duration,
        description: form.description.trim(),
        category: form.category,
        active: form.active,
      };
      if (modal?.id) {
        await updateService(modal.id, payload);
      } else {
        // novo entra no fim da ordem
        await createService({ ...payload, order: servicos.length });
      }
      close();
    } finally {
      setSaving(false);
    }
  };

  const remover = async (close: () => void) => {
    if (!confirmDelete) return;
    await deleteService(confirmDelete.id);
    close();
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

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Serviços</h1>
          <p className="text-slate-300 text-sm mt-1">
            {servicos.length} cadastrados · {ativos} ativos
          </p>
        </div>
        <button
          onClick={abrirNovo}
          className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Serviço</span>
        </button>
      </div>

      {/* Analise simples — só para quem vê a agenda de todos (admin master) */}
      {servicos.length > 0 && podeVerAnalise && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
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
          <div className="transform-gpu rounded-2xl admin-glass-card p-4 col-span-2 lg:col-span-1">
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
        <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card">
          <ul className="admin-divide">
            {servicos.map((s) => {
              const active = s.active ?? true;
              const bookings = statsByService[s.id]?.count ?? 0;
              return (
                <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0 ${!active ? "opacity-40" : ""}`}>
                    <Scissors className="w-5 h-5 text-gold" />
                  </div>
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
                      {brl(s.price)} · {s.duration}min · {CATEGORY_LABEL[s.category]}
                      {bookings > 0 ? ` · ${bookings} agend.` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => active ? deactivateService(s.id) : activateService(s.id)}
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
            })}
          </ul>
        </div>
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
                    className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                  />
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
                      className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs admin-text-secondary mb-1.5 block">Duração (min)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={form.duration}
                      onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                      placeholder="30"
                      className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm admin-text-primary focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs admin-text-secondary mb-1.5 block">Categoria</label>
                  <CategorySelect
                    value={form.category}
                    onChange={(category) => setForm((f) => ({ ...f, category }))}
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
    </div>
  );
}
