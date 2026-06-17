"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarCheck, BellOff, ChevronRight, CalendarDays, Receipt } from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { useNotifications } from "@/components/providers/NotificationsProvider";
import type { Appointment } from "@/lib/types";

function tempoRelativo(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

function formatData(date: string) {
  if (!date) return "";
  return new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Sino de notificações com badge de não-lidos. Abre um painel (modal) com o
 * histórico recente de agendamentos da landing. `variant` ajusta o botão para a
 * sidebar (item largo) ou flutuante (mobile).
 */
export function NotificationBell({ variant }: { variant: "sidebar" | "floating" | "menu" }) {
  const router = useRouter();
  const { enabled, historico, unread, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const abrir = () => {
    setOpen(true);
    markAllRead();
  };

  // Leva pra Agenda no dia/barbeiro/horário do agendamento.
  const verNaAgenda = (a: Appointment, close: () => void) => {
    const params = new URLSearchParams({ date: a.date, barber: a.barberId, time: a.time });
    close();
    router.push(`/admin?${params.toString()}`);
  };

  if (!enabled) return null;

  return (
    <>
      {variant === "menu" ? (
        <button
          onClick={abrir}
          className="admin-glass-card-hover flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors w-full text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#ece4cb] to-[#c2a35d] flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold admin-text-primary">Notificações</p>
            <p className="text-xs admin-text-secondary mt-0.5">Agendamentos recebidos pela landing</p>
          </div>
          {unread > 0 && (
            <span className="text-[11px] font-bold text-slate-950 bg-gold px-2 py-0.5 rounded-full">{unread > 9 ? "9+" : unread}</span>
          )}
          <ChevronRight className="w-4 h-4 admin-text-primary shrink-0" />
        </button>
      ) : variant === "sidebar" ? (
        <button
          onClick={abrir}
          className="group relative w-full flex items-center px-3 py-2.5 rounded-xl border border-transparent admin-glass-card-hover transition-all"
        >
          <span className="relative mr-3">
            <Bell className="w-5 h-5 admin-text-secondary group-hover:text-gold transition-colors" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-gold text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </span>
          <span className="text-sm font-medium admin-text-secondary">Notificações</span>
        </button>
      ) : (
        <button
          onClick={abrir}
          aria-label="Notificações"
          className="relative w-11 h-11 rounded-full admin-glass-card flex items-center justify-center"
        >
          <Bell className="w-5 h-5 admin-text-primary" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-slate-950 text-[10px] font-bold flex items-center justify-center border border-white/30">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <Modal onClose={() => setOpen(false)}>
          {(close) => (
            <>
              <ModalHeader
                title="Notificações"
                subtitle={historico.length > 0 ? `${historico.length} recentes` : undefined}
                onClose={close}
              />
              <div className="p-3 max-h-[60vh] overflow-y-auto">
                {historico.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
                    <div className="w-12 h-12 rounded-full admin-surface-subtle flex items-center justify-center">
                      <BellOff className="w-6 h-6 admin-text-secondary" />
                    </div>
                    <p className="text-sm admin-text-secondary">Nenhuma notificação ainda.</p>
                    <p className="text-xs admin-text-secondary">Os agendamentos da landing aparecem aqui.</p>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {historico.map((a) => {
                      const exp = expandidoId === a.id;
                      return (
                        <li key={a.id} className="admin-surface-subtle rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandidoId(exp ? null : a.id)}
                            className="w-full p-3 flex items-start gap-3 text-left admin-glass-card-hover transition-colors"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center text-gold shrink-0">
                              <CalendarCheck className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold admin-text-primary truncate">{a.customerName}</p>
                              <p className="text-xs admin-text-secondary truncate">
                                {a.serviceName} · {a.time} · {formatData(a.date)}
                              </p>
                              <p className="text-[11px] admin-text-secondary truncate">com {a.barberName}</p>
                            </div>
                            <span className="text-[10px] admin-text-secondary shrink-0 whitespace-nowrap">
                              {tempoRelativo(a.createdAt)}
                            </span>
                          </button>
                          {/* Ações — expandem suave */}
                          <div
                            className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{ gridTemplateRows: exp ? "1fr" : "0fr" }}
                          >
                            <div className="overflow-hidden">
                              <div className="flex gap-2 p-2 pt-0">
                                <button
                                  type="button"
                                  disabled
                                  title="Disponível quando as comandas estiverem prontas"
                                  className="flex-1 flex items-center justify-center gap-1.5 admin-glass-card admin-text-secondary py-2 rounded-lg text-xs font-semibold opacity-50 cursor-not-allowed"
                                >
                                  <Receipt className="w-3.5 h-3.5" /> Ver comanda
                                </button>
                                <button
                                  type="button"
                                  onClick={() => verNaAgenda(a, close)}
                                  className="flex-1 flex items-center justify-center gap-1.5 bg-gold/15 text-gold hover:bg-gold/25 border border-gold/30 py-2 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  <CalendarDays className="w-3.5 h-3.5" /> Ver na agenda
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
