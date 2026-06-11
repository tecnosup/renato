import Link from "next/link";
import { Users, DollarSign, Gift, Settings, Percent, FileText, Scissors, UserCog, Bell, BellRing, LogOut, ChevronRight, Package, Tag } from "lucide-react";

const menuItems = [
  {
    label: "Agenda",
    desc: "Veja e gerencie os agendamentos do dia",
    href: "/",
    icon: FileText,
    color: "bg-blue-600",
    badge: 9,
    badgeColor: "bg-red-500",
  },
  {
    label: "Financeiro",
    desc: "Controle seu caixa e fluxo financeiro",
    href: "/financeiro/caixa",
    icon: DollarSign,
    color: "bg-violet-600",
    badge: null,
  },
  {
    label: "Produtos",
    desc: "Gerencie o estoque de produtos",
    href: "/cadastros/produtos",
    icon: Package,
    color: "bg-teal-600",
    badge: null,
  },
  {
    label: "Serviços",
    desc: "Cadastre e edite os serviços da barbearia",
    href: "/cadastros/servicos",
    icon: Scissors,
    color: "bg-orange-600",
    badge: null,
  },
  {
    label: "Funcionários",
    desc: "Gerencie os profissionais da barbearia",
    href: "/cadastros/funcionarios",
    icon: UserCog,
    color: "bg-sky-600",
    badge: null,
  },
  {
    label: "Comissões",
    desc: "Visualize e filtre as comissões dos profissionais",
    href: "/financeiro/comissoes",
    icon: Percent,
    color: "bg-emerald-600",
    badge: null,
  },
  {
    label: "Clientes",
    desc: "Cadastre e consulte seus clientes",
    href: "/cadastros/clientes",
    icon: Users,
    color: "bg-indigo-600",
    badge: null,
  },
  {
    label: "Cupons",
    desc: "Crie e gerencie cupons de desconto",
    href: "/cupons",
    icon: Tag,
    color: "bg-pink-600",
    badge: null,
  },
  {
    label: "Aniversariantes",
    desc: "Envie parabéns para os aniversariantes",
    href: "/aniversariantes",
    icon: Gift,
    color: "bg-rose-600",
    badge: null,
  },
  {
    label: "Configurações",
    desc: "Gerencie as configurações da barbearia",
    href: "/configuracoes",
    icon: Settings,
    color: "bg-slate-600",
    badge: null,
  },
];

export default function MenuPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">
      {/* Header com logo */}
      <div className="w-full h-44 bg-slate-900 flex flex-col items-center justify-center border-b border-slate-800">
        <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-black text-white mb-2">
          XXI
        </div>
        <span className="text-white text-sm font-semibold tracking-widest">BARBEARIA SÉCULO XXI</span>
      </div>

      {/* Itens principais */}
      <div className="p-4 space-y-1">
        {menuItems.map(({ label, desc, href, icon: Icon, color, badge, badgeColor }) => (
          <Link
            key={href + label}
            href={href}
            className="flex items-center gap-4 hover:bg-slate-800/60 active:bg-slate-800 rounded-2xl px-3 py-3.5 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            {badge && (
              <span className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${badgeColor ?? "bg-red-500"}`}>
                {badge}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
          </Link>
        ))}
      </div>

      {/* Separador */}
      <div className="mx-4 border-t border-slate-800 my-2" />

      {/* Alertas e Notificações */}
      <div className="px-4 space-y-1">
        <Link href="/alertas" className="flex items-center gap-4 hover:bg-slate-800/60 rounded-2xl px-3 py-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-400">Alertas</p>
            <p className="text-xs text-slate-500 mt-0.5">Pendências que precisam de atenção</p>
          </div>
          <span className="text-[11px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">14</span>
          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
        </Link>

        <Link href="/notificacoes" className="flex items-center gap-4 hover:bg-slate-800/60 rounded-2xl px-3 py-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-600/70 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-400">Notificações</p>
            <p className="text-xs text-slate-500 mt-0.5">Atualizações e avisos do sistema</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
        </Link>
      </div>

      {/* Separador */}
      <div className="mx-4 border-t border-slate-800 my-2" />

      {/* Sair */}
      <div className="px-4 pb-8">
        <button className="flex items-center gap-4 w-full hover:bg-red-500/10 rounded-2xl px-3 py-3.5 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-red-500/20">
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
          </div>
          <p className="text-sm font-semibold text-slate-400 group-hover:text-red-400">Sair</p>
        </button>
      </div>
    </div>
  );
}
