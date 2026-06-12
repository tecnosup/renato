"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Palette, LayoutGrid, Download } from "lucide-react";

const configItems = [
  {
    label: "Imagem de fundo",
    desc: "Personalize o fundo do painel",
    href: "/admin/configuracoes/fundo",
    icon: ImageIcon,
    color: "bg-sky-600",
  },
  {
    label: "Tema",
    desc: "Diurno, noturno ou liquid glass",
    href: "/admin/configuracoes/tema",
    icon: Palette,
    color: "bg-violet-600",
  },
  {
    label: "Atalhos da navbar",
    desc: "Escolha os botões da barra inferior",
    href: "/admin/configuracoes/atalhos",
    icon: LayoutGrid,
    color: "bg-emerald-600",
  },
  {
    label: "Importar do AppBarber",
    desc: "Traga seus dados do sistema antigo",
    href: "/admin/configuracoes/importar-appbarber",
    icon: Download,
    color: "bg-amber-600",
  },
];

export default function ConfiguracoesPage() {
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button
          onClick={() => router.back()}
          className="text-slate-100 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-100">Configurações</h1>
      </div>

      {/* Itens */}
      <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card p-1">
        {configItems.map(({ label, desc, href, icon: Icon, color }) => (
          <Link
            key={href}
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
            <ChevronRight className="w-4 h-4 admin-text-primary shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
