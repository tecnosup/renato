import Link from "next/link";
import Image from "next/image";
import { Users, DollarSign, Gift, Settings, Percent, FileText, Scissors, UserCog, Bell, BellRing, LogOut, ChevronRight, Package, Tag } from "lucide-react";

const menuItems = [
  {
    label: "Agenda",
    desc: "Veja e gerencie os agendamentos do dia",
    href: "/admin",
    icon: FileText,
    color: "bg-blue-600",
    badge: 9,
    badgeColor: "bg-red-500",
  },
  {
    label: "Financeiro",
    desc: "Controle seu caixa e fluxo financeiro",
    href: "/admin/financeiro",
    icon: DollarSign,
    color: "bg-violet-600",
    badge: null,
  },
  {
    label: "Produtos",
    desc: "Gerencie o estoque de produtos",
    href: "/admin/cadastros/produtos",
    icon: Package,
    color: "bg-teal-600",
    badge: null,
  },
  {
    label: "Serviços",
    desc: "Cadastre e edite os serviços da barbearia",
    href: "/admin/cadastros/servicos",
    icon: Scissors,
    color: "bg-orange-600",
    badge: null,
  },
  {
    label: "Funcionários",
    desc: "Gerencie os profissionais da barbearia",
    href: "/admin/cadastros/funcionarios",
    icon: UserCog,
    color: "bg-sky-600",
    badge: null,
  },
  {
    label: "Comissões",
    desc: "Visualize e filtre as comissões dos profissionais",
    href: "/admin/financeiro/comissoes",
    icon: Percent,
    color: "bg-emerald-600",
    badge: null,
  },
  {
    label: "Clientes",
    desc: "Cadastre e consulte seus clientes",
    href: "/admin/cadastros/clientes",
    icon: Users,
    color: "bg-indigo-600",
    badge: null,
  },
  {
    label: "Cupons",
    desc: "Crie e gerencie cupons de desconto",
    href: "/admin/cupons",
    icon: Tag,
    color: "bg-pink-600",
    badge: null,
  },
  {
    label: "Aniversariantes",
    desc: "Envie parabéns para os aniversariantes",
    href: "/admin/aniversariantes",
    icon: Gift,
    color: "bg-rose-600",
    badge: null,
  },
  {
    label: "Configurações",
    desc: "Gerencie as configurações da barbearia",
    href: "/admin/configuracoes",
    icon: Settings,
    color: "bg-slate-600",
    badge: null,
  },
];

export default function MenuPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header com logo */}
      <div className="transform-gpu mx-4 mt-4 mb-3 rounded-2xl overflow-hidden bg-white/2 backdrop-blur-md backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.25)] h-40 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-white/8 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center justify-center overflow-hidden mb-2">
          <Image src="/logo-barbearia.png" alt="Barbearia Século XXI" width={80} height={80} className="w-full h-full object-cover" />
        </div>
        <span className="text-white text-sm font-semibold tracking-widest">BARBEARIA SÉCULO XXI</span>
      </div>

      {/* Itens principais */}
      <div className="transform-gpu mx-4 mb-3 rounded-2xl overflow-hidden bg-white/2 backdrop-blur-md backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.25)] p-1">
        {menuItems.map(({ label, desc, href, icon: Icon, color, badge, badgeColor }) => (
          <Link
            key={href + label}
            href={href}
            className="flex items-center gap-4 hover:bg-white/8 active:bg-white/12 rounded-xl px-3 py-3.5 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100">{label}</p>
              <p className="text-xs text-slate-300/80 mt-0.5">{desc}</p>
            </div>
            {badge && (
              <span className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${badgeColor ?? "bg-red-500"}`}>
                {badge}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-200 shrink-0" />
          </Link>
        ))}
      </div>

      {/* Alertas e Notificações */}
      <div className="transform-gpu mx-4 mb-3 rounded-2xl overflow-hidden bg-white/2 backdrop-blur-md backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.25)] p-1">
        <Link href="/admin/alertas" className="flex items-center gap-4 hover:bg-white/8 rounded-xl px-3 py-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-100">Alertas</p>
            <p className="text-xs text-slate-300/80 mt-0.5">Pendências que precisam de atenção</p>
          </div>
          <span className="text-[11px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">14</span>
          <ChevronRight className="w-4 h-4 text-slate-200 shrink-0" />
        </Link>

        <Link href="/admin/notificacoes" className="flex items-center gap-4 hover:bg-white/8 rounded-xl px-3 py-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-600/70 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-100">Notificações</p>
            <p className="text-xs text-slate-300/80 mt-0.5">Atualizações e avisos do sistema</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-200 shrink-0" />
        </Link>
      </div>

      {/* Sair */}
      <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden bg-white/2 backdrop-blur-md backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.25)] p-1">
        <button className="flex items-center gap-4 w-full hover:bg-red-500/10 rounded-xl px-3 py-3.5 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center shrink-0 group-hover:bg-red-500/20">
            <LogOut className="w-5 h-5 text-slate-100 group-hover:text-red-400" />
          </div>
          <p className="text-sm font-semibold text-slate-100 group-hover:text-red-400">Sair</p>
        </button>
      </div>
    </div>
  );
}
