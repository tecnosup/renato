"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { UserPlus, X, Pencil, Trash2, Phone, Scissors, Check, ChevronDown, KeyRound, ShieldCheck, UserCog, Tags, Crown, Calendar, MoreVertical } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { useAuth } from "@/components/providers/AuthProvider";
import { AccessModal } from "./AccessModal";
import { CategoriasModal } from "./CategoriasModal";
import {
  subscribeToEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  upsertOwnerBarber,
} from "@/lib/employees";
import { subscribeToEmployeeCategories } from "@/lib/employee-categories";
import type { Employee, EmployeeCategory } from "@/lib/types";

const avatarColors = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

function getInitials(nome: string) {
  return nome.trim().split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

// Avatar: foto se houver, senão iniciais coloridas (fallback do projeto).
function Avatar({ name, photoUrl, colorIndex, dim }: { name: string; photoUrl?: string | null; colorIndex: number; dim?: boolean }) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- imagem do R2/CDN, fora do otimizador do Next
      <img
        src={photoUrl}
        alt={name}
        className={`w-10 h-10 rounded-full object-cover shrink-0 border border-white/10 ${dim ? "opacity-40" : ""}`}
      />
    );
  }
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColors[colorIndex % avatarColors.length]} ${dim ? "opacity-40" : ""}`}>
      {getInitials(name)}
    </div>
  );
}

type FormState = { name: string; categoryId: string; phone: string; active: boolean; photoUrl: string };
const EMPTY_FORM: FormState = { name: "", categoryId: "", phone: "", active: true, photoUrl: "" };

// Dropdown tematizado de categoria (substitui o <select> nativo, cujo menu aberto
// usa o estilo branco do SO e quebra o tema do admin).
function CategorySelect({
  value,
  categories,
  onChange,
}: {
  value: string;
  categories: EmployeeCategory[];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:border-gold/50 transition-colors"
      >
        <span className={selected ? "admin-text-primary" : "admin-text-secondary"}>
          {selected ? selected.name : "Selecione uma categoria"}
        </span>
        <ChevronDown className={`w-4 h-4 admin-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="admin-surface-subtle rounded-xl p-1 mt-1">
            {categories.map((c) => {
              const sel = c.id === value;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c.id); setOpen(false); }}
                  className={`admin-glass-card-hover flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${sel ? "text-gold" : "admin-text-primary"}`}
                >
                  <span className="flex items-center gap-2">
                    {c.name}
                    {c.bookable && <Calendar className="w-3 h-3 text-gold/70" />}
                  </span>
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

export default function FuncionariosPage() {
  // Suspense exigido pelo useSearchParams (abrir cadastro via ?novo=1 da sidebar).
  return (
    <Suspense fallback={null}>
      <FuncionariosPageInner />
    </Suspense>
  );
}

function FuncionariosPageInner() {
  const { user, perms, loading: authLoading } = useAuth();
  // Owner-raiz loga sem custom claims (perms undefined). Só ele vê/configura o
  // card "também atendo como barbeiro".
  const isOwnerUser = !authLoading && !!user && perms === undefined;

  const [funcionarios, setFuncionarios] = useState<Employee[]>([]);
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // modal: null = fechado, { id: null } = novo, { id } = editando, owner = perfil do dono
  const [modal, setModal] = useState<{ id: string | null; owner?: boolean } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);
  const [acessoPara, setAcessoPara] = useState<Employee | null>(null);
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const unsubEmp = subscribeToEmployees((lista) => {
      setFuncionarios(lista);
      setLoading(false);
    });
    const unsubCat = subscribeToEmployeeCategories(setCategories);
    return () => { unsubEmp(); unsubCat(); };
  }, []);

  // Separa o doc-espelho do proprietário (isOwner) do resto: ele tem card próprio.
  const ownerBarber = useMemo(() => funcionarios.find((f) => f.isOwner) ?? null, [funcionarios]);
  const equipe = useMemo(() => funcionarios.filter((f) => !f.isOwner), [funcionarios]);

  const countByCategory = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const f of equipe) if (f.categoryId) acc[f.categoryId] = (acc[f.categoryId] ?? 0) + 1;
    return acc;
  }, [equipe]);

  // Agrupa por categoria (na ordem das categorias) + bucket "Sem categoria".
  const grupos = useMemo(() => {
    const known = new Set(categories.map((c) => c.id));
    const byCat = categories.map((cat) => ({
      cat,
      membros: equipe.filter((f) => f.categoryId === cat.id),
    }));
    const semCategoria = equipe.filter((f) => !f.categoryId || !known.has(f.categoryId));
    return { byCat, semCategoria };
  }, [categories, equipe]);

  const abrirNovo = () => {
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" });
    setModal({ id: null });
  };

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("novo") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deep-link abre o modal
      abrirNovo();
      router.replace(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname, router]);

  const abrirEdicao = (f: Employee) => {
    setForm({
      name: f.name,
      categoryId: f.categoryId ?? "",
      phone: f.phone,
      active: f.active,
      photoUrl: f.photoUrl ?? "",
    });
    setModal({ id: f.id });
  };

  // Abre o MESMO modal de edição para o perfil de barbeiro do proprietário.
  // Pré-seleciona uma categoria agendável; "Ativo" significa "atendo como barbeiro".
  const abrirOwner = () => {
    const bookableCats = categories.filter((c) => c.bookable);
    setForm({
      name: ownerBarber?.name || (user?.email?.split("@")[0] ?? "Proprietário"),
      categoryId: ownerBarber?.categoryId ?? bookableCats[0]?.id ?? "",
      phone: "",
      active: ownerBarber ? ownerBarber.active : true,
      photoUrl: ownerBarber?.photoUrl ?? "",
    });
    setModal({ id: ownerBarber?.id ?? null, owner: true });
  };

  const salvar = async (close: () => void) => {
    const name = form.name.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      // role/permissões base = da categoria escolhida (base do RBAC ao dar acesso).
      const cat = categories.find((c) => c.id === form.categoryId);
      const role = cat?.preset ?? "barbeiro";
      const bookable = cat?.bookable ?? false;

      if (modal?.owner) {
        await upsertOwnerBarber({
          ownerDocId: modal.id,
          name,
          role,
          categoryId: form.categoryId || null,
          photoUrl: form.photoUrl || null,
          bookable,
          active: form.active,
        });
      } else {
        const payload = {
          name,
          role,
          phone: form.phone.trim(),
          active: form.active,
          categoryId: form.categoryId || null,
          photoUrl: form.photoUrl || null,
          bookable,
        };
        if (modal?.id) {
          await updateEmployee(modal.id, payload);
        } else {
          await createEmployee(payload);
        }
      }
      close();
    } finally {
      setSaving(false);
    }
  };

  const remover = async (close: () => void) => {
    if (!confirmDelete) return;
    await deleteEmployee(confirmDelete.id);
    close();
  };

  // Cria as 3 categorias padrão (migração suave do antigo campo "cargo").
  const seedCategorias = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      const { createEmployeeCategory } = await import("@/lib/employee-categories");
      const { ROLE_PRESETS } = await import("@/lib/types");
      await createEmployeeCategory({ name: "Barbeiro", preset: "barbeiro", perms: { ...ROLE_PRESETS.barbeiro }, bookable: true, order: 0 });
      await createEmployeeCategory({ name: "Recepcionista", preset: "recepcionista", perms: { ...ROLE_PRESETS.recepcionista }, bookable: false, order: 1 });
      await createEmployeeCategory({ name: "Gerente", preset: "gerente", perms: { ...ROLE_PRESETS.gerente }, bookable: false, order: 2 });
    } finally {
      setSeeding(false);
    }
  };

  const ativos = equipe.filter((f) => f.active).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
      <PageHeader
        className="mb-5"
        icon={UserCog}
        title="Funcionários"
        subtitle={`${equipe.length} cadastrados · ${ativos} ativos`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCategoriasOpen(true)}
              className="transform-gpu admin-glass-card admin-glass-card-hover admin-text-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-gold flex items-center gap-2"
            >
              <Tags className="w-4 h-4" />
              <span className="hidden sm:inline">Categorias</span>
            </button>
            <button
              onClick={abrirNovo}
              className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Funcionário</span>
            </button>
          </div>
        }
      />

      {/* Card do proprietário (hierarquia). Só o owner-raiz vê e configura. */}
      {isOwnerUser && (
        <div className="transform-gpu rounded-2xl admin-glass-card p-4 mb-4 border border-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#ece4cb] to-[#c2a35d] flex items-center justify-center text-slate-950 shrink-0 shadow-[0_0_12px_rgba(194,163,93,0.45)]">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold admin-text-primary truncate">
                  {ownerBarber?.name || user?.email?.split("@")[0] || "Proprietário"}
                </p>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gold/15 text-gold shrink-0">
                  Proprietário
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 min-w-0">
                {user?.email && (
                  <p className="text-xs admin-text-secondary truncate">{user.email}</p>
                )}
                {ownerBarber?.active && (
                  <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full admin-surface-subtle admin-text-secondary shrink-0">
                    <Scissors className="w-2.5 h-2.5" />
                    {categories.find((c) => c.id === ownerBarber.categoryId)?.name ?? "Barbeiro"}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={abrirOwner}
              title={ownerBarber && ownerBarber.active ? "Editar perfil" : "Atender como barbeiro"}
              className="text-xs px-2.5 sm:px-3 py-2 rounded-lg admin-surface-subtle admin-text-secondary hover:text-gold transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                {ownerBarber && ownerBarber.active ? "Editar perfil" : "Atender como barbeiro"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Aviso: ainda não há categorias */}
      {!loading && categories.length === 0 && (
        <div className="transform-gpu rounded-2xl admin-glass-card p-5 mb-4 text-center">
          <div className="w-12 h-12 rounded-full admin-surface-subtle flex items-center justify-center mx-auto mb-3">
            <Tags className="w-5 h-5 text-gold" />
          </div>
          <p className="text-sm font-medium admin-text-primary">Crie as categorias da equipe</p>
          <p className="text-xs admin-text-secondary mt-1">
            Organize os funcionários por categoria (Barbeiro, Recepcionista, Caixa…).
          </p>
          <button
            onClick={seedCategorias}
            disabled={seeding}
            className="mt-4 inline-flex items-center gap-2 admin-surface-subtle admin-text-primary text-xs px-4 py-2 rounded-lg hover:bg-gold/15 hover:text-gold transition-colors disabled:opacity-50"
          >
            <Tags className="w-3.5 h-3.5" /> {seeding ? "Criando…" : "Criar categorias padrão"}
          </button>
        </div>
      )}

      {/* Lista agrupada */}
      {loading ? (
        <div className="transform-gpu rounded-2xl admin-glass-card p-8 text-center">
          <p className="text-sm admin-text-secondary">Carregando...</p>
        </div>
      ) : equipe.length === 0 ? (
        <div className="transform-gpu rounded-2xl admin-glass-card p-8 text-center">
          <div className="w-12 h-12 rounded-full admin-surface-subtle flex items-center justify-center mx-auto mb-3">
            <Scissors className="w-5 h-5 text-gold" />
          </div>
          <p className="text-sm font-medium admin-text-primary">Nenhum funcionário cadastrado</p>
          <p className="text-xs admin-text-secondary mt-1">
            Cadastre os barbeiros para que apareçam no agendamento.
          </p>
          <button
            onClick={abrirNovo}
            className="mt-4 inline-flex items-center gap-2 admin-surface-subtle admin-text-primary text-xs px-4 py-2 rounded-lg hover:bg-gold/15 hover:text-gold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" /> Cadastrar primeiro
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {grupos.byCat.map(({ cat, membros }) =>
            membros.length === 0 ? null : (
              <CategoriaSecao
                key={cat.id}
                titulo={cat.name}
                bookable={cat.bookable}
                membros={membros}
                onEdit={abrirEdicao}
                onAcesso={setAcessoPara}
                onDelete={setConfirmDelete}
              />
            )
          )}
          {grupos.semCategoria.length > 0 && (
            <CategoriaSecao
              titulo="Sem categoria"
              bookable={false}
              membros={grupos.semCategoria}
              onEdit={abrirEdicao}
              onAcesso={setAcessoPara}
              onDelete={setConfirmDelete}
            />
          )}
        </div>
      )}

      {/* Modal criar/editar funcionário */}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          {(close) => (
            <>
              <div className="flex items-center justify-between px-6 pt-6 pb-1">
                <h3 className="text-base font-bold admin-text-primary flex items-center gap-2">
                  {modal.owner && <Crown className="w-4 h-4 text-gold" />}
                  {modal.owner ? "Meu perfil de barbeiro" : modal.id ? "Editar funcionário" : "Novo funcionário"}
                </h3>
                <button onClick={close} className="group admin-text-primary hover:opacity-80">
                  <X className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90" />
                </button>
              </div>

              <div className="px-6 space-y-3">
                <ImageUploadField
                  value={form.photoUrl}
                  folder="barbeiros"
                  label="Foto de perfil"
                  onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))}
                />
                <div>
                  <label className="text-xs admin-text-secondary mb-1 block">Nome</label>
                  <input
                    type="text"
                    placeholder="Ex: Renato Silva"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs admin-text-secondary mb-1 block">Categoria</label>
                  {(() => {
                    // No modo owner só fazem sentido categorias agendáveis.
                    const opcoes = modal.owner ? categories.filter((c) => c.bookable) : categories;
                    if (opcoes.length === 0) {
                      return (
                        <p className="text-xs admin-text-secondary admin-surface-subtle rounded-xl px-4 py-3">
                          {modal.owner
                            ? "Nenhuma categoria agendável. Marque uma como “Agendável” em Categorias."
                            : <>Nenhuma categoria. Crie em <span className="text-gold">Categorias</span> primeiro.</>}
                        </p>
                      );
                    }
                    return (
                      <CategorySelect
                        value={form.categoryId}
                        categories={opcoes}
                        onChange={(id) => setForm({ ...form, categoryId: id })}
                      />
                    );
                  })()}
                </div>
                {!modal.owner && (
                  <div>
                    <label className="text-xs admin-text-secondary mb-1 block">WhatsApp (opcional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
                      <input
                        type="tel"
                        placeholder="11999999999"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="transform-gpu w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className="flex items-center justify-between w-full admin-surface-subtle rounded-xl px-4 py-3"
                >
                  <div className="text-left pr-3">
                    <p className="text-sm admin-text-primary">{modal.owner ? "Atendo como barbeiro" : "Ativo"}</p>
                    <p className="text-[11px] admin-text-secondary">
                      {modal.owner ? "Apareço na agenda e ganho a aba “Meu Financeiro”" : "Aparece como opção no agendamento"}
                    </p>
                  </div>
                  <span className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${form.active ? "bg-gold" : "admin-surface-subtle border border-white/10"}`}>
                    <span className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-sm transition-[left] duration-200 ${form.active ? "left-[22px]" : "left-0.5"}`} />
                  </span>
                </button>
              </div>

              <div className="flex gap-3 px-6 pt-4 pb-6">
                <button
                  onClick={close}
                  className="transform-gpu flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => salvar(close)}
                  disabled={!form.name.trim() || saving}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Salvando..." : modal.owner ? "Salvar" : modal.id ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)} panelClassName="admin-glass-modal sm:max-w-sm">
          {(close) => (
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold admin-text-primary">Excluir funcionário?</h3>
                <p className="text-xs admin-text-secondary mt-1">
                  <span className="font-semibold admin-text-primary">{confirmDelete.name}</span> será removido definitivamente.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={close}
                  className="transform-gpu flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => remover(close)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Modal criar acesso (login + permissões) */}
      {acessoPara && (
        <AccessModal
          employee={acessoPara}
          defaultPerms={categories.find((c) => c.id === acessoPara.categoryId)?.perms}
          onClose={() => setAcessoPara(null)}
        />
      )}

      {/* Modal gerenciar categorias */}
      {categoriasOpen && (
        <CategoriasModal
          categories={categories}
          countByCategory={countByCategory}
          onClose={() => setCategoriasOpen(false)}
        />
      )}
    </div>
  );
}

// Seção de uma categoria com seus cards.
function CategoriaSecao({
  titulo,
  bookable,
  membros,
  onEdit,
  onAcesso,
  onDelete,
}: {
  titulo: string;
  bookable: boolean;
  membros: Employee[];
  onEdit: (f: Employee) => void;
  onAcesso: (f: Employee) => void;
  onDelete: (f: Employee) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wide admin-text-secondary">{titulo}</h3>
        {bookable && <Calendar className="w-3 h-3 text-gold/70" />}
        <span className="text-[10px] admin-text-secondary">· {membros.length}</span>
      </div>
      <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card">
        <ul className="admin-divide">
          {membros.map((f, i) => (
            <EmployeeRow
              key={f.id}
              f={f}
              colorIndex={i}
              onEdit={onEdit}
              onAcesso={onAcesso}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

// Linha de funcionário. Ações: inline (3 botões) no desktop; no mobile um "⋯"
// que expande a barra de ações ABAIXO (cresce pra baixo dentro do card, sem ser
// cortado pelo overflow-hidden), liberando a largura toda para o nome.
function EmployeeRow({
  f,
  colorIndex,
  onEdit,
  onAcesso,
  onDelete,
}: {
  f: Employee;
  colorIndex: number;
  onEdit: (f: Employee) => void;
  onAcesso: (f: Employee) => void;
  onDelete: (f: Employee) => void;
}) {
  const [open, setOpen] = useState(false);
  const acessoLabel = f.authUid ? "Gerenciar acesso" : "Criar acesso";

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar name={f.name} photoUrl={f.photoUrl} colorIndex={colorIndex} dim={!f.active} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium admin-text-primary truncate">{f.name}</p>
            {f.authUid && (
              <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 shrink-0">
                <ShieldCheck className="w-2.5 h-2.5" /> Acesso
              </span>
            )}
            {!f.active && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full admin-surface-subtle admin-text-secondary shrink-0">
                Inativo
              </span>
            )}
          </div>
          {f.phone && <p className="text-xs admin-text-secondary truncate mt-0.5">{f.phone}</p>}
        </div>

        {/* Desktop: ações inline */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <button
            onClick={() => onAcesso(f)}
            className={`w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center transition-colors ${f.authUid ? "text-emerald-400 hover:text-emerald-300" : "admin-text-secondary hover:text-gold"}`}
            aria-label={acessoLabel}
            title={acessoLabel}
          >
            {f.authUid ? <ShieldCheck className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(f)}
            className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-gold transition-colors"
            aria-label="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(f)}
            className="w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center admin-text-secondary hover:text-red-400 transition-colors"
            aria-label="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile: botão que expande as ações abaixo */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Ações"
          aria-expanded={open}
          className={`sm:hidden w-8 h-8 rounded-lg admin-glass-card-hover flex items-center justify-center transition-colors shrink-0 ${open ? "text-gold" : "admin-text-secondary hover:text-gold"}`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile: barra de ações expansível (não corta o nome) */}
      <div
        className="sm:hidden grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => { onAcesso(f); setOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg admin-surface-subtle text-xs font-medium transition-colors ${f.authUid ? "text-emerald-400" : "admin-text-secondary hover:text-gold"}`}
            >
              {f.authUid ? <ShieldCheck className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
              Acesso
            </button>
            <button
              onClick={() => { onEdit(f); setOpen(false); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg admin-surface-subtle text-xs font-medium admin-text-secondary hover:text-gold transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            <button
              onClick={() => { onDelete(f); setOpen(false); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg admin-surface-subtle text-xs font-medium admin-text-secondary hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

