"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, ChevronRight, ChevronLeft, ChevronDown, Plus, AlertTriangle, Calendar, FileText, Users, Scissors, Package } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { subscribeToComandasNoDia, subscribeToComandasAbertas, subscribeToMinhasComandas } from "@/lib/comandas";
import { NovaComandaModal } from "@/components/comandas/NovaComandaModal";
import { EditarComandaModal } from "@/components/comandas/EditarComandaModal";
import { DatePicker } from "@/components/ui/DatePicker";
import { SeletorBarbeiro } from "@/components/admin/SeletorBarbeiro";
import { useAuth } from "@/components/providers/AuthProvider";
import { can } from "@/lib/access";
import type { Comanda } from "@/lib/types";

function brl(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const STATUS: Record<Comanda["status"], { label: string; cls: string; icon: React.ElementType }> = {
  aberta: { label: "Aberta", cls: "text-gold bg-gold/10", icon: Clock },
  pagamento_pendente: { label: "Ag. pagamento", cls: "text-amber-400 bg-amber-500/10", icon: Clock },
  paga: { label: "Paga", cls: "text-emerald-400 bg-emerald-500/10", icon: CheckCircle },
  cancelada: { label: "Cancelada", cls: "text-red-400 bg-red-500/10", icon: XCircle },
};

const FILTROS = ["Todas", "Abertas", "Pagas", "Canceladas"] as const;
type Filtro = (typeof FILTROS)[number];

function ComandasPageInner() {
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("Todas");
  const [novaModal, setNovaModal] = useState(false);
  const [dia, setDia] = useState(() => toKey(new Date()));
  const [mostrarCal, setMostrarCal] = useState(false);
  const [barbeiroFiltro, setBarbeiroFiltro] = useState("todos");
  const [retroAberta, setRetroAberta] = useState(false);
  const [comandaEditando, setComandaEditando] = useState<Comanda | null>(null);
  // Fontes escopadas: dono/gerente usam queries por dia + abertas; barbeiro usa
  // o próprio histórico (where barberId ==) e filtra no cliente.
  const [doDiaTodos, setDoDiaTodos] = useState<Comanda[]>([]);
  const [abertasTodos, setAbertasTodos] = useState<Comanda[]>([]);
  const [minhas, setMinhas] = useState<Comanda[]>([]);

  // Abre o modal de nova comanda quando chega ?nova=1 (ex: vindo do wizard de
  // agendamento ao escolher só produtos). Limpa o param para reabrir depois.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("nova") === "1") {
      setNovaModal(true);
      router.replace(pathname);
    }
  }, [searchParams, pathname, router]);

  // Barbeiro sem "ver tudo" enxerga só as próprias; gerente/recepção/dono veem
  // todas. Abertas (qualquer dia) ficam sempre disponíveis; o resto é por dia.
  const { perms, barberId } = useAuth();
  const verTodos = can(perms, "verAgendaTodos");

  useEffect(() => {
    if (!verTodos) {
      return subscribeToMinhasComandas(barberId ?? "__none__", (l) => { setMinhas(l); setCarregando(false); });
    }
    return subscribeToComandasAbertas((l) => { setAbertasTodos(l); setCarregando(false); });
  }, [verTodos, barberId]);

  useEffect(() => {
    if (!verTodos) return;
    return subscribeToComandasNoDia(dia, setDoDiaTodos);
  }, [verTodos, dia]);

  const ehAberta = (c: Comanda) => c.status === "aberta" || c.status === "pagamento_pendente";
  const abertasList = verTodos ? abertasTodos : minhas.filter(ehAberta);
  const doDiaList = verTodos ? doDiaTodos : minhas.filter((c) => toKey(new Date(c.createdAt)) === dia);

  const visiveisBase =
    filtro === "Abertas" ? abertasList
    : filtro === "Pagas" ? doDiaList.filter((c) => c.status === "paga")
    : filtro === "Canceladas" ? doDiaList.filter((c) => c.status === "cancelada")
    : doDiaList; // Todas (do dia)

  // Filtro por barbeiro (só pra quem vê todos): aparece com 2+ barbeiros na
  // lista atual. Some/reseta se o filtrado anterior não tiver mais comanda aqui.
  const barbeirosNaLista = Array.from(
    new Map(visiveisBase.map((c) => [c.barberId, c.barberName])).entries()
  ).map(([id, name]) => ({ id, name }));
  const barbeiroAtivo = barbeirosNaLista.some((b) => b.id === barbeiroFiltro) ? barbeiroFiltro : "todos";
  const visiveis = verTodos && barbeiroAtivo !== "todos" ? visiveisBase.filter((c) => c.barberId === barbeiroAtivo) : visiveisBase;

  const hojeKey = toKey(new Date());
  const ehHoje = dia === hojeKey;
  const ontemKey = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return toKey(d); })();
  // Label do dia: "Hoje" / "Ontem" / "dd/mm" — igual ao Meu Financeiro.
  const labelDia = ehHoje
    ? "Hoje"
    : dia === ontemKey
      ? "Ontem"
      : new Date(dia + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  // Navega de dia em dia; não passa de hoje (comanda futura aparece em Abertas).
  const navDia = (dir: number) => {
    const base = new Date(dia + "T12:00:00");
    base.setDate(base.getDate() + dir);
    const key = toKey(base);
    if (key > hojeKey) return;
    setDia(key);
  };

  // Comandas abertas de DIAS ANTERIORES — não podem ficar pendentes, distorcem a
  // análise financeira. Comparação de "YYYY-MM-DD" como string ordena por data.
  const retroativas = abertasList.filter((c) => toKey(new Date(c.createdAt)) < hojeKey);

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
      {/* Header (sobre o fundo) */}
      <PageHeader
        className="mb-5"
        icon={FileText}
        title="Comandas"
        subtitle={abertasList.length > 0 ? `${abertasList.length} comanda${abertasList.length > 1 ? "s" : ""} em aberto` : "Nenhuma comanda em aberto"}
        action={
          <button
            onClick={() => setNovaModal(true)}
            className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Nova
          </button>
        }
      />

      {/* Alerta compacto: comandas abertas de dias anteriores (impacto no financeiro).
          Expande na mesma tela (sem navegar) com nome + itens + atalho pra resolver. */}
      {retroativas.length > 0 && (
        <div className="mb-4 rounded-xl admin-glass-card border border-amber-500/30 overflow-hidden">
          <button
            onClick={() => setRetroAberta((o) => !o)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="flex-1 min-w-0 text-sm font-semibold text-amber-400 truncate">
              {retroativas.length} comanda{retroativas.length > 1 ? "s" : ""} retroativa{retroativas.length > 1 ? "s" : ""} aberta{retroativas.length > 1 ? "s" : ""}
            </p>
            <ChevronDown className={`w-4 h-4 text-amber-400 shrink-0 transition-transform duration-300 ${retroAberta ? "rotate-180" : ""}`} />
          </button>

          <div
            className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ gridTemplateRows: retroAberta ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <ul className="px-3 pb-3 space-y-2">
                {retroativas.map((c) => (
                  <li key={c.id} className="admin-surface-subtle rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold admin-text-primary truncate">{c.customerName}</p>
                        <p className="text-xs admin-text-secondary truncate">
                          {c.barberName} · {new Date(c.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <span className="text-sm font-bold admin-text-primary shrink-0">{brl(c.total)}</span>
                    </div>
                    {c.items.length > 0 && (
                      <ul className="mt-2 pt-2 admin-border-t space-y-1">
                        {c.items.map((it) => (
                          <li key={it.id} className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${it.tipo === "servico" ? "bg-violet-500/15 text-violet-400" : "bg-teal-500/15 text-teal-400"}`}>
                              {it.tipo === "servico" ? <Scissors className="w-2.5 h-2.5" /> : <Package className="w-2.5 h-2.5" />}
                            </span>
                            <span className="flex-1 text-xs admin-text-secondary truncate">{it.qtd > 1 ? `${it.qtd}× ` : ""}{it.nome}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      onClick={() => setComandaEditando(c)}
                      className="w-full mt-2.5 admin-glass-card admin-glass-card-hover text-amber-400 py-2 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Resolver agora
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Card único (padrão "Comandas de hoje" do Meu Financeiro): abas +
          navegação de dia + calendário no topo, e a LISTA dentro do mesmo card. */}
      <div className="transform-gpu rounded-2xl overflow-hidden admin-glass-card">
        <div className="px-4 pt-4 pb-3 space-y-3">
          {/* Abas */}
          <div className="flex gap-1.5">
            {FILTROS.map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  f === filtro
                    ? "bg-gold/15 text-gold border border-gold/30"
                    : "admin-surface-subtle admin-text-secondary border border-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Resumo + navegação de dia (Abertas é de qualquer dia, sem data) */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold admin-text-secondary uppercase tracking-widest min-w-0 truncate">
              {filtro === "Abertas"
                ? `${visiveis.length} em aberto · qualquer dia`
                : `${visiveis.length} comanda${visiveis.length !== 1 ? "s" : ""}${ehHoje ? " hoje" : ""}`}
            </p>
            {filtro !== "Abertas" && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => navDia(-1)} aria-label="Dia anterior" className="admin-glass-card admin-glass-card-hover admin-text-secondary w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMostrarCal((o) => !o)}
                  className={`flex items-center gap-1.5 min-w-[78px] justify-center px-2.5 h-8 rounded-lg text-xs font-bold transition-colors ${
                    ehHoje ? "admin-glass-card admin-glass-card-hover admin-text-secondary" : "bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" /> {labelDia}
                </button>
                <button onClick={() => navDia(1)} disabled={ehHoje} aria-label="Próximo dia" className="admin-glass-card admin-glass-card-hover admin-text-secondary w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Filtro por barbeiro (só quem vê todos; aparece com 2+ barbeiros na lista) */}
          {verTodos && barbeirosNaLista.length > 1 && (
            <SeletorBarbeiro
              barbeiros={barbeirosNaLista}
              value={barbeiroAtivo}
              onChange={setBarbeiroFiltro}
              extra={{ id: "todos", label: "Todos", icon: Users }}
            />
          )}

          {/* Calendário expansível pra pular pra qualquer dia */}
          {filtro !== "Abertas" && (
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ gridTemplateRows: mostrarCal ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="pt-1">
                  {!ehHoje && (
                    <button
                      onClick={() => { setDia(hojeKey); setMostrarCal(false); }}
                      className="mb-2 w-full admin-surface-subtle admin-text-secondary hover:text-gold rounded-lg py-1.5 text-xs font-semibold transition-colors"
                    >
                      Voltar pra hoje
                    </button>
                  )}
                  <DatePicker
                    value={dia}
                    onChange={(iso) => setDia(iso > hojeKey ? hojeKey : iso)}
                    onClose={() => setMostrarCal(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista — dentro do mesmo card */}
        {carregando ? (
          <p className="px-4 pb-5 pt-1 text-sm admin-text-secondary text-center">Carregando comandas…</p>
        ) : visiveis.length === 0 ? (
          <p className="px-4 pb-5 text-sm admin-text-secondary">
            {filtro === "Abertas"
              ? "Nenhuma comanda em aberto."
              : filtro === "Todas"
                ? "Nenhuma comanda neste dia."
                : `Nenhuma comanda ${filtro.toLowerCase()} neste dia.`}
          </p>
        ) : (
          <ul className="admin-divide">
            {visiveis.map((c) => {
              const st = STATUS[c.status];
              const Icon = st.icon;
              const atrasada = ehAberta(c) && toKey(new Date(c.createdAt)) < hojeKey;
              return (
                <li key={c.id} className={atrasada ? "ring-2 ring-inset ring-amber-500/50" : ""}>
                  <Link href={`/admin/comandas/${c.id}`} className="admin-glass-card-hover flex items-center gap-3 px-4 py-3.5 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold admin-text-primary truncate">{c.customerName}</p>
                      <p className={`text-xs truncate ${atrasada ? "text-amber-400 font-medium" : "admin-text-secondary"}`}>
                        {c.barberName} · {new Date(c.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}{atrasada ? " · atrasada" : ""}
                      </p>
                    </div>
                    <span className="text-sm font-bold admin-text-primary shrink-0">{brl(c.total)}</span>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 shrink-0 ${st.cls}`}>
                      <Icon className="w-3 h-3" /> {st.label}
                    </span>
                    <ChevronRight className="w-4 h-4 admin-text-secondary shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {novaModal && <NovaComandaModal onClose={() => setNovaModal(false)} />}
      {comandaEditando && (
        <EditarComandaModal
          comanda={comandaEditando}
          onClose={() => setComandaEditando(null)}
          iniciarFechando={can(perms, "fecharComandas")}
        />
      )}
    </div>
  );
}

export default function ComandasPage() {
  // Suspense exigido pelo useSearchParams (abrir "Nova comanda" via ?nova=1).
  return (
    <Suspense fallback={null}>
      <ComandasPageInner />
    </Suspense>
  );
}
