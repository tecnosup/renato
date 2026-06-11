"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Percent,
} from "lucide-react";
import { FaCashRegister } from "react-icons/fa";

const navItems = [
  {
    label: "Agenda",
    href: "/",
    icon: Calendar,
    accent: "group-hover:text-blue-400",
  },
  {
    label: "Cadastros",
    href: "/cadastros",
    icon: Users,
    accent: "group-hover:text-violet-400",
    children: [
      { label: "Clientes", href: "/cadastros/clientes" },
      { label: "Serviços", href: "/cadastros/servicos" },
      { label: "Pacotes", href: "/cadastros/pacotes" },
      { label: "Produtos", href: "/cadastros/produtos" },
    ],
  },
  {
    label: "Comandas",
    href: "/comandas",
    icon: FileText,
    accent: "group-hover:text-amber-400",
    children: [
      { label: "Abertas", href: "/comandas/abertas" },
      { label: "Histórico", href: "/comandas/historico" },
    ],
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
    accent: "group-hover:text-emerald-400",
    children: [
      { label: "Caixa", href: "/financeiro/caixa" },
      { label: "Histórico de Caixas", href: "/financeiro/historico" },
      { label: "Entrada / Saída", href: "/financeiro/entrada-saida" },
      { label: "Fluxo de Caixa", href: "/financeiro/fluxo" },
      { label: "Comissões", href: "/financeiro/comissoes" },
      { label: "Conta do Cliente", href: "/financeiro/conta-cliente" },
      { label: "Conta Profissional", href: "/financeiro/conta-profissional" },
      { label: "Caixinha", href: "/financeiro/caixinha" },
    ],
  },
  {
    label: "Config.",
    href: "/configuracoes",
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
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  if (item.children) {
    return (
      <li>
        <button
          onClick={() => setOpen(!open)}
          className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
            isActive
              ? "bg-slate-800 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <div className="flex items-center">
            <Icon className={`w-5 h-5 mr-3 text-slate-400 ${item.accent}`} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {open ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {open && (
          <ul className="mt-1 mb-2 ml-11 space-y-1 border-l border-slate-700 pl-3">
            {item.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onClick}
                  className={`block py-2 text-sm transition-colors ${
                    pathname === child.href
                      ? "text-white font-medium"
                      : "text-slate-400 hover:text-slate-100"
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
        className={`group flex items-center px-3 py-2.5 rounded-lg transition-colors ${
          isActive
            ? "bg-slate-800 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 text-slate-400 ${item.accent}`} />
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    </li>
  );
}

// Sidebar lateral — só aparece em md+
function DesktopSidebar() {
  return (
    <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-slate-700 rounded-md mr-3" />
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Século XXI</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center w-full px-3 py-2 bg-slate-800/50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold mr-3">
            RV
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">Renato Vilhagra</p>
            <p className="text-xs text-slate-500 truncate">Admin</p>
          </div>
          <button className="text-slate-400 hover:text-red-400 transition-colors">
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
      className={`flex flex-col items-center justify-end gap-1 flex-1 pb-2 transition-colors ${
        isActive ? "text-blue-400" : "text-slate-400 hover:text-white"
      }`}
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
        isActive ? "bg-blue-500 text-white" : "text-slate-400"
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}

// Bottom nav — só aparece em mobile
function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Barra inferior fixa */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 md:hidden overflow-visible">
        <div className="flex items-end justify-around h-16 px-2">

          {/* Comissões */}
          <NavBottomItem href="/financeiro/comissoes" icon={Percent} label="Comissões" pathname={pathname} />

          {/* Caixa */}
          <NavBottomItem href="/financeiro/caixa" icon={FaCashRegister} label="Caixa" pathname={pathname} />

          {/* Agenda — centralizada e elevada */}
          <div className="flex flex-col items-center flex-1">
            <Link
              href="/"
              onClick={() => { if (pathname === "/") document.getElementById("agenda-scroll")?.scrollTo({ top: 0, behavior: "smooth" }); }}
              className={`flex items-center justify-center w-16 h-16 rounded-full -translate-y-4 shadow-lg transition-colors ${
                pathname === "/"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <Calendar className="w-6 h-6" />
            </Link>
            <span className={`text-[10px] -mt-3 pb-2 font-medium ${pathname === "/" ? "text-blue-400" : "text-slate-400"}`}>
              Agenda
            </span>
          </div>

          {/* Clientes */}
          <NavBottomItem href="/cadastros/clientes" icon={Users} label="Clientes" pathname={pathname} />

          {/* Menu */}
          <NavBottomItem href="/menu" icon={Menu} label="Menu" pathname={pathname} />

        </div>
      </nav>
    </>
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
