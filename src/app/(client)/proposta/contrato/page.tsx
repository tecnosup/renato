"use client";

import { useState } from "react";
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
  ArrowLeft,
  Building2,
  ShieldCheck,
  Gift,
  Database,
  Tag,
  FileSignature,
  Printer,
  XCircle,
  Clock,
  Wallet,
  UserCog,
  Server,
  Scale,
  ClipboardCheck,
  FileText,
  Percent,
  Globe,
  Smartphone,
  Info,
  Banknote,
} from "lucide-react";
import Link from "next/link";

const ESCOPO_LANDING = [
  {
    icon: Sparkles,
    title: "Apresentação institucional",
    desc: "Catálogo de serviços e profissionais, com a identidade visual da Século XXI.",
  },
  {
    icon: Gift,
    title: "Planos de assinatura",
    desc: "Clube de benefícios com planos mensais para fidelização de clientes.",
  },
  {
    icon: Calendar,
    title: "Agendamento online",
    desc: "Integrado em tempo real com a agenda do painel administrativo.",
  },
  {
    icon: Banknote,
    title: "Pagamento online",
    desc: "Cliente paga a assinatura do plano ou o serviço (corte) direto no app, via Pix ou cartão.",
  },
];

const ESCOPO_PAINEL = [
  {
    icon: Calendar,
    title: "Agenda / Dashboard",
    desc: "Calendário de atendimentos com visão geral do dia.",
  },
  {
    icon: CreditCard,
    title: "Comandas",
    desc: "Abertura, fechamento e histórico, conectados ao banco de dados.",
  },
  {
    icon: Users,
    title: "Clientes",
    desc: "Cadastro e histórico completo de cada cliente.",
  },
  {
    icon: Tag,
    title: "Produtos e serviços",
    desc: "Cadastro de produtos e serviços oferecidos pela barbearia.",
  },
  {
    icon: UserCog,
    title: "Funcionários",
    desc: "Cadastro de profissionais com login individual.",
  },
  {
    icon: Building2,
    title: "Financeiro",
    desc: "Caixa diário, faturamento, despesas e comissões por profissional.",
  },
  {
    icon: Tag,
    title: "Cupons de desconto",
    desc: "Criação de campanhas e cupons promocionais.",
  },
  {
    icon: Palette,
    title: "Configurações",
    desc: "Temas visuais, imagem de fundo e atalhos de navegação.",
  },
  {
    icon: Database,
    title: "Importação AppBarber",
    desc: "Histórico de clientes migrado para o novo sistema.",
  },
];

const ESCOPO_INFRA = [
  {
    icon: ShieldCheck,
    title: "Autenticação segura",
    desc: "Login individual e protegido para administradores e funcionários.",
  },
  {
    icon: Server,
    title: "Hospedagem própria",
    desc: "Vercel, Firebase e Cloudflare R2, configurados em contas do CONTRATANTE.",
  },
];

const FORA_DO_ESCOPO = [
  "Aplicativo nativo para iOS ou Android",
  "Relatórios exportáveis em PDF ou Excel",
  "Integração com sistemas externos (ERPs, CRMs, plataformas de delivery)",
  "Criação de conteúdo (fotos profissionais, textos, vídeos)",
];

const NAO_INCLUSO = [
  "Custos de domínio próprio (caso o CONTRATANTE deseje um domínio personalizado)",
  "Custos de mensagens além dos limites gratuitos das plataformas utilizadas",
  "Produção de conteúdo (fotos profissionais, textos, vídeos)",
  "Taxas de gateway de pagamento (Pix, cartão) cobradas por transação, repassadas pelo provedor",
  "Funcionalidades não listadas no Anexo I, que poderão ser orçadas separadamente",
];

const SUPORTE_INCLUSO = [
  "Correção de bugs e falhas de funcionamento do Sistema",
  "Suporte para dúvidas sobre o uso do painel administrativo",
  "Atualizações de segurança necessárias",
  "Disponibilidade do Sistema acompanhada pelos CONTRATADOS",
];

const SUPORTE_NAO_INCLUSO = [
  "Desenvolvimento de novas funcionalidades fora do Anexo I",
  "Alterações no escopo original do Sistema",
  "Criação ou edição de conteúdo (textos, imagens, produtos, serviços)",
  "Problemas causados por alterações feitas pelo CONTRATANTE nas contas de infraestrutura",
];

const OUTRAS_DISPOSICOES = [
  {
    icon: FileText,
    title: "Alterações de escopo",
    desc: "Funcionalidades fora do Anexo I são tratadas como evolução do Sistema, com prazo e valor à parte.",
  },
  {
    icon: ShieldCheck,
    title: "Garantia e correções",
    desc: "Durante o suporte gratuito, bugs em funcionalidades do Anexo I são corrigidos sem custo adicional.",
  },
  {
    icon: ClipboardCheck,
    title: "Rescisão",
    desc: "Qualquer parte pode rescindir mediante notificação de 15 dias. Antes da entrega, valores pagos são tratados proporcionalmente ao trabalho realizado.",
  },
  {
    icon: Scale,
    title: "Disposições gerais",
    desc: "Este contrato substitui acordos verbais anteriores. Foro eleito: comarca de [CIDADE/UF].",
  },
];

const UNIT_OPTIONS = [
  {
    id: 1 as const,
    label: "OPÇÃO 1",
    title: "Apenas a nova unidade",
    desc: "Sistema completo para a nova unidade da Barbearia Século XXI, a ser inaugurada.",
    price: 1850,
    originalPrice: null as number | null,
    monthlySupport: 89.9,
    badge: null as string | null,
    highlight: null as string | null,
  },
  {
    id: 2 as const,
    label: "OPÇÃO 2",
    title: "Nova unidade + unidade atual",
    desc: "As duas unidades, cada uma com sua própria instância do Sistema — incluindo migração do histórico de clientes da unidade atual a partir do AppBarber.",
    price: 3000,
    originalPrice: 3350,
    monthlySupport: 129.9,
    badge: "OFERTA DE LANÇAMENTO",
    highlight: "Cada unidade sai por ~R$ 1.500 — sair fazendo as duas agora é mais barato do que contratar separado depois.",
  },
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ContratoPage() {
  const [selected, setSelected] = useState<1 | 2>(2);
  const option = UNIT_OPTIONS.find((o) => o.id === selected)!;
  const entrada = option.price / 2;
  const saldo = option.price / 2;

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#e2e2e2] antialiased overflow-x-hidden selection:bg-[#c8ccd4] selection:text-black">
      {/* Background ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020202] via-[#080808] to-[#020202]" />
        <div className="absolute top-[-10%] right-[-15%] w-[700px] h-[700px] bg-[rgba(200,204,212,0.05)] rounded-full blur-[140px] hidden md:block" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-[rgba(200,204,212,0.04)] rounded-full blur-[130px] hidden md:block" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-4 md:px-8 pt-20 pb-12 sm:pt-28 sm:pb-16 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 font-sans text-[9px] text-[#c8ccd4] uppercase tracking-[0.35em] font-bold bg-[rgba(200,204,212,0.05)] border border-[rgba(200,204,212,0.1)] px-4 py-1.5 rounded-full mb-6"
        >
          <span className="inline-block w-1.5 h-1.5 bg-[#c8ccd4] rounded-full" />
          CONTRATO · BARBEARIA SÉCULO XXI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-light text-3xl sm:text-5xl text-zinc-100 tracking-wide leading-[1.2] mb-6"
        >
          Prestação de serviços <br className="sm:hidden" />
          <span className="text-[#c8ccd4] font-serif italic">de desenvolvimento e uso do Sistema</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="font-sans text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
        >
          Este documento resume, de forma visual, os termos do contrato entre os
          CONTRATADOS (Vitor e Abraão) e o CONTRATANTE (Renato, Barbearia Século XXI).
          Para assinar, use a versão para impressão.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/proposta/contrato/imprimir"
            className="h-12 bg-linear-to-r from-[#eef1f5] to-[#c8ccd4] text-slate-950 font-sans text-[11px] font-black tracking-[0.15em] px-8 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(200, 204, 212,0.3)] hover:scale-[1.02] transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            VERSÃO PARA IMPRIMIR E ASSINAR
          </Link>
          <Link
            href="/proposta"
            className="h-12 bg-transparent text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 font-sans text-[11px] font-bold tracking-[0.15em] px-8 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            VOLTAR À PROPOSTA
          </Link>
        </motion.div>
      </section>

      {/* PARTES */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-5xl mx-auto">
        <SectionHeader tag="CLÁUSULA 1 · PARTES" title="Quem assina este contrato" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-6"
          >
            <span className="font-mono text-[9px] text-[#c8ccd4] uppercase tracking-[0.25em] font-bold">
              CONTRATADOS
            </span>
            <ul className="mt-3 space-y-3 font-sans text-sm text-zinc-300">
              <li>
                <strong className="text-zinc-100">Vitor Felipe Faria Pascoal de Oliveira</strong>
                <br />
                <span className="text-zinc-500 text-xs">CPF [___.___.___-__] · Cruzeiro/SP</span>
              </li>
              <li>
                <strong className="text-zinc-100">Abraão Lincon de Almeida Cardoso</strong>
                <br />
                <span className="text-zinc-500 text-xs">CPF [___.___.___-__] · Cruzeiro/SP</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(200,204,212,0.2)] rounded-2xl p-6"
          >
            <span className="font-mono text-[9px] text-[#c8ccd4] uppercase tracking-[0.25em] font-bold">
              CONTRATANTE
            </span>
            <ul className="mt-3 space-y-3 font-sans text-sm text-zinc-300">
              <li>
                <strong className="text-zinc-100">[NOME COMPLETO DO RENATO]</strong>
                <br />
                <span className="text-zinc-500 text-xs">
                  CPF [___.___.___-__] · Proprietário da Barbearia Século XXI
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
        <p className="font-sans text-zinc-500 text-xs mt-4 leading-relaxed">
          O objeto deste contrato é o desenvolvimento, customização, implantação e suporte
          de um sistema de gestão digital para barbearia (&quot;Sistema&quot;), composto por
          landing page e painel administrativo, conforme escopo do Anexo I.
        </p>
      </section>

      {/* UNIDADES CONTEMPLADAS */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-5xl mx-auto">
        <SectionHeader
          tag="CLÁUSULA 3 · ANEXO II"
          title={
            <>
              Escolha a opção <span className="text-[#c8ccd4] font-serif italic">que faz sentido pra você</span>
            </>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {UNIT_OPTIONS.map((opt) => (
            <UnitOptionCard
              key={opt.id}
              opt={opt}
              selected={selected === opt.id}
              onSelect={() => setSelected(opt.id)}
            />
          ))}
        </div>
        <p className="font-sans text-zinc-500 text-xs mt-4 italic">
          A opção marcada acima já atualiza o valor da cláusula 5 (Investimento) abaixo —
          selecione a alternativa que vai assinar.
        </p>
      </section>

      {/* ESCOPO */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-6xl mx-auto">
        <SectionHeader tag="CLÁUSULA 4 · ANEXO I" title="Escopo do Sistema" />

        <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-3">
          Landing page / área do cliente
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ESCOPO_LANDING.map((item, i) => (
            <FeatureCard key={item.title} item={item} index={i} />
          ))}
        </div>

        <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-3">
          Painel administrativo
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ESCOPO_PAINEL.map((item, i) => (
            <FeatureCard key={item.title} item={item} index={i} />
          ))}
        </div>

        <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-3">
          Infraestrutura
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ESCOPO_INFRA.map((item, i) => (
            <FeatureCard key={item.title} item={item} index={i} />
          ))}
        </div>

        {/* FORA DO ESCOPO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="bg-[rgba(239,68,68,0.05)] backdrop-blur-xl border border-[rgba(239,68,68,0.2)] rounded-2xl p-6 sm:p-7"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="font-mono text-[9px] text-red-300 uppercase tracking-[0.25em] font-bold">
              FORA DO ESCOPO DESTE CONTRATO
            </span>
          </div>
          <ul className="space-y-2.5 font-sans text-sm text-zinc-300">
            {FORA_DO_ESCOPO.map((text) => (
              <li key={text} className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-[rgba(248,113,113,0.7)]" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <p className="font-sans text-xs text-zinc-500 mt-4 leading-relaxed">
            Qualquer item acima pode ser desenvolvido como evolução do Sistema, com novo
            orçamento e prazo combinados separadamente (cláusula 12).
          </p>
        </motion.div>
      </section>

      {/* BÔNUS WHATSAPP */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-5xl mx-auto">
        <SectionHeader tag="CLÁUSULA 9 · BÔNUS" title="Automação via WhatsApp" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(200,204,212,0.2)] rounded-3xl p-8 sm:p-10 overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[rgba(200,204,212,0.1)] rounded-full blur-[80px]" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(200,204,212,0.1)] border border-[rgba(200,204,212,0.3)] flex items-center justify-center shrink-0">
                <MessageCircle className="w-7 h-7 text-[#c8ccd4]" />
              </div>
              <div>
                <h3 className="font-display font-light text-2xl sm:text-3xl text-zinc-100 mb-3">
                  Confirmação e lembrete automáticos
                </h3>
                <p className="font-sans text-sm text-zinc-400 leading-relaxed max-w-2xl">
                  Seus clientes recebem automaticamente uma{" "}
                  <strong className="text-zinc-200">confirmação ao agendar</strong> e um{" "}
                  <strong className="text-zinc-200">lembrete 1 hora antes</strong> do
                  horário, direto pelo número de WhatsApp da barbearia.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 mb-3">
              <Info className="w-4 h-4 text-[#c8ccd4]" />
              <span className="font-mono text-[9px] text-[#c8ccd4] uppercase tracking-[0.25em] font-bold">
                COMO VAMOS IMPLEMENTAR — TRANSPARÊNCIA TOTAL
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-display font-medium text-sm text-zinc-100">
                    API oficial do WhatsApp Business
                  </h4>
                </div>
                <p className="font-sans text-[12px] text-zinc-450 leading-relaxed">
                  Conexão homologada pela Meta, mais estável e profissional. Pode envolver
                  custo por conversa caso o volume de mensagens ultrapasse a faixa
                  gratuita — repassado ao CONTRATANTE conforme cláusula 7.3.
                </p>
              </div>
              <div className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Smartphone className="w-4 h-4 text-[#c8ccd4]" />
                  <h4 className="font-display font-medium text-sm text-zinc-100">
                    Conexão pelo número da barbearia
                  </h4>
                </div>
                <p className="font-sans text-[12px] text-zinc-450 leading-relaxed">
                  Automação ligada ao WhatsApp já usado pela barbearia, sem custo extra.
                  Por não ser um canal oficial da Meta, pode sofrer instabilidades ou
                  bloqueios pontuais (cláusula 9.3).
                </p>
              </div>
            </div>
            <p className="font-sans text-xs text-zinc-500 mt-4 leading-relaxed">
              Os CONTRATADOS avaliarão qual opção atende melhor o CONTRATANTE no momento
              da implantação e vão explicar os trade-offs antes de configurar — sem letra
              miúda.
            </p>
          </div>
        </motion.div>
      </section>

      {/* INVESTIMENTO */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-5xl mx-auto">
        <SectionHeader tag="CLÁUSULA 5 · ANEXO II" title="Investimento e forma de pagamento" />
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border-2 border-[rgba(200,204,212,0.4)] rounded-3xl p-7 sm:p-8 shadow-[0_0_40px_rgba(200, 204, 212,0.1)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(200,204,212,0.1)] border border-[rgba(200,204,212,0.2)] flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-[#c8ccd4]" />
              </div>
              <div>
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.25em] font-bold">
                  VALOR TOTAL · {option.label}
                </span>
                <p className="font-display text-2xl text-zinc-100 font-light">
                  R$ {formatBRL(option.price)}
                </p>
              </div>
            </div>
            {option.originalPrice && (
              <div className="flex items-center gap-2 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-full px-3 py-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-sans text-[11px] text-emerald-300">
                  de <span className="line-through">R$ {formatBRL(option.originalPrice)}</span> por R$ {formatBRL(option.price)}
                </span>
              </div>
            )}
          </div>
          <ul className="space-y-3 font-sans text-sm text-zinc-300 mb-4">
            <BenefitRow text={`Entrada (sinal) de R$ ${formatBRL(entrada)}, paga na assinatura deste contrato`} />
            <BenefitRow text={`Saldo de R$ ${formatBRL(saldo)}, pago na entrega/ativação do Sistema em produção`} />
          </ul>
          {option.highlight && (
            <div className="flex items-start gap-2.5 bg-[rgba(200,204,212,0.05)] border border-[rgba(200,204,212,0.15)] rounded-xl p-3.5 mb-4">
              <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-[#c8ccd4]" />
              <p className="font-sans text-xs text-zinc-300 leading-relaxed">{option.highlight}</p>
            </div>
          )}
          <p className="font-sans text-xs text-zinc-500 leading-relaxed">
            O valor refere-se exclusivamente ao desenvolvimento e implantação. Custos de
            infraestrutura e eventual mensalidade de suporte pós-garantia são tratados em
            cláusulas próprias.
          </p>
        </motion.div>
      </section>

      {/* PRAZO DE ENTREGA */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-5xl mx-auto">
        <SectionHeader tag="CLÁUSULA 6" title="Prazo de entrega" />
        <div className="space-y-3">
          <TimelineStep
            icon={Clock}
            title="25 dias corridos para entrega"
            desc="A partir da assinatura, com previsão de conclusão até 10/07/2026 — antes da inauguração da nova unidade, prevista para 15/07/2026."
          />
          <TimelineStep
            icon={FileText}
            title="Dependência de materiais do CONTRATANTE"
            desc="Caso a entrega dependa de informações, fotos, textos ou dados para importação, o prazo é prorrogado proporcionalmente ao atraso."
          />
          <TimelineStep
            icon={CheckCircle2}
            title="Sistema em produção = entregue"
            desc="Considera-se entregue o Sistema disponível em produção (acessível via internet) e funcional conforme o Anexo I."
          />
          <TimelineStep
            icon={ClipboardCheck}
            title="3 dias úteis para aprovação"
            desc="Após a entrega, o CONTRATANTE tem 3 dias úteis para aprovar ou solicitar ajustes dentro do escopo. Sem manifestação, o Sistema é considerado aprovado e o saldo se torna devido."
          />
        </div>
      </section>

      {/* INFRAESTRUTURA */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-5xl mx-auto">
        <SectionHeader tag="CLÁUSULA 7" title="Infraestrutura e contas de serviço" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 sm:p-7"
        >
          <ul className="space-y-3 font-sans text-sm text-zinc-300">
            <BenefitRow text="Vercel, Firebase e Cloudflare R2 são criados em nome e sob titularidade do CONTRATANTE" />
            <BenefitRow text="Os CONTRATADOS atuam como colaboradores/administradores técnicos, sem deter a titularidade" />
            <BenefitRow text="Custos que ultrapassarem os planos gratuitos são de responsabilidade exclusiva do CONTRATANTE" />
          </ul>
        </motion.div>
      </section>

      {/* SUPORTE E MANUTENÇÃO */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-5xl mx-auto">
        <SectionHeader tag="CLÁUSULA 8" title="Suporte e manutenção" />

        {/* Primeiros 12 meses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 mb-4"
        >
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.25em] font-bold">
            PRIMEIROS 12 MESES — INCLUSO NO VALOR DA CLÁUSULA 5
          </span>
          <h3 className="font-display font-light text-xl text-zinc-100 mt-2 mb-1">
            Suporte totalmente gratuito
          </h3>
          <p className="font-sans text-sm text-zinc-400 leading-relaxed">
            Correções, ajustes pontuais e atualizações de segurança, sem custo, contados a
            partir da entrega.
          </p>
        </motion.div>

        {/* O que está / não está incluído */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="bg-[rgba(16,185,129,0.05)] backdrop-blur-xl border border-[rgba(16,185,129,0.2)] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-[9px] text-emerald-300 uppercase tracking-[0.25em] font-bold">
                O QUE ESTÁ INCLUÍDO NO SUPORTE
              </span>
            </div>
            <ul className="space-y-2.5 font-sans text-sm text-zinc-300">
              {SUPORTE_INCLUSO.map((text) => (
                <li key={text} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-[rgba(239,68,68,0.05)] backdrop-blur-xl border border-[rgba(239,68,68,0.2)] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="font-mono text-[9px] text-red-300 uppercase tracking-[0.25em] font-bold">
                O QUE NÃO ESTÁ INCLUÍDO NO SUPORTE
              </span>
            </div>
            <ul className="space-y-2.5 font-sans text-sm text-zinc-300">
              {SUPORTE_NAO_INCLUSO.map((text) => (
                <li key={text} className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Após 12 meses - valores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border-2 border-[rgba(200,204,212,0.4)] rounded-2xl p-6 sm:p-7"
        >
          <span className="font-mono text-[9px] text-[#c8ccd4] uppercase tracking-[0.25em] font-bold">
            APÓS 12 MESES — CONTINUAR COM SUPORTE (OPCIONAL)
          </span>
          <h3 className="font-display font-light text-xl text-zinc-100 mt-2 mb-4">
            Mensalidade de manutenção
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div
              className={`rounded-xl p-4 border transition-colors ${
                selected === 2
                  ? "border-[rgba(200,204,212,0.5)] bg-[rgba(200,204,212,0.05)]"
                  : "border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]"
              }`}
            >
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-sans text-[#c8ccd4] text-sm">R$</span>
                <span className="font-display text-3xl text-[#c8ccd4] font-light">129,90</span>
                <span className="font-sans text-zinc-500 text-sm">/mês</span>
              </div>
              <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                Valor promocional cobrindo o suporte das <strong className="text-zinc-200">duas unidades</strong>{" "}
                (Opção 2) — bem abaixo de pagar duas mensalidades separadas.
              </p>
            </div>
            <div
              className={`rounded-xl p-4 border transition-colors ${
                selected === 1
                  ? "border-[rgba(200,204,212,0.5)] bg-[rgba(200,204,212,0.05)]"
                  : "border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)]"
              }`}
            >
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-sans text-zinc-300 text-sm">R$</span>
                <span className="font-display text-3xl text-zinc-200 font-light">89,90</span>
                <span className="font-sans text-zinc-500 text-sm">/mês</span>
              </div>
              <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                Valor para suporte de <strong className="text-zinc-200">apenas 1 unidade</strong> (Opção 1).
              </p>
            </div>
          </div>
          <p className="font-sans text-sm text-zinc-400 leading-relaxed">
            Sem fidelidade — cancele quando quiser. Sem renovar, o Sistema continua
            funcionando e é 100% do CONTRATANTE, mas sem atualizações nem suporte.
            Inadimplência acima de 30 dias suspende o suporte até a regularização
            (cláusula 8.5), sem afetar o funcionamento do Sistema.
          </p>
        </motion.div>
      </section>

      {/* PROPRIEDADE INTELECTUAL */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-5xl mx-auto">
        <SectionHeader tag="CLÁUSULA 10" title="Propriedade intelectual" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 sm:p-7"
        >
          <ul className="space-y-3 font-sans text-sm text-zinc-300">
            <BenefitRow text="Após o pagamento integral, o CONTRATANTE é proprietário da instância do Sistema, dados, identidade visual e conteúdo" />
            <BenefitRow text="Os CONTRATADOS podem reaproveitar a base tecnológica e o código genérico em outros projetos, sem reutilizar a identidade visual ou dados do CONTRATANTE" />
          </ul>
        </motion.div>
      </section>

      {/* O QUE NÃO ESTÁ INCLUSO (CUSTOS) */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-5xl mx-auto">
        <SectionHeader tag="CLÁUSULA 11" title="Custos não inclusos no valor da cláusula 5" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="bg-[rgba(239,68,68,0.05)] backdrop-blur-xl border border-[rgba(239,68,68,0.2)] rounded-2xl p-6 sm:p-7"
        >
          <ul className="space-y-3 font-sans text-sm text-zinc-300">
            {NAO_INCLUSO.map((text) => (
              <li key={text} className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* OUTRAS DISPOSIÇÕES */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-12 max-w-6xl mx-auto">
        <SectionHeader tag="CLÁUSULAS 12 A 15" title="Outras disposições" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OUTRAS_DISPOSICOES.map((item, i) => (
            <FeatureCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* ASSINATURAS */}
      <section className="relative z-10 px-4 md:px-8 py-10 sm:py-16 max-w-5xl mx-auto">
        <SectionHeader tag="ASSINATURAS" title="Aceite das partes" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 sm:p-8"
        >
          <p className="font-sans text-sm text-zinc-400 leading-relaxed mb-6">
            Por estarem de acordo, as partes assinam este instrumento em 2 (duas) vias de
            igual teor, em <strong className="text-zinc-200">[CIDADE]</strong>,{" "}
            <strong className="text-zinc-200">[DATA]</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SignatureCard name="Vitor Felipe Faria Pascoal de Oliveira" role="CONTRATADO" />
            <SignatureCard name="Abraão Lincon de Almeida Cardoso" role="CONTRATADO" />
            <SignatureCard name="[NOME DO RENATO]" role="CONTRATANTE" />
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/proposta/contrato/imprimir"
              className="inline-flex items-center gap-2 h-12 bg-linear-to-r from-[#eef1f5] to-[#c8ccd4] text-slate-950 font-sans text-[11px] font-black tracking-[0.15em] px-8 rounded-xl shadow-[0_0_20px_rgba(200, 204, 212,0.3)] hover:scale-[1.02] transition-all"
            >
              <FileSignature className="w-3.5 h-3.5" />
              ABRIR VERSÃO PARA IMPRIMIR
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.05)] mt-4 py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#c8ccd4] text-black rounded-full flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-light text-zinc-100 tracking-[0.16em] uppercase text-sm">
              SÉCULO <span className="text-[#c8ccd4] font-serif italic">XXI</span>
            </span>
          </div>
          <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
            Documento de referência · não substitui a versão assinada
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
      className="mb-6 text-center sm:text-left"
    >
      <span className="font-mono text-[9px] text-[rgba(200,204,212,0.7)] uppercase tracking-[0.25em] font-bold">
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
}: {
  item: { icon: React.ElementType; title: string; desc: string };
  index: number;
}) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] hover:border-[rgba(200,204,212,0.3)] rounded-2xl p-5 flex flex-col gap-3 transition-colors"
    >
      <div className="w-9 h-9 rounded-xl bg-[rgba(200,204,212,0.1)] border border-[rgba(200,204,212,0.2)] flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-[#c8ccd4]" />
      </div>
      <h4 className="font-display font-medium text-sm text-zinc-100 leading-snug">
        {item.title}
      </h4>
      <p className="font-sans text-[12px] text-zinc-450 leading-relaxed">{item.desc}</p>
    </motion.div>
  );
}

function BenefitRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
      <span>{text}</span>
    </li>
  );
}

function UnitOptionCard({
  opt,
  selected,
  onSelect,
}: {
  opt: (typeof UNIT_OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.5 }}
      className={`relative text-left bg-[rgba(255,255,255,0.05)] backdrop-blur-xl rounded-2xl p-6 flex gap-4 transition-all ${
        selected
          ? "border-2 border-[rgba(200,204,212,0.6)] shadow-[0_0_30px_rgba(200, 204, 212,0.12)]"
          : "border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
      }`}
    >
      {opt.badge && (
        <span className="absolute -top-3 right-6 bg-linear-to-r from-[#eef1f5] to-[#c8ccd4] text-slate-950 font-sans text-[9px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full shadow-lg">
          {opt.badge}
        </span>
      )}
      <div
        className={`w-5 h-5 mt-1 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
          selected ? "bg-[#c8ccd4] border-[#c8ccd4]" : "border-zinc-600"
        }`}
      >
        {selected && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
      </div>
      <div className="flex-1">
        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.25em] font-bold">
          {opt.label}
        </span>
        <h3 className="font-display font-light text-lg text-zinc-100 mt-1 mb-2">{opt.title}</h3>
        <p className="font-sans text-sm text-zinc-400 leading-relaxed mb-3">{opt.desc}</p>
        <div className="flex items-baseline gap-2">
          {opt.originalPrice && (
            <span className="font-sans text-zinc-600 text-sm line-through">
              R$ {formatBRL(opt.originalPrice)}
            </span>
          )}
          <span className={`font-display text-2xl font-light ${selected ? "text-[#c8ccd4]" : "text-zinc-200"}`}>
            R$ {formatBRL(opt.price)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function TimelineStep({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
      className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-5 flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-[rgba(200,204,212,0.1)] border border-[rgba(200,204,212,0.2)] flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-[#c8ccd4]" />
      </div>
      <div>
        <h4 className="font-display font-medium text-sm text-zinc-100 mb-1">{title}</h4>
        <p className="font-sans text-[12px] text-zinc-450 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function SignatureCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 text-center">
      <div className="border-t border-zinc-600 w-full mb-3 mt-8" />
      <p className="font-sans text-sm text-zinc-200 font-medium">{name}</p>
      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.2em]">
        {role}
      </span>
    </div>
  );
}
