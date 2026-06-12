import Link from "next/link";
import Image from "next/image";
import { Bell, BellRing, LogOut, ChevronRight } from "lucide-react";
import { menuItems } from "@/lib/menu-items";

export default function MenuPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header com logo */}
      <div className="transform-gpu mx-4 mt-4 mb-3 rounded-2xl overflow-hidden admin-glass-card h-40 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full admin-surface-subtle flex items-center justify-center overflow-hidden mb-2">
          <Image src="/logo-barbearia.png" alt="Barbearia Século XXI" width={80} height={80} className="w-full h-full object-cover" />
        </div>
        <span className="admin-text-primary text-sm font-semibold tracking-widest">BARBEARIA SÉCULO XXI</span>
      </div>

      {/* Itens principais */}
      <div className="transform-gpu mx-4 mb-3 rounded-2xl overflow-hidden admin-glass-card p-1">
        {menuItems.map(({ label, desc, href, icon: Icon, color, badge, badgeColor }) => (
          <Link
            key={href + label}
            href={href}
            className="admin-glass-card-hover admin-glass-card-active flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold admin-text-primary">{label}</p>
              <p className="text-xs admin-text-secondary mt-0.5">{desc}</p>
            </div>
            {badge && (
              <span className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${badgeColor ?? "bg-red-500"}`}>
                {badge}
              </span>
            )}
            <ChevronRight className="w-4 h-4 admin-text-primary shrink-0" />
          </Link>
        ))}
      </div>

      {/* Alertas e Notificações */}
      <div className="transform-gpu mx-4 mb-3 rounded-2xl overflow-hidden admin-glass-card p-1">
        <Link href="/admin/alertas" className="admin-glass-card-hover flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold admin-text-primary">Alertas</p>
            <p className="text-xs admin-text-secondary mt-0.5">Pendências que precisam de atenção</p>
          </div>
          <span className="text-[11px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">14</span>
          <ChevronRight className="w-4 h-4 admin-text-primary shrink-0" />
        </Link>

        <Link href="/admin/notificacoes" className="admin-glass-card-hover flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-600/70 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold admin-text-primary">Notificações</p>
            <p className="text-xs admin-text-secondary mt-0.5">Atualizações e avisos do sistema</p>
          </div>
          <ChevronRight className="w-4 h-4 admin-text-primary shrink-0" />
        </Link>
      </div>

      {/* Sair */}
      <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card p-1">
        <button className="flex items-center gap-4 w-full hover:bg-red-500/10 rounded-xl px-3 py-3.5 transition-colors group">
          <div className="w-10 h-10 rounded-xl admin-surface-subtle flex items-center justify-center shrink-0 group-hover:bg-red-500/20">
            <LogOut className="w-5 h-5 admin-text-primary group-hover:text-red-400" />
          </div>
          <p className="text-sm font-semibold admin-text-primary group-hover:text-red-400">Sair</p>
        </button>
      </div>
    </div>
  );
}
