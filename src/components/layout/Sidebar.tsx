"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Calendar,
  Users,
  UserCog,
  Scissors,
  Package,
  Layers,
  Tag,
  FileText,
  DollarSign,
  Settings,
  ChevronRight,
  LogOut,
  Gift,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavShortcuts } from "@/hooks/useNavShortcuts";
import { NAV_SHORTCUTS_CENTER_INDEX, getMenuItemByHref } from "@/lib/nav-shortcuts";
import { canAccessPath } from "@/lib/access";
import type { Permissions } from "@/lib/types";

// Filtra a arvore de navegacao pelas permissoes: remove itens-pai/filhos cujas
// rotas o usuario nao pode acessar; descarta um pai que ficou sem filhos.
function filterNav(items: NavItem[], perms: Permissions | undefined) {
  return items
    .map((item) => {
      if (!item.children) return canAccessPath(perms, item.href) ? item : null;
      const children = item.children.filter((c) => canAccessPath(perms, c.href));
      if (children.length === 0 && !canAccessPath(perms, item.href)) return null;
      return { ...item, children };
    })
    .filter((x): x is NavItem => x !== null);
}

// Filho de um item: rota normal ou AÇÃO (action=true → dispara o modal da tela
// via ?novo=1, ao invés de só navegar). O "+" visual diferencia ação de rota.
type NavChild = { label: string; href: string; action?: boolean };
type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  {
    label: "Agenda",
    href: "/admin",
    icon: Calendar,
    accent: "group-hover:text-gold",
    // Ações rápidas da Agenda (no mobile o FAB ainda inclui "Abrir comanda").
    children: [
      { label: "Agendar horário", href: "/admin?novo=1", action: true },
      { label: "Link de agendamento", href: "/admin?acao=link", action: true },
      { label: "Lista de espera", href: "/admin?acao=espera", action: true },
    ],
  },
  // Entidades de cadastro: link direto para a tela.
  {
    label: "Clientes",
    href: "/admin/cadastros/clientes",
    icon: Users,
    accent: "group-hover:text-indigo-400",
  },
  {
    label: "Funcionários",
    href: "/admin/cadastros/funcionarios",
    icon: UserCog,
    accent: "group-hover:text-sky-400",
  },
  {
    label: "Serviços",
    href: "/admin/cadastros/servicos",
    icon: Scissors,
    accent: "group-hover:text-orange-400",
  },
  {
    label: "Pacotes",
    href: "/admin/cadastros/pacotes",
    icon: Layers,
    accent: "group-hover:text-fuchsia-400",
  },
  {
    label: "Produtos",
    href: "/admin/cadastros/produtos",
    icon: Package,
    accent: "group-hover:text-teal-400",
  },
  {
    label: "Cupons",
    href: "/admin/cupons",
    icon: Tag,
    accent: "group-hover:text-pink-400",
  },
  {
    label: "Comandas",
    href: "/admin/comandas",
    icon: FileText,
    accent: "group-hover:text-amber-400",
    children: [
      { label: "Abertas", href: "/admin/comandas/abertas" },
      { label: "Histórico", href: "/admin/comandas/historico" },
    ],
  },
  {
    label: "Financeiro",
    href: "/admin/financeiro",
    icon: DollarSign,
    accent: "group-hover:text-emerald-400",
    children: [
      { label: "Visão geral", href: "/admin/financeiro" },
      { label: "Caixa", href: "/admin/financeiro/caixa" },
      { label: "Histórico de Caixas", href: "/admin/financeiro/historico" },
      { label: "Entrada / Saída", href: "/admin/financeiro/entrada-saida" },
      { label: "Fluxo de Caixa", href: "/admin/financeiro/fluxo" },
      { label: "Comissões", href: "/admin/financeiro/comissoes" },
      { label: "Conta do Cliente", href: "/admin/financeiro/conta-cliente" },
      { label: "Conta Profissional", href: "/admin/financeiro/conta-profissional" },
      { label: "Caixinha", href: "/admin/financeiro/caixinha" },
    ],
  },
  {
    label: "Aniversariantes",
    href: "/admin/aniversariantes",
    icon: Gift,
    accent: "group-hover:text-rose-400",
  },
  {
    label: "Config.",
    href: "/admin/configuracoes",
    icon: Settings,
    accent: "group-hover:text-slate-300",
  },
];

// Classe do "casco" de um item (ativo = realce dourado da marca, fixo nos 3 temas).
const itemShellActive = "admin-surface-subtle border border-gold/20 shadow-[0_0_20px_rgba(194,163,93,0.15)]";
const itemShellIdle = "border border-transparent admin-glass-card-hover";

function NavLink({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(item.href + "/");
  const [open, setOpen] = useState(isActive);

  // Auto-expande ao navegar para dentro deste item (mantém colapsável manualmente).
  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  if (item.children) {
    return (
      <li>
        {/* Corpo navega para a tela E abre a expansão; o chevron só toggla. */}
        <div className={`transform-gpu group flex items-center rounded-xl transition-all ${isActive ? itemShellActive : itemShellIdle}`}>
          <Link
            href={item.href}
            onClick={() => { setOpen(true); onClick?.(); }}
            className="flex-1 flex items-center px-3 py-2.5 min-w-0"
          >
            <Icon className={`w-5 h-5 mr-3 shrink-0 ${isActive ? "text-gold" : "admin-text-secondary"} ${item.accent}`} />
            <span className={`text-sm font-medium truncate ${isActive ? "admin-text-primary" : "admin-text-secondary"}`}>{item.label}</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Recolher" : "Expandir"}
            className="px-2.5 py-2.5 admin-text-secondary hover:text-gold transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-90" : ""}`} />
          </button>
        </div>
        {/* Expansão animada (altura via grid-rows, padrão do projeto) */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <ul className="mt-1 mb-2 ml-11 space-y-1 border-l pl-3" style={{ borderColor: "var(--admin-border)" }}>
              {item.children.map((child) => {
                const childActive = pathname === child.href;
                return (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={onClick}
                      className={`flex items-center gap-1.5 py-2 text-sm transition-colors ${
                        childActive ? "text-gold font-medium" : "admin-text-secondary hover:admin-text-primary"
                      }`}
                    >
                      {child.action && <Plus className="w-3.5 h-3.5 text-gold shrink-0" />}
                      {child.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={`transform-gpu group flex items-center px-3 py-2.5 rounded-xl transition-all ${isActive ? itemShellActive : itemShellIdle}`}
      >
        <Icon className={`w-5 h-5 mr-3 shrink-0 ${isActive ? "text-gold" : "admin-text-secondary"} ${item.accent}`} />
        <span className={`text-sm font-medium ${isActive ? "admin-text-primary" : "admin-text-secondary"}`}>{item.label}</span>
      </Link>
    </li>
  );
}

// Sidebar lateral — só aparece em md+
function DesktopSidebar() {
  const { user, perms, logout } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "??";
  const visibleItems = filterNav(navItems, perms);

  return (
    <aside className="transform-gpu hidden md:flex w-64 admin-glass-card flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 admin-border-b">
        <div className="w-8 h-8 rounded-full admin-surface-subtle shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center justify-center overflow-hidden mr-3">
          <Image src="/logo-barbearia.png" alt="Barbearia Século XXI" width={32} height={32} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-bold tracking-tight admin-text-primary">Século XXI</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {visibleItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </ul>
      </nav>

      <div className="p-4 admin-border-t">
        <div className="transform-gpu flex items-center w-full px-3 py-2 admin-glass-card rounded-lg">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#ece4cb] to-[#c2a35d] flex items-center justify-center text-xs font-bold mr-3 text-slate-950 shadow-[0_0_12px_rgba(194,163,93,0.45)]">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium admin-text-primary truncate">{user?.email ?? "—"}</p>
            <p className="text-xs admin-text-secondary truncate">Admin</p>
          </div>
          <button onClick={logout} className="admin-text-secondary hover:text-red-400 transition-colors" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavBottomItem({
  href,
  icon: Icon,
  label,
  pathname,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
}) {
  const isActive = pathname === href || pathname.startsWith(href + "/");

  const handleClick = () => {
    if (isActive) {
      document.getElementById("agenda-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex flex-col items-center justify-end gap-1 flex-1 pb-1.5 transition-colors ${
        isActive ? "text-gold" : "admin-nav-text hover:opacity-80"
      }`}
    >
      <motion.div
        whileTap={{ scale: 0.85 }}
        animate={{ scale: isActive ? 1 : 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`flex items-center justify-center w-10 h-10 rounded-full ${
          isActive
            ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 shadow-[0_0_22px_rgba(194,163,93,0.6)]"
            : "admin-nav-text"
        }`}
      >
        <Icon className="w-5 h-5" />
      </motion.div>
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}

// Bottom nav — só aparece em mobile
function MobileBottomNav() {
  const pathname = usePathname();
  const { shortcuts } = useNavShortcuts();
  const centerHref = shortcuts[NAV_SHORTCUTS_CENTER_INDEX];
  const centerItem = getMenuItemByHref(centerHref);
  const CenterIcon = centerItem?.icon ?? Calendar;
  const isCenterActive = centerHref === "/admin" ? pathname === "/admin" : pathname === centerHref || pathname.startsWith(centerHref + "/");

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-30 md:hidden">
      {/* Barra inferior flutuante */}
      <div className="admin-nav-pill transform-gpu flex items-end justify-around h-16 px-2 rounded-[2rem]">
        {shortcuts.map((href, index) => {
          if (index === NAV_SHORTCUTS_CENTER_INDEX) {
            return (
              <div key="center-spacer" className="flex-1 flex flex-col items-center pb-2.5">
                <span className="w-10 h-10" />
                <span className="text-[10px] opacity-0">.</span>
              </div>
            );
          }

          const item = getMenuItemByHref(href);
          if (!item) return null;

          return <NavBottomItem key={href} href={item.href} icon={item.icon} label={item.label} pathname={pathname} />;
        })}
      </div>

      {/* Item central — elevado, fora da camada de blur da pill para evitar bug de backdrop-filter */}
      <Link
        href={centerHref}
        onClick={() => { if (pathname === centerHref) document.getElementById("agenda-scroll")?.scrollTo({ top: 0, behavior: "smooth" }); }}
        className="absolute left-1/2 -translate-x-1/2 -top-5 flex flex-col items-center"
      >
        <motion.div
          whileTap={{ scale: 0.85 }}
          animate={{ scale: isCenterActive ? 1 : 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={`transform-gpu flex items-center justify-center w-16 h-16 rounded-full ${
            isCenterActive
              ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] border border-white/30 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_28px_rgba(194,163,93,0.55)]"
              : "admin-nav-center admin-nav-text"
          }`}
        >
          <CenterIcon className="w-6 h-6" />
        </motion.div>
        <span className={`text-[10px] mt-1 font-medium ${isCenterActive ? "text-gold" : "admin-nav-text"}`}>
          {centerItem?.label ?? "Agenda"}
        </span>
      </Link>
    </nav>
  );
}

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
}
