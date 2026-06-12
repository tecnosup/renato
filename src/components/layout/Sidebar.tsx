"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavShortcuts } from "@/hooks/useNavShortcuts";
import { NAV_SHORTCUTS_CENTER_INDEX, getMenuItemByHref } from "@/lib/nav-shortcuts";

const navItems = [
  {
    label: "Agenda",
    href: "/admin",
    icon: Calendar,
    accent: "group-hover:text-gold",
  },
  {
    label: "Cadastros",
    href: "/admin/cadastros",
    icon: Users,
    accent: "group-hover:text-violet-400",
    children: [
      { label: "Clientes", href: "/admin/cadastros/clientes" },
      { label: "Serviços", href: "/admin/cadastros/servicos" },
      { label: "Pacotes", href: "/admin/cadastros/pacotes" },
      { label: "Produtos", href: "/admin/cadastros/produtos" },
    ],
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
    label: "Config.",
    href: "/admin/configuracoes",
    icon: Settings,
    accent: "group-hover:text-slate-300",
  },
];

// Itens que aparecem na bottom nav do mobile (máx 5)
const bottomNavItems = [
  navItems[0], // Agenda
  navItems[1], // Cadastros
  navItems[2], // Comandas
  navItems[3], // Financeiro
  navItems[4], // Config
];

function NavLink({
  item,
  onClick,
}: {
  item: (typeof navItems)[0];
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const isActive = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(item.href + "/");

  if (item.children) {
    return (
      <li>
        <button
          onClick={() => setOpen(!open)}
          className={`transform-gpu group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
            isActive
              ? "bg-white/10 backdrop-blur-md border border-gold/20 text-white shadow-[0_0_20px_rgba(194,163,93,0.15)]"
              : "text-slate-200 border border-transparent hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center">
            <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-gold" : "text-slate-200"} ${item.accent}`} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {open ? (
            <ChevronDown className="w-4 h-4 text-slate-200" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-200" />
          )}
        </button>
        {open && (
          <ul className="mt-1 mb-2 ml-11 space-y-1 border-l border-white/10 pl-3">
            {item.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onClick}
                  className={`block py-2 text-sm transition-colors ${
                    pathname === child.href
                      ? "text-gold font-medium"
                      : "text-slate-200 hover:text-slate-100"
                  }`}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={`transform-gpu group flex items-center px-3 py-2.5 rounded-xl transition-all ${
          isActive
            ? "bg-white/10 backdrop-blur-md border border-gold/20 text-white shadow-[0_0_20px_rgba(194,163,93,0.15)]"
            : "text-slate-200 border border-transparent hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-gold" : "text-slate-200"} ${item.accent}`} />
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    </li>
  );
}

// Sidebar lateral — só aparece em md+
function DesktopSidebar() {
  const { user, logout } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "??";

  return (
    <aside className="transform-gpu hidden md:flex w-64 bg-white/3 backdrop-blur-md backdrop-saturate-100 border-r border-white/15 flex-col h-screen sticky top-0 shadow-[inset_-1px_0_0_rgba(255,255,255,0.1)]">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="w-8 h-8 rounded-full bg-white/8 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center justify-center overflow-hidden mr-3">
          <Image src="/logo-barbearia.png" alt="Barbearia Século XXI" width={32} height={32} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Século XXI</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="transform-gpu flex items-center w-full px-3 py-2 bg-white/3 backdrop-blur-md backdrop-saturate-100 border border-white/15 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#ece4cb] to-[#c2a35d] flex items-center justify-center text-xs font-bold mr-3 text-slate-950 shadow-[0_0_12px_rgba(194,163,93,0.45)]">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-100 truncate">{user?.email ?? "—"}</p>
            <p className="text-xs text-slate-300 truncate">Admin</p>
          </div>
          <button onClick={logout} className="text-slate-200 hover:text-red-400 transition-colors" title="Sair">
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
