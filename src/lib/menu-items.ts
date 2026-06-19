import type { ComponentType } from "react";
import { Users, DollarSign, Gift, Settings, Percent, Calendar, Scissors, UserCog, Package, Tag, TrendingUp, FileText, LayoutDashboard, type LucideIcon } from "lucide-react";
import { FaCashRegister } from "react-icons/fa";

export interface MenuItem {
  label: string;
  desc: string;
  href: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  color: string;
  badge: number | null;
  badgeColor?: string;
}

export const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    desc: "Visão geral da barbearia",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    color: "bg-purple-600",
    badge: null,
  },
  {
    label: "Agenda",
    desc: "Veja e gerencie os agendamentos do dia",
    href: "/admin",
    icon: Calendar,
    color: "bg-blue-600",
    badge: 9,
    badgeColor: "bg-red-500",
  },
  {
    label: "Caixa",
    desc: "Abra, confira e feche o caixa do dia",
    href: "/admin/financeiro/caixa",
    icon: FaCashRegister,
    color: "bg-cyan-600",
    badge: null,
  },
  {
    label: "Comandas",
    desc: "Abra, edite e feche as comandas dos atendimentos",
    href: "/admin/comandas",
    icon: FileText,
    color: "bg-amber-600",
    badge: null,
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
    label: "Meu Financeiro",
    desc: "Suas comandas, atendimentos e comissão",
    href: "/admin/financeiro/meu-financeiro",
    icon: TrendingUp,
    color: "bg-lime-600",
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
