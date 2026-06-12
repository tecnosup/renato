"use client";

import { useEffect } from "react";
import { useAdminTheme } from "@/hooks/useAdminTheme";

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useAdminTheme();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <>{children}</>;
}
