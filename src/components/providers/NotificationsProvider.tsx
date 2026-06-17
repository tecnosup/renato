"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { can } from "@/lib/access";
import { subscribeToRecentLandingAppointments } from "@/lib/appointments";
import { playNotificationDing, isNotificationSoundEnabled } from "@/lib/sound";
import type { Appointment } from "@/lib/types";

interface ToastItem {
  id: string;
  appointment: Appointment;
}

interface NotificationsValue {
  /** Quem vê a agenda de todos recebe notificações (mostra o sino). */
  enabled: boolean;
  /** Histórico recente (agendamentos da landing, mais novo primeiro). */
  historico: Appointment[];
  /** Toasts aparecendo no momento. */
  toasts: ToastItem[];
  /** Quantidade de notificações novas ainda não vistas (badge). */
  unread: number;
  /** Zera o contador de não-lidos (ao abrir o painel). */
  markAllRead: () => void;
  /** Remove um toast (ao fechar no X ou expirar). */
  dismissToast: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsValue | null>(null);

export function useNotifications(): NotificationsValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications deve ser usado dentro de NotificationsProvider");
  return ctx;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { perms, loading } = useAuth();
  const [historico, setHistorico] = useState<Appointment[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [unread, setUnread] = useState(0);

  // Só quem vê a agenda de todos recebe a notificação global.
  useEffect(() => {
    if (loading || !can(perms, "verAgendaTodos")) return;
    return subscribeToRecentLandingAppointments(
      (list) => setHistorico(list),
      (appt) => {
        if (isNotificationSoundEnabled()) playNotificationDing();
        setUnread((u) => u + 1);
        const id = `${appt.id}-${Date.now()}`;
        setToasts((prev) => [...prev, { id, appointment: appt }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 9000);
      }
    );
  }, [perms, loading]);

  const markAllRead = () => setUnread(0);
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const enabled = !loading && can(perms, "verAgendaTodos");

  return (
    <NotificationsContext.Provider value={{ enabled, historico, toasts, unread, markAllRead, dismissToast }}>
      {children}
    </NotificationsContext.Provider>
  );
}
