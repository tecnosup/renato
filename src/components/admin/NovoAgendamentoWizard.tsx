"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Minus, Scissors, Package, ChevronLeft, ChevronRight,
  User, Phone, Sparkles, Clock, FileText,
} from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { SeletorBarbeiro } from "@/components/admin/SeletorBarbeiro";
import { SuccessSplash } from "@/components/ui/SuccessSplash";
import { subscribeToServices } from "@/lib/services";
import { subscribeToProducts } from "@/lib/products";
import { calcularTotal } from "@/lib/comandas";
import type { Employee, BarberService, Product, ComandaItem, ComandaItemTipo } from "@/lib/types";

function brl(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const DIAS_LONGO = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/**
 * Agendamento presencial do admin no formato WIZARD (espelha o fluxo da landing,
 * mas tematizado nos 3 modos): 1) serviços + produtos · 2) barbeiro · 3) data e
 * horário · 4) dados do cliente + confirmação. Os horários vêm do endpoint
 * `/api/appointments/slots` (mesma fonte da landing). Ao confirmar, manda `items`
 * + os campos `service*` derivados (1º serviço + total) para a comanda futura.
 */
export function NovoAgendamentoWizard({
  initialDate,
  initialTime = "",
  initialBarberId = "qualquer",
  initialName = "",
  initialPhone = "",
  funcionarios,
  onClose,
  onCreated,
}: {
  initialDate: string;
  initialTime?: string;
  initialBarberId?: string;
  initialName?: string;
  initialPhone?: string;
  funcionarios: Employee[];
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [services, setServices] = useState<BarberService[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<ComandaItemTipo>("servico");
  const [items, setItems] = useState<ComandaItem[]>([]);
  const [precoStr, setPrecoStr] = useState("");

  const [barberId, setBarberId] = useState(initialBarberId);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);

  const [nome, setNome] = useState(initialName);
  const [telefone, setTelefone] = useState(initialPhone);

  const [slots, setSlots] = useState<string[] | null>(initialDate ? null : []);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [stage, setStage] = useState<"form" | "salvando" | "ok">("form");
  const [erro, setErro] = useState("");

  const hoje = new Date();
  const [mes, setMes] = useState(() => (initialDate ? new Date(initialDate + "T12:00:00").getMonth() : hoje.getMonth()));
  const [ano, setAno] = useState(() => (initialDate ? new Date(initialDate + "T12:00:00").getFullYear() : hoje.getFullYear()));

  useEffect(() => subscribeToServices((l) => setServices(l.filter((s) => s.active !== false))), []);
  useEffect(() => subscribeToProducts((l) => setProducts(l.filter((p) => p.active))), []);

  const barbeiros = useMemo(
    () => funcionarios.filter((f) => f.active && f.role === "barbeiro"),
    [funcionarios]
  );

  // Busca os horários disponíveis sempre que data ou barbeiro mudam (mesmo
  // endpoint da landing — já filtra grade, bloqueios e agendamentos).
  useEffect(() => {
    let cancelado = false;
    // setState dentro de uma função async (não no corpo do effect) evita o
    // alerta de cascading renders do react-hooks.
    const buscar = async () => {
      if (!date) { setSlots([]); return; }
      setLoadingSlots(true);
      setSlots(null);
      try {
        const r = await fetch(`/api/appointments/slots?date=${date}&barberId=${barberId}`);
        const d = await r.json();
        if (!cancelado) setSlots(d.slots ?? []);
      } catch {
        if (!cancelado) setSlots([]);
      } finally {
        if (!cancelado) setLoadingSlots(false);
      }
    };
    buscar();
    return () => { cancelado = true; };
  }, [date, barberId]);

  const total = calcularTotal(items);
  // Agendamento exige ao menos um SERVIÇO (produto sozinho é caso de comanda).
  const temServico = items.some((i) => i.tipo === "servico");

  const irPara = (alvo: number) => { setDirection(alvo > step ? 1 : -1); setStep(alvo); };

  const qtdDe = (tipo: ComandaItemTipo, refId: string) =>
    items.find((i) => i.refId === refId && i.tipo === tipo)?.qtd ?? 0;

  const aplicarItens = (novos: ComandaItem[]) => {
    setItems(novos);
    setPrecoStr(String(calcularTotal(novos)));
  };
  const adicionar = (tipo: ComandaItemTipo, refId: string, nomeItem: string, preco: number) => {
    const ex = items.find((i) => i.refId === refId && i.tipo === tipo);
    aplicarItens(
      ex
        ? items.map((i) => (i === ex ? { ...i, qtd: i.qtd + 1 } : i))
        : [...items, { id: crypto.randomUUID(), tipo, refId, nome: nomeItem, preco, qtd: 1 }]
    );
  };
  const removerUm = (tipo: ComandaItemTipo, refId: string) =>
    aplicarItens(items.map((i) => (i.refId === refId && i.tipo === tipo ? { ...i, qtd: i.qtd - 1 } : i)).filter((i) => i.qtd > 0));

  const catalogo = tab === "servico" ? services : products;

  // ── Calendário ──
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const celulas: (number | null)[] = [];
  for (let i = 0; i < primeiroDia; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(d);
  const noMesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth();
  const diaPassado = (dia: number) => {
    const z = new Date(); z.setHours(0, 0, 0, 0);
    return new Date(ano, mes, dia) < z;
  };
  const navMes = (dir: number) => {
    if (dir < 0 && noMesAtual) return;
    let m = mes + dir, a = ano;
    if (m < 0) { m = 11; a--; } else if (m > 11) { m = 0; a++; }
    setMes(m); setAno(a);
  };

  // Para hoje, esconde horários que já passaram (30min de folga).
  const slotsVisiveis = useMemo(() => {
    if (!slots) return [];
    const agora = new Date();
    const stampHoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    if (date === stampHoje) {
      const limite = agora.getHours() * 60 + agora.getMinutes() + 30;
      return slots.filter((s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m >= limite; });
    }
    return slots;
  }, [slots, date]);

  const dataLonga = (stamp: string) => {
    if (!stamp) return "";
    const [y, m, d] = stamp.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return `${DIAS_LONGO[dt.getDay()]}, ${d} de ${MESES[dt.getMonth()]}`;
  };

  const barbeiroNome = barberId === "qualquer"
    ? "Qualquer disponível"
    : barbeiros.find((b) => b.id === barberId)?.name ?? "Qualquer disponível";

  const podeConfirmar = nome.trim().length > 0 && !!time && stage === "form";

  const confirmar = async (close: () => void) => {
    if (!podeConfirmar) return;
    setStage("salvando");
    setErro("");
    const principal = items.find((i) => i.tipo === "servico") ?? items[0];
    const b = barbeiros.find((x) => x.id === barberId);
    try {
      const res = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: principal?.refId ?? "servico",
          serviceName: principal?.nome ?? "Agendamento",
          servicePrice: Number(precoStr) || total,
          barberId,
          barberName: b?.name ?? "Qualquer disponível",
          date,
          time,
          customerName: nome.trim(),
          customerPhone: telefone.trim(),
          origin: "admin",
          items,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErro(d.error ?? "Não foi possível concluir o agendamento.");
        setStage("form");
        return;
      }
      const { id } = await res.json().catch(() => ({ id: "" }));
      onCreated?.(id);
      setStage("ok");
      setTimeout(close, 1600);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setStage("form");
    }
  };

  const slide = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" as const } },
    exit: (dir: number) => ({ x: dir < 0 ? 40 : -40, opacity: 0, transition: { duration: 0.16, ease: "easeIn" as const } }),
  };

  const tituloPasso =
    step === 1 ? "Escolha os serviços" :
    step === 2 ? "Escolha o barbeiro" :
    step === 3 ? (time ? "Escolha o horário" : "Escolha a data") :
    "Confirme os dados";

  return (
    <Modal fullHeight onClose={onClose}>
      {(close) =>
        stage === "ok" ? (
          <div className="flex-1 flex items-center justify-center">
            <SuccessSplash message="Agendamento confirmado!" subtitle={`${nome.trim()} · ${time}`} />
          </div>
        ) : (
          <>
            <ModalHeader title={step === 4 ? "Confirmar horário" : "Agendar horário"} onClose={close} />

            {/* Indicador de passos */}
            <div className="shrink-0 flex flex-col items-center gap-2 pt-3 pb-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <React.Fragment key={s}>
                    {s > 1 && <div className={`h-px w-5 rounded-full transition-colors ${step >= s ? "bg-gold" : "bg-white/10"}`} />}
                    <button
                      type="button"
                      disabled={s > step}
                      onClick={() => irPara(s)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                        step === s
                          ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 scale-105"
                          : step > s
                            ? "bg-gold/15 text-gold border border-gold/30"
                            : "admin-surface-subtle admin-text-secondary border border-white/10 cursor-not-allowed"
                      }`}
                    >
                      {step > s ? "✓" : s}
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[8px] text-gold/80 tracking-widest font-bold uppercase">Passo {step}/4 •</span>
                <span className="text-sm font-bold admin-text-primary uppercase tracking-wide">{tituloPasso}</span>
              </div>
            </div>

            {/* Conteúdo do passo (rola) */}
            <div className="flex-1 overflow-y-auto px-5 pb-2">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={step} custom={direction} variants={slide} initial="enter" animate="center" exit="exit">

                  {/* PASSO 1 — Serviços + Produtos */}
                  {step === 1 && (
                    <div className="space-y-2">
                      <div className="flex gap-2 sticky top-0 z-10 pb-1">
                        {(["servico", "produto"] as ComandaItemTipo[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                              tab === t ? "bg-gold/15 text-gold border border-gold/30" : "admin-surface-subtle admin-text-secondary border border-transparent"
                            }`}
                          >
                            {t === "servico" ? <Scissors className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                            {t === "servico" ? "Serviços" : "Produtos"}
                          </button>
                        ))}
                      </div>
                      {catalogo.length === 0 ? (
                        <p className="text-sm admin-text-secondary text-center py-6">Nada cadastrado.</p>
                      ) : (
                        catalogo.map((x) => {
                          const q = qtdDe(tab, x.id);
                          const isServ = tab === "servico";
                          return (
                            <div
                              key={x.id}
                              className={`rounded-xl px-3 py-2.5 flex items-center gap-3 border transition-colors ${
                                q > 0 ? "bg-gold/10 border-gold/40" : "admin-surface-subtle border-transparent"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold admin-text-primary truncate">{x.name}</p>
                                {isServ && (x as BarberService).description && (
                                  <p className="text-[11px] admin-text-secondary truncate">{(x as BarberService).description}</p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-bold text-gold">{brl(x.price)}</p>
                                {isServ && <p className="font-mono text-[9px] admin-text-secondary">{(x as BarberService).duration} min</p>}
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
                            </div>
                          );
                        })
                      )}
                      {items.length > 0 && !temServico && (
                        <div className="pt-1 space-y-2">
                          <p className="text-[11px] text-amber-400/90 leading-snug">
                            Escolha ao menos um <strong>serviço</strong> para agendar um horário. Só produtos? Isso é caso de comanda:
                          </p>
                          <button
                            type="button"
                            onClick={() => router.push("/admin/comandas?nova=1")}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-sm font-semibold transition-colors"
                          >
                            <FileText className="w-4 h-4" /> Criar comanda
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PASSO 2 — Barbeiro (mesmo seletor da grade de horários) */}
                  {step === 2 && (
                    <SeletorBarbeiro
                      barbeiros={barbeiros}
                      value={barberId}
                      onChange={(id) => { setBarberId(id); setTime(""); irPara(3); }}
                      extra={{ id: "qualquer", label: "Qualquer disponível", icon: Scissors }}
                    />
                  )}

                  {/* PASSO 3 — Data e Horário */}
                  {step === 3 && (
                    <div className="space-y-3">
                      {!date ? (
                        <div className="admin-surface-subtle rounded-xl p-3">
                          <div className="flex justify-between items-center mb-2.5">
                            <button type="button" onClick={() => navMes(-1)} disabled={noMesAtual}
                              className="w-7 h-7 rounded-full border border-white/10 hover:border-gold hover:text-gold flex items-center justify-center admin-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[11px] font-bold uppercase tracking-widest admin-text-primary">{MESES[mes]} {ano}</span>
                            <button type="button" onClick={() => navMes(1)}
                              className="w-7 h-7 rounded-full border border-white/10 hover:border-gold hover:text-gold flex items-center justify-center admin-text-secondary transition-colors">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[8px] text-gold/70 font-bold uppercase border-b border-white/5 pb-1.5 mb-1.5">
                            {DIAS_SEMANA.map((w, i) => <span key={i}>{w}</span>)}
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px]">
                            {celulas.map((d, i) => {
                              if (d === null) return <span key={i} />;
                              const stamp = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                              const passado = diaPassado(d);
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  disabled={passado}
                                  onClick={() => { setDate(stamp); setTime(""); }}
                                  className={`aspect-square w-full rounded-lg flex items-center justify-center transition-colors ${
                                    passado ? "admin-text-secondary opacity-25 cursor-not-allowed" : "admin-text-primary border border-transparent hover:border-gold/40 hover:bg-white/5"
                                  }`}
                                >
                                  {d}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="admin-surface-subtle rounded-xl p-3 flex justify-between items-center">
                            <div>
                              <span className="font-mono text-[8px] text-gold uppercase font-bold block">Data selecionada</span>
                              <span className="text-[11px] admin-text-primary font-semibold">{dataLonga(date)}</span>
                            </div>
                            <button type="button" onClick={() => { setDate(""); setTime(""); }}
                              className="admin-text-secondary hover:text-gold font-mono text-[8px] uppercase py-1 px-2.5 rounded border border-white/10 hover:border-gold/30 transition-colors">
                              Alterar
                            </button>
                          </div>
                          <div className="admin-surface-subtle rounded-xl p-3">
                            <span className="font-mono text-[8px] text-gold uppercase font-bold block mb-2.5">Horários disponíveis</span>
                            {loadingSlots ? (
                              <div className="grid grid-cols-4 gap-2">
                                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-8 rounded-lg admin-glass-card animate-pulse" />)}
                              </div>
                            ) : slotsVisiveis.length === 0 ? (
                              <p className="text-[11px] admin-text-secondary text-center py-4 leading-snug">Nenhum horário livre neste dia para este barbeiro.<br /><span className="opacity-70">Tente outra data.</span></p>
                            ) : (
                              <div className="grid grid-cols-4 gap-2">
                                {slotsVisiveis.map((h) => (
                                  <button
                                    key={h}
                                    type="button"
                                    onClick={() => { setTime(h); irPara(4); }}
                                    className={`py-2 text-center rounded-lg font-mono text-xs border transition-colors ${
                                      time === h ? "bg-gold text-slate-950 border-gold font-bold" : "admin-surface-subtle admin-text-primary border-transparent hover:border-gold/40"
                                    }`}
                                  >
                                    {h}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* PASSO 4 — Dados + Confirmação */}
                  {step === 4 && (
                    <div className="space-y-3">
                      {/* Resumo */}
                      <div className="admin-surface-subtle rounded-xl p-3 space-y-1.5">
                        <span className="font-mono text-[8px] text-gold uppercase font-bold block">Resumo</span>
                        {items.length === 0 ? (
                          <p className="text-[11px] admin-text-secondary">Nenhum serviço selecionado.</p>
                        ) : (
                          items.map((i) => (
                            <div key={i.id} className="flex justify-between text-[11px]">
                              <span className="admin-text-primary truncate pr-2">{i.qtd > 1 ? `${i.qtd}× ` : ""}{i.nome}</span>
                              <span className="text-gold font-semibold shrink-0">{brl(i.preco * i.qtd)}</span>
                            </div>
                          ))
                        )}
                        <div className="flex items-center gap-3 pt-1.5 mt-1 border-t border-white/5 text-[11px] admin-text-secondary">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {barbeiroNome}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time} · {dataLonga(date).split(",")[0]}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs admin-text-secondary mb-1 block">Nome do cliente</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
                          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do cliente"
                            className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs admin-text-secondary mb-1 block">WhatsApp (opcional)</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 admin-text-secondary" />
                          <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="11999999999"
                            className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs admin-text-secondary mb-1 block">Total (R$)</label>
                        <input type="number" value={precoStr} onChange={(e) => setPrecoStr(e.target.value)}
                          className="w-full admin-surface-subtle admin-input border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                      </div>
                      {erro && <p className="text-rose-400 text-xs text-center leading-snug px-2">{erro}</p>}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Rodapé fixo: navegação */}
            <div className="shrink-0 px-5 pt-3 pb-6 sm:pb-4 admin-border-t flex gap-3">
              <button
                type="button"
                onClick={() => (step === 1 ? close() : irPara(step - 1))}
                className="flex-1 admin-glass-card admin-glass-card-hover admin-text-secondary py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                {step === 1 ? "Cancelar" : "Voltar"}
              </button>
              {step === 1 && (
                <button
                  type="button"
                  disabled={!temServico}
                  onClick={() => irPara(2)}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              )}
              {step === 4 && (
                <button
                  type="button"
                  disabled={!podeConfirmar}
                  onClick={() => confirmar(close)}
                  className="flex-1 bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> {stage === "salvando" ? "Confirmando…" : "Confirmar"}
                </button>
              )}
            </div>
          </>
        )
      }
    </Modal>
  );
}
