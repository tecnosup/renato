import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type AdminTheme = "liquid-glass" | "noturno" | "diurno";

export const DEFAULT_ADMIN_THEME: AdminTheme = "liquid-glass";

const VALID_THEMES: AdminTheme[] = ["liquid-glass", "noturno", "diurno"];

export const THEME_STORAGE_KEY = "admin-theme";

export function getCachedTheme(): AdminTheme {
  if (typeof window === "undefined") return DEFAULT_ADMIN_THEME;
  const cached = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (cached && VALID_THEMES.includes(cached as AdminTheme)) return cached as AdminTheme;
  return DEFAULT_ADMIN_THEME;
}

export async function getUserTheme(uid: string): Promise<AdminTheme> {
  const snap = await getDoc(doc(db, "userPreferences", uid));
  const saved = snap.data()?.theme as AdminTheme | undefined;

  if (saved && VALID_THEMES.includes(saved)) return saved;
  return DEFAULT_ADMIN_THEME;
}

export const THEME_UPDATED_EVENT = "admin-theme-updated";

export async function setUserTheme(uid: string, theme: AdminTheme) {
  await setDoc(doc(db, "userPreferences", uid), { theme }, { merge: true });
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent(THEME_UPDATED_EVENT, { detail: theme }));
}
