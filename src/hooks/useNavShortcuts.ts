"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DEFAULT_NAV_SHORTCUTS, NAV_SHORTCUTS_UPDATED_EVENT, getNavShortcuts } from "@/lib/nav-shortcuts";

export function useNavShortcuts() {
  const { user } = useAuth();
  const [shortcuts, setShortcuts] = useState<string[]>(DEFAULT_NAV_SHORTCUTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setShortcuts(DEFAULT_NAV_SHORTCUTS);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getNavShortcuts(user.uid)
      .then((result) => {
        if (!cancelled) setShortcuts(result);
      })
      .catch(() => {
        if (!cancelled) setShortcuts(DEFAULT_NAV_SHORTCUTS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<string[]>).detail;
      if (detail) setShortcuts(detail);
    };
    window.addEventListener(NAV_SHORTCUTS_UPDATED_EVENT, handleUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener(NAV_SHORTCUTS_UPDATED_EVENT, handleUpdate);
    };
  }, [user]);

  return { shortcuts, loading };
}
