import { doc, getDoc, setDoc } from "firebase/firestore";
import { Menu } from "lucide-react";
import { db } from "@/lib/firebase";
import { menuItems, type MenuItem } from "@/lib/menu-items";

export const NAV_SHORTCUTS_SLOTS = 5;
export const NAV_SHORTCUTS_CENTER_INDEX = 2;
export const NAV_SHORTCUTS_MENU_INDEX = 4;
export const NAV_SHORTCUTS_MENU_HREF = "/admin/menu";

export const DEFAULT_NAV_SHORTCUTS = [
  "/admin/financeiro/comissoes",
  "/admin/financeiro/caixa",
  "/admin",
  "/admin/cadastros/clientes",
  NAV_SHORTCUTS_MENU_HREF,
];

// "Menu" não aparece em menuItems (não faz sentido se linkar a si mesmo),
// mas precisa ser resolvido para o slot fixo da navbar.
export const MENU_NAV_ITEM: MenuItem = {
  label: "Menu",
  desc: "Mais opções e configurações",
  href: NAV_SHORTCUTS_MENU_HREF,
  icon: Menu,
  color: "bg-slate-600",
  badge: null,
};

export function getMenuItemByHref(href: string) {
  if (href === NAV_SHORTCUTS_MENU_HREF) return MENU_NAV_ITEM;
  return menuItems.find((item) => item.href === href);
}

export async function getNavShortcuts(uid: string): Promise<string[]> {
  const snap = await getDoc(doc(db, "userPreferences", uid));
  const saved = snap.data()?.navShortcuts as string[] | undefined;

  if (!saved || saved.length !== NAV_SHORTCUTS_SLOTS) {
    return DEFAULT_NAV_SHORTCUTS;
  }

  // O último botão é sempre o Menu, independente do que estiver salvo
  saved[NAV_SHORTCUTS_MENU_INDEX] = NAV_SHORTCUTS_MENU_HREF;
  return saved;
}

export const NAV_SHORTCUTS_UPDATED_EVENT = "nav-shortcuts-updated";

export async function setNavShortcuts(uid: string, shortcuts: string[]) {
  const normalized = [...shortcuts];
  normalized[NAV_SHORTCUTS_MENU_INDEX] = NAV_SHORTCUTS_MENU_HREF;

  await setDoc(doc(db, "userPreferences", uid), { navShortcuts: normalized }, { merge: true });
  window.dispatchEvent(new CustomEvent(NAV_SHORTCUTS_UPDATED_EVENT, { detail: normalized }));
}
