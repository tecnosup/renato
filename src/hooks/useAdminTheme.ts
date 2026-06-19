"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  type AdminTheme,
  DEFAULT_ADMIN_THEME,
  THEME_STORAGE_KEY,
  THEME_UPDATED_EVENT,
  getCachedTheme,
  getUserTheme,
} from "@/lib/user-theme";

export function useAdminTheme() {
  const { user, loading: authLoading } = useAuth();
  const [theme, setTheme] = useState<AdminTheme>(getCachedTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Enquanto o Firebase Auth ainda esta resolvendo a sessao, `user` vem
    // null mesmo para quem esta logado. Nao reseta o tema pro default nesse
    // meio-tempo, senao da o flash liquid-glass -> tema salvo a cada load.
    if (authLoading) return;

    if (!user) {
      setTheme(DEFAULT_ADMIN_THEME);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getUserTheme(user.uid)
      .then((result) => {
        if (!cancelled) {
          setTheme(result);
          window.localStorage.setItem(THEME_STORAGE_KEY, result);
        }
      })
      .catch(() => {
        if (!cancelled) setTheme(DEFAULT_ADMIN_THEME);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<AdminTheme>).detail;
      if (detail) setTheme(detail);
    };
    window.addEventListener(THEME_UPDATED_EVENT, handleUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener(THEME_UPDATED_EVENT, handleUpdate);
    };
  }, [user, authLoading]);

  return { theme, loading };
}
