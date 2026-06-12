"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  BACKGROUND_UPDATED_EVENT,
  DEFAULT_USER_BACKGROUND,
  getUserBackground,
  type UserBackground,
} from "@/lib/user-background";

export function useBackgroundImage() {
  const { user } = useAuth();
  const [background, setBackground] = useState<UserBackground>(DEFAULT_USER_BACKGROUND);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBackground(DEFAULT_USER_BACKGROUND);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getUserBackground(user.uid)
      .then((result) => {
        if (!cancelled) setBackground(result);
      })
      .catch(() => {
        if (!cancelled) setBackground(DEFAULT_USER_BACKGROUND);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<UserBackground>).detail;
      if (detail) setBackground(detail);
    };
    window.addEventListener(BACKGROUND_UPDATED_EVENT, handleUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener(BACKGROUND_UPDATED_EVENT, handleUpdate);
    };
  }, [user]);

  return { background, loading };
}
