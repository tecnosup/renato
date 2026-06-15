"use client";

import { motion } from "framer-motion";
import {
  Scissors,
  Sparkles,
  CheckCircle2,
  Calendar,
  CreditCard,
  Palette,
  Users,
  MessageCircle,
  ArrowRight,
  Building2,
  ShieldCheck,
  Gift,
  Database,
  Tag,
  FileSignature,
} from "lucide-react";
import Link from "next/link";

const PRONTO = [
  {
    icon: Sparkles,
    title: "Landing page imersiva",
    desc: "Visual 3D interativo, animações fluidas e identidade visual exclusiva da Século XXI.",
  },
  {
    icon: Calendar,
    title: "Painel administrativo completo",
    desc: "Agenda, comandas, cadastro de clientes e financeiro com gráficos — pronto para operar.",
  },
  {
    icon: Palette,
    title: "3 temas personalizáveis",
    desc: "Liquid Glass, Noturno e Diurno — o painel se adapta ao gosto de quem está usando.",
  },
  {
    icon: ShieldCheck,
    title: "Login seguro",
    desc: "Autenticação protegida para o painel administrativo, com sessão segura.",
  },
];

const PROXIMA_ENTREGA = [
  {
    icon: Database,
    title: "Agendamento conectado em tempo real",
    desc: "Reservas feitas pela landing caem direto na agenda do painel.",
  },
  {
    icon: CreditCard,
    title: "Comandas e caixa 100% funcionais",
    desc: "Abertura, fechamento e histórico de caixa conectados ao banco de dados.",
  },
  {
    icon: Building2,
    title: "Financeiro real",
    desc: "Faturamento, despesas e comissões calculados a partir dos dados reais da operação.",
  },
  {
    icon: Users,
    title: "Funcionários e comissões",
    desc: "Cada profissional com login próprio e comissão calculada automaticamente.",
  },
  {
    icon: Tag,
    title: "Cupons de desconto",
    desc: "Crie campanhas e cupons promocionais direto pelo painel.",
  },
  {
    icon: Database,
    title: "Importação do AppBarber",
    desc: "Histórico de clientes migrado para o novo sistema, sem perder nada.",
  },
];

export default function PropostaPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-[#e2e2e2] antialiased overflow-x-hidden selection:bg-gold selection:text-black">
      {/* Background ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020202] via-[#080808] to-[#020202]" />
        <div className="absolute top-[-10%] right-[-15%] w-[700px] h-[700px] bg-[#c2a35d]/5 rounded-full blur-[140px] hidden md:block" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-[#c2a35d]/4 rounded-full blur-[130px] hidden md:block" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-4 md:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 font-sans text-[9px] text-[#c2a35d] uppercase tracking-[0.35em] font-bold bg-[#c2a35d]/5 border border-[#c2a35d]/10 px-4 py-1.5 rounded-full mb-6"
        >
          <span className="inline-block w-1.5 h-1.5 bg-[#c2a35d] rounded-full" />
          PROPOSTA EXCLUSIVA · BARBEARIA SÉCULO XXI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-light text-4xl sm:text-6xl text-zinc-100 tracking-wide leading-[1.1] mb-6"
        >
          O seu sistema, <br className="sm:hidden" />
          <span className="text-[#c2a35d] font-serif italic">do zero ao ar</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="font-sans text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
        >
          Em apenas 4 dias já construímos a base completa do sistema que vai substituir o
          AppBarber — com a sua marca, do seu jeito. Esta proposta mostra o que já está
          pronto, o que vem a seguir e como vamos seguir juntos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="#investimento"
            className="h-12 bg-linear-to-r from-[#ece4cb] to-[#c2a35d] text-slate-950 font-sans text-[11px] font-black tracking-[0.15em] px-8 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(194,163,93,0.3)] hover:scale-[1.02] transition-all"
          >
            VER INVESTIMENTO
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/proposta/contrato"
            className="h-12 bg-transparent text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 font-sans text-[11px] font-bold tracking-[0.15em] px-8 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <FileSignature className="w-3.5 h-3.5" />
            VER CONTRATO
          </Link>
        </motion.div>
      </section>

      {/* O QUE JÁ ESTÁ PRONTO */}
      <section className="relative z-10 px-4 md:px-8 py-12 sm:py-16 max-w-6xl mx-auto">
        <SectionHeader
          tag="ENTREGA ATUAL · 4 DIAS"
          title={
            <>
              O que já está <span className="text-[#c2a35d] font-serif italic">pronto</span>
            </>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRONTO.map((item, i) => (
            <FeatureCard key={item.title} item={item} index={i} done />
          ))}
        </div>
      </section>

      {/* O QUE VEM A SEGUIR */}
      <section className="relative z-10 px-4 md:px-8 py-12 sm:py-16 max-w-6xl mx-auto">
        <SectionHeader
          tag="PRÓXIMOS 25 DIAS"
          title={
            <>
              O que vem na <span className="text-[#c2a35d] font-serif italic">entrega final</span>
            </>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROXIMA_ENTREGA.map((item, i) => (
            <FeatureCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* BÔNUS WHATSAPP */}
      <section className="relative z-10 px-4 md:px-8 py-12 sm:py-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative bg-white/5 backdrop-blur-xl border border-[#c2a35d]/20 rounded-3xl p-8 sm:p-10 overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#c2a35d]/10 rounded-full blur-[80px]" />
          <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#c2a35d]/10 border border-[#c2a35d]/30 flex items-center justify-center shrink-0">
              <MessageCircle className="w-7 h-7 text-[#c2a35d]" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-[#c2a35d] uppercase tracking-[0.25em] font-bold">
                BÔNUS EXCLUSIVO
              </span>
              <h3 className="font-display font-light text-2xl sm:text-3xl text-zinc-100 mt-1 mb-3">
                Automação via WhatsApp
              </h3>
              <p className="font-sans text-sm text-zinc-400 leading-relaxed max-w-2xl">
                Seu cliente recebe automaticamente uma mensagem de{" "}
                <strong className="text-zinc-200">confirmação ao agendar</strong> e um{" "}
                <strong className="text-zinc-200">lembrete 1 hora antes</strong> do horário —
                tudo direto pelo número de WhatsApp da sua barbearia, sem custo adicional.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* INVESTIMENTO */}
      <section id="investimento" className="relative z-10 px-4 md:px-8 py-12 sm:py-20 max-w-5xl mx-auto">
        <SectionHeader
          tag="INVESTIMENTO"
          title={
            <>
              Vamos colocar isso <span className="text-[#c2a35d] font-serif italic">no ar</span>
            </>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
          {/* Plano 1 unidade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 sm:p-8 flex flex-col"
          >
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-2">
              NOVA UNIDADE
            </span>
            <h3 className="font-display font-light text-xl text-zinc-100 mb-4">
              Sistema completo para a unidade nova
            </h3>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="font-sans text-zinc-500 text-sm">R$</span>
              <span className="font-display text-4xl text-zinc-100 font-light">1.850</span>
            </div>
            <ul className="space-y-3 font-sans text-sm text-zinc-400 mb-6 flex-1">
              <BenefitRow text="Sistema completo (landing + painel) para a nova unidade" />
              <BenefitRow text="Hospedagem nas suas próprias contas (Vercel, Firebase, R2)" />
              <BenefitRow text="12 meses de suporte e correções inclusos" />
              <BenefitRow text="Bônus: automação de WhatsApp" />
            </ul>
          </motion.div>

          {/* Plano combo - destaque */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-white/5 backdrop-blur-xl border-2 border-[#c2a35d]/50 rounded-3xl p-7 sm:p-8 flex flex-col shadow-[0_0_40px_rgba(194,163,93,0.15)]"
          >
            <span className="absolute -top-3 right-6 bg-linear-to-r from-[#ece4cb] to-[#c2a35d] text-slate-950 font-sans text-[9px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full shadow-lg">
              MAIS VANTAJOSO
            </span>
            <span className="font-mono text-[9px] text-[#c2a35d] uppercase tracking-[0.25em] font-bold mb-2">
              AS DUAS UNIDADES
            </span>
            <h3 className="font-display font-light text-xl text-zinc-100 mb-4">
              Século XXI atual + nova unidade
            </h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-sans text-zinc-600 text-sm line-through">R$ 3.350</span>
              <span className="font-mono text-[9px] text-emerald-400 uppercase font-bold tracking-wider">
                oferta de lançamento
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="font-sans text-[#c2a35d] text-sm">R$</span>
              <span className="font-display text-4xl text-[#c2a35d] font-light">3.000</span>
            </div>
            <ul className="space-y-3 font-sans text-sm text-zinc-300 mb-6 flex-1">
              <BenefitRow text="Sistema completo para AS DUAS unidades, cada uma com sua instância" highlight />
              <BenefitRow text="Migração do histórico de clientes do AppBarber para a unidade atual" highlight />
              <BenefitRow text="Hospedagem nas suas próprias contas (Vercel, Firebase, R2)" highlight />
              <BenefitRow text="12 meses de suporte e correções inclusos" highlight />
              <BenefitRow text="Bônus: automação de WhatsApp em ambas unidades" highlight />
            </ul>
          </motion.div>
        </div>

        {/* Pós 12 meses */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-6 bg-black/30 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#c2a35d]/10 border border-[#c2a35d]/20 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-[#c2a35d]" />
          </div>
          <p className="font-sans text-sm text-zinc-400 leading-relaxed">
            Depois dos primeiros 12 meses, o sistema continua{" "}
            <strong className="text-zinc-200">100% seu — sem custo nenhum</strong>. Se quiser
            manter nosso suporte e atualizações contínuas, a manutenção fica em apenas{" "}
            <strong className="text-[#c2a35d]">R$ 129,90/mês</strong> (cobrindo as duas
            unidades), sem fidelidade — cancele quando quiser.
          </p>
        </motion.div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="font-sans text-zinc-400 text-sm mb-4">
            Tudo pronto até <strong className="text-zinc-200">10/07</strong>, antes da
            inauguração da nova unidade.
          </p>
          <Link
            href="/proposta/contrato"
            className="inline-flex items-center gap-2 h-12 bg-linear-to-r from-[#ece4cb] to-[#c2a35d] text-slate-950 font-sans text-[11px] font-black tracking-[0.15em] px-8 rounded-xl shadow-[0_0_20px_rgba(194,163,93,0.3)] hover:scale-[1.02] transition-all"
          >
            <FileSignature className="w-3.5 h-3.5" />
            ABRIR CONTRATO PARA ASSINATURA
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 mt-12 py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#c2a35d] text-black rounded-full flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-light text-zinc-100 tracking-[0.16em] uppercase text-sm">
              SÉCULO <span className="text-[#c2a35d] font-serif italic">XXI</span>
            </span>
          </div>
          <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
            Proposta válida para apresentação · {new Date().toLocaleDateString("pt-BR")}
          </span>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ tag, title }: { tag: string; title: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mb-8 text-center sm:text-left"
    >
      <span className="font-mono text-[9px] text-[#c2a35d]/70 uppercase tracking-[0.25em] font-bold">
        {tag}
      </span>
      <h2 className="font-display font-light text-2xl sm:text-3xl text-zinc-100 mt-2">
        {title}
      </h2>
    </motion.div>
  );
}

function FeatureCard({
  item,
  index,
  done,
}: {
  item: { icon: React.ElementType; title: string; desc: string };
  index: number;
  done?: boolean;
}) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-[#c2a35d]/10 border border-[#c2a35d]/20 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-[#c2a35d]" />
        </div>
        {done && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      </div>
      <h4 className="font-display font-medium text-sm text-zinc-100 leading-snug">
        {item.title}
      </h4>
      <p className="font-sans text-[12px] text-zinc-450 leading-relaxed">{item.desc}</p>
    </motion.div>
  );
}

function BenefitRow({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2
        className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? "text-[#c2a35d]" : "text-emerald-400"}`}
      />
      <span>{text}</span>
    </li>
  );
}
