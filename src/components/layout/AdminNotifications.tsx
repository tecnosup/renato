"use client";

import { motion, AnimatePresence } from "motion/react";
import { CalendarCheck, X } from "lucide-react";
import { useNotifications } from "@/components/providers/NotificationsProvider";

function formatData(date: string) {
  if (!date) return "";
  return new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Toasts de novo agendamento (canto superior direito). O listener, o som e o
 * histórico vivem no NotificationsProvider; aqui só renderizamos os toasts ativos.
 */
export function AdminNotifications() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-[min(92vw,340px)] pointer-events-none">
      <AnimatePresence>
        {toasts.map(({ id, appointment: a }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="transform-gpu admin-glass-card-accent-gold rounded-2xl p-3.5 flex items-start gap-3 pointer-events-auto shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          >
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center text-gold shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold">Novo agendamento</p>
              <p className="text-sm font-semibold admin-text-primary truncate mt-0.5">{a.customerName}</p>
              <p className="text-xs admin-text-secondary truncate">
                {a.serviceName} · {a.time} · {formatData(a.date)}
              </p>
              <p className="text-[11px] admin-text-secondary truncate">com {a.barberName}</p>
            </div>
            <button
              onClick={() => dismissToast(id)}
              className="admin-text-secondary hover:opacity-80 transition-opacity shrink-0"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
