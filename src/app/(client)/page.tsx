"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Clock, Check, ArrowRight } from 'lucide-react';
// O lucide-react v1 deixou de exportar ícones de marca; o Instagram vem do
// react-icons, que já é dependência do projeto.
import { FaInstagram } from 'react-icons/fa';
import Header from '@/components/(client)/Header';
import Reveal from '@/components/(client)/Reveal';
import BookingForm from '@/components/(client)/BookingForm';
import PlanCheckout, { type PlanSummary } from '@/components/(client)/PlanCheckout';
import Toast from '@/components/(client)/Toast';
import Monogram from '@/components/brand/Monogram';
import Lockup from '@/components/brand/Lockup';
import { SERVICES } from '@/lib/data';

/**
 * Landing da Barbearia Século 21.
 *
 * Ritmo de fundos (preto → grafite → preto → amarelo → grafite → preto), que é
 * o que o Renato pediu com "cinza, amarelo e preto, digo nos fundos e tal" e o
 * que o feed do Instagram da marca já faz. O amarelo entra inteiro uma única
 * vez, na seção do clube — é o ponto de maior atenção comercial da página.
 *
 * Compatibilidade: nada aqui usa modificador de opacidade do Tailwind
 * (`bg-branco/10`), porque no Tailwind 4 isso vira `color-mix()`, que o Safari
 * do iPhone 7 não entende — e uma declaração inválida é descartada inteira,
 * deixando o elemento sem fundo. Transparência aqui é rgba() literal.
 * Ver docs/compatibilidade.md.
 */

const PLANOS = [
  {
    id: 'ouro',
    nome: 'Ouro',
    preco: 140,
    chamada: 'Para quem corta a cada 15 dias.',
    beneficios: [
      '2 cortes por mês',
      'Lavagem com massagem relaxante',
      'Barbeiro à sua escolha',
      'Cancela quando quiser, sem multa',
    ],
    destaque: false,
  },
  {
    id: 'platina',
    nome: 'Platina',
    preco: 240,
    chamada: 'O plano mais procurado da casa.',
    beneficios: [
      'Cortes de cabelo sem limite',
      'Barba alinhada toda semana',
      'Lavagem com massagem relaxante',
      'Cancela quando quiser, sem multa',
    ],
    destaque: true,
  },
  {
    id: 'diamante',
    nome: 'Diamante',
    preco: 360,
    chamada: 'Tudo liberado, sempre.',
    beneficios: [
      'Corte e barba sem limite',
      'Hidratação capilar inclusa',
      'Prioridade na agenda',
      'Cancela quando quiser, sem multa',
    ],
    destaque: false,
  },
];

const CORTES = [
  { src: '/cortes/midfade-liso.webp', alt: 'Corte mid fade em cabelo liso, feito na Século 21' },
  { src: '/cortes/midfade-afro.webp', alt: 'Corte mid fade em cabelo afro, feito na Século 21' },
  { src: '/cortes/americano-liso.webp', alt: 'Corte americano em cabelo liso, feito na Século 21' },
  { src: '/cortes/americano-afro.webp', alt: 'Corte americano em cabelo afro, feito na Século 21' },
];

// Ambiente real da barbearia — imagens do manual da marca.
const AMBIENTE = [
  { src: '/img/marca/interior1.webp', alt: 'Salão da barbearia com cadeiras e espelhos' },
  { src: '/img/marca/interior2.webp', alt: 'Estações de corte com iluminação embutida' },
  { src: '/img/marca/interior4.webp', alt: 'Espaço de espera com arcade e área para crianças' },
  { src: '/img/marca/barbeiro.webp', alt: 'Barbeiro da Século 21 pronto para o atendimento' },
];

const ENDERECO = {
  rua: 'R. Dr. José Rodrigues Alves Sobrinho, 351',
  bairro: 'Vila Paulo Romeu',
  cidade: 'Cruzeiro — SP',
  telefone: '(12) 99655-5081',
  telefoneRaw: '5512996555081',
};

// Mapa sem chave de API: o embed público do Google aceita a busca por endereço.
const MAPS_QUERY = encodeURIComponent(
  `Barbearia Século XXI, ${ENDERECO.rua}, ${ENDERECO.bairro}, ${ENDERECO.cidade}`,
);
const EMBED_SRC = `https://www.google.com/maps?q=${MAPS_QUERY}&z=16&output=embed`;
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  // Algum overlay/checkout aberto? A barra fixa recua para não tapá-lo.
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  // Plano escolhido no clube — abre a tela de assinatura.
  const [planoEmCheckout, setPlanoEmCheckout] = useState<PlanSummary | null>(null);

  const abrirAgendamento = (serviceId?: string) => {
    if (serviceId) {
      window.dispatchEvent(new CustomEvent('select-service', { detail: serviceId }));
    }
    setIsBookingOpen(true);
  };

  // Outros componentes pedem a abertura do agendamento por evento.
  useEffect(() => {
    const abrir = () => setIsBookingOpen(true);
    window.addEventListener('select-service', abrir);
    return () => window.removeEventListener('select-service', abrir);
  }, []);

  useEffect(() => {
    const handleOverlay = (e: Event) => setIsOverlayOpen(Boolean((e as CustomEvent).detail));
    window.addEventListener('overlay-open', handleOverlay);
    return () => window.removeEventListener('overlay-open', handleOverlay);
  }, []);

  // A barra fixa só aparece depois que o CTA do hero sai de vista.
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setShowStickyCTA(window.scrollY > 520);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stickyVisivel =
    showStickyCTA && !isBookingOpen && !isOverlayOpen && !planoEmCheckout;

  return (
    <div className="relative min-h-screen bg-xxi-ink text-xxi-white overflow-x-hidden" id="main-layout">
      <a
        href="#agendar"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-xxi-yellow focus:text-black focus:px-4 focus:py-3 focus:font-semibold"
      >
        Pular para o agendamento
      </a>

      <Header />

      {/* ================= HERO ================= */}
      <section
        className="relative isolate overflow-hidden bg-xxi-ink px-5 pt-28 pb-16 sm:pt-32 sm:px-8 md:pt-36 md:pb-24"
        id="hero"
      >
        {/* Composição centrada: é simétrica por construção, então se comporta
            igual em qualquer largura — de 320px a ultrawide — sem depender de
            um breakpoint acertar. Nada de arte atrás do título: o lettering é
            o assunto do hero e não divide atenção com marca d'água. */}
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="xxi-eyebrow" id="hero-eyebrow">
            Cruzeiro · SP
          </p>

          {/* Linhas curtas empilhadas, a do meio vazada em contorno — o recurso
              de lettering do manual (p. 20). Cada linha é um bloco, então
              nenhuma quebra sozinha em largura nenhuma. */}
          <h1 className="xxi-title xxi-title-hero mt-5">
            <span className="xxi-relevo xxi-relevo-claro block">Hora</span>
            <span className="xxi-outline block">Marcada.</span>
            <span className="xxi-relevo block text-xxi-yellow">Sem fila.</span>
          </h1>

          <p className="xxi-prose mt-6 text-balance text-base sm:text-lg">
            Escolha o serviço, o barbeiro e o horário que te atende. Leva menos de
            um minuto e você já sai com o horário confirmado.
          </p>

          <div className="mt-9 flex w-full flex-col justify-center gap-3 xs:w-auto xs:flex-row">
            <button
              type="button"
              onClick={() => abrirAgendamento()}
              className="xxi-btn xxi-btn-primary"
            >
              Agendar agora
              <ArrowRight className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
            </button>
            <a href="#servicos" className="xxi-btn xxi-btn-ghost">
              Serviços e preços
            </a>
          </div>

          {/* Os três fatos que respondem "vale a pena?" antes de rolar. Grid de
              colunas iguais: alinha sozinho em qualquer largura. */}
          <dl className="mt-12 grid w-full grid-cols-3 gap-4 border-t border-xxi-line pt-6 text-center">
            <div>
              <dt className="text-xs text-xxi-mute sm:text-sm">Atendimento</dt>
              <dd className="mt-1 text-sm font-semibold sm:text-base">Hora marcada</dd>
            </div>
            <div className="border-x border-xxi-line">
              <dt className="text-xs text-xxi-mute sm:text-sm">Onde</dt>
              <dd className="mt-1 text-sm font-semibold sm:text-base">Cruzeiro</dd>
            </div>
            <div>
              <dt className="text-xs text-xxi-mute sm:text-sm">A partir de</dt>
              <dd className="xxi-nums mt-1 text-sm font-semibold sm:text-base">{brl(70)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ================= SERVIÇOS ================= */}
      <section className="bg-xxi-graphite px-5 py-16 sm:px-8 sm:py-20 md:py-24" id="servicos">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="xxi-eyebrow">O que fazemos</p>
            <h2 className="xxi-title xxi-title-lg mt-3">Serviços e preços</h2>
            <p className="xxi-prose mt-4">
              Preço fechado, sem surpresa no caixa. O tempo indicado é o que a
              cadeira fica reservada para você.
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 60}>
                <div className="xxi-card-hi flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="xxi-title xxi-title-md">{s.name}</h3>
                    <Monogram className="mt-1 h-4 w-4 shrink-0 text-xxi-yellow" />
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-xxi-mute">
                    {s.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-xxi-line pt-4">
                    <span className="xxi-nums flex items-center gap-1.5 text-sm text-xxi-mute">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {s.duration} min
                    </span>
                    <span className="xxi-nums text-xl font-bold text-xxi-yellow">
                      {brl(s.price)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirAgendamento(s.id)}
                    className="xxi-btn xxi-btn-ghost mt-4 w-full"
                  >
                    Agendar
                  </button>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= CORTES (prova social) ================= */}
      <section className="bg-xxi-ink px-5 py-16 sm:px-8 sm:py-20 md:py-24" id="cortes">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="xxi-eyebrow">Feito na cadeira</p>
            <h2 className="xxi-title xxi-title-lg mt-3">Cortes da casa</h2>
          </Reveal>

          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {CORTES.map((c, i) => (
              <Reveal as="li" key={c.src} delay={i * 60}>
                <figure className="overflow-hidden border border-xxi-line bg-xxi-graphite">
                  <Image
                    src={c.src}
                    alt={c.alt}
                    width={420}
                    height={560}
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="h-full w-full object-cover"
                  />
                </figure>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={120}>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => abrirAgendamento()}
                className="xxi-btn xxi-btn-primary"
              >
                Quero o meu
                <ArrowRight className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= A CASA (equipe + ambiente) ================= */}
      <section className="bg-xxi-graphite px-5 py-16 sm:px-8 sm:py-20 md:py-24" id="a-casa">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="xxi-eyebrow">A casa</p>
            <h2 className="xxi-title xxi-title-lg mt-3">Quem te atende</h2>
            <p className="xxi-prose mt-4">
              Time formado, uniforme fechado e cadeira preparada. Você escolhe com
              quem quer cortar na hora de agendar.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <figure className="mt-8 overflow-hidden border border-xxi-line">
              <Image
                src="/img/marca/equipe.webp"
                alt="Os barbeiros e a equipe da Barbearia Século 21, de uniforme preto e amarelo"
                width={1600}
                height={900}
                loading="lazy"
                sizes="(max-width: 1120px) 100vw, 1120px"
                className="h-full w-full object-cover"
              />
            </figure>
          </Reveal>

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {AMBIENTE.map((a, i) => (
              <Reveal as="li" key={a.src} delay={i * 60}>
                <figure className="h-full overflow-hidden border border-xxi-line">
                  <Image
                    src={a.src}
                    alt={a.alt}
                    width={700}
                    height={394}
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="h-full w-full object-cover"
                  />
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= CLUBE (a virada para o amarelo) ================= */}
      <section className="bg-xxi-yellow px-5 py-16 text-black sm:px-8 sm:py-20 md:py-24" id="assinaturas">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            {/* Sobre amarelo, texto é preto — branco aqui daria 1.6:1 e reprovaria. */}
            <p className="xxi-eyebrow" style={{ color: '#000000' }}>
              Clube Século 21
            </p>
            <h2 className="xxi-title xxi-title-lg mt-3">Assine e economize</h2>
            <p className="xxi-prose mt-4" style={{ color: 'rgba(0,0,0,0.72)' }}>
              Quem corta todo mês paga menos assinando. Sem fidelidade: você cancela
              quando quiser, sem multa.
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {PLANOS.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 70}>
                <div
                  className="flex h-full flex-col border-2 border-black bg-black p-6 text-xxi-white"
                  style={p.destaque ? { boxShadow: '0 6px 0 rgba(0,0,0,0.45)' } : undefined}
                >
                  {/* Faixa em linha própria, com altura reservada nos três
                      cards para os títulos ficarem alinhados. Ao lado do
                      título ela não cabia: "PLATINA" em Boldonse já ocupa a
                      largura do card sozinho. */}
                  <div className="mb-3 h-6">
                    {p.destaque && (
                      <span className="inline-block bg-xxi-yellow px-2 py-1 text-[11px] font-black uppercase leading-none tracking-wider text-black">
                        Mais assinado
                      </span>
                    )}
                  </div>
                  <h3 className="xxi-title xxi-title-lg text-xxi-yellow">{p.nome}</h3>

                  <p className="mt-2 text-sm text-xxi-mute">{p.chamada}</p>

                  <p className="xxi-nums mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{brl(p.preco)}</span>
                    <span className="text-sm text-xxi-mute">/mês</span>
                  </p>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {p.beneficios.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-xxi-yellow" aria-hidden="true" />
                        <span className="text-xxi-white">{b}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() =>
                      setPlanoEmCheckout({
                        id: p.id,
                        name: `Plano ${p.nome}`,
                        price: p.preco,
                        period: 'mês',
                        tagline: p.chamada,
                        benefits: p.beneficios,
                      })
                    }
                    className="xxi-btn xxi-btn-primary mt-6 w-full"
                  >
                    Assinar {p.nome}
                  </button>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= ONDE ESTAMOS ================= */}
      <section className="bg-xxi-ink px-5 py-16 sm:px-8 sm:py-20 md:py-24" id="localizacao">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="xxi-eyebrow">Onde estamos</p>
            <h2 className="xxi-title xxi-title-lg mt-3">Vem pra cá</h2>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2 md:items-stretch">
            {/* A fachada é o que faz a pessoa reconhecer a loja na rua — vale
                mais que o mapa como primeira imagem. */}
            <Reveal>
              <figure className="h-full overflow-hidden border border-xxi-line">
                <Image
                  src="/img/marca/fachada.webp"
                  alt="Fachada da Barbearia Século 21, em preto e amarelo, na Vila Paulo Romeu"
                  width={1400}
                  height={788}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="h-full w-full object-cover"
                />
              </figure>
            </Reveal>

            <Reveal delay={80}>
              <div className="xxi-card flex h-full flex-col p-6">
                <ul className="space-y-5">
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-xxi-yellow" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">{ENDERECO.rua}</p>
                      <p className="text-sm text-xxi-mute">
                        {ENDERECO.bairro}, {ENDERECO.cidade}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-xxi-yellow" aria-hidden="true" />
                    <div>
                      <a
                        href={`tel:+55${ENDERECO.telefoneRaw.slice(2)}`}
                        className="xxi-nums font-semibold underline-offset-4 hover:underline"
                      >
                        {ENDERECO.telefone}
                      </a>
                      <p className="text-sm text-xxi-mute">Também no WhatsApp</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-xxi-yellow" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Segunda a sábado</p>
                      <p className="xxi-nums text-sm text-xxi-mute">
                        08h30 às 21h · domingo fechado
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="mt-auto flex flex-col gap-3 pt-6 xs:flex-row">
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="xxi-btn xxi-btn-primary flex-1"
                  >
                    Traçar rota
                  </a>
                  <a
                    href={`https://wa.me/${ENDERECO.telefoneRaw}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="xxi-btn xxi-btn-ghost flex-1"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Mapa real, carregado preguiçosamente: é um iframe de terceiro e
              não precisa competir com o conteúdo pela banda inicial. */}
          <Reveal delay={120}>
            <div className="mt-4 overflow-hidden border border-xxi-line">
              <iframe
                src={EMBED_SRC}
                title="Mapa da Barbearia Século 21"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[260px] w-full border-0 sm:h-[320px]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="xxi-pattern bg-xxi-ink px-5 py-20 text-center sm:px-8 md:py-28" id="agendar">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <Monogram className="mx-auto h-12 w-12 text-xxi-yellow" />
            <h2 className="xxi-title xxi-title-lg mt-6">
              Bora marcar seu horário?
            </h2>
            <p className="xxi-prose mx-auto mt-4">
              Você escolhe o serviço, o barbeiro e a hora. A confirmação sai na
              mesma tela.
            </p>
            <button
              type="button"
              onClick={() => abrirAgendamento()}
              className="xxi-btn xxi-btn-primary mt-8 w-full sm:w-auto"
            >
              Agendar agora
              <ArrowRight className="h-[1.1em] w-[1.1em]" aria-hidden="true" />
            </button>
          </Reveal>
        </div>
      </section>

      {/* ================= RODAPÉ ================= */}
      <footer className="border-t border-xxi-line bg-black px-5 py-12 sm:px-8" id="footer">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Lockup className="h-8 w-auto" textColor="#f2f2f2" />
              <p className="mt-4 max-w-xs text-sm text-xxi-mute">
                {ENDERECO.rua}
                <br />
                {ENDERECO.bairro}, {ENDERECO.cidade}
              </p>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <a href="#servicos" className="text-xxi-mute hover:text-xxi-yellow">Serviços</a>
              <a href="#assinaturas" className="text-xxi-mute hover:text-xxi-yellow">Clube</a>
              <a href="#localizacao" className="text-xxi-mute hover:text-xxi-yellow">Onde estamos</a>
              <a
                href={`tel:+55${ENDERECO.telefoneRaw.slice(2)}`}
                className="xxi-nums text-xxi-mute hover:text-xxi-yellow"
              >
                {ENDERECO.telefone}
              </a>
            </div>

            <div>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center border border-xxi-line text-xxi-mute hover:border-xxi-yellow hover:text-xxi-yellow"
                aria-label="Instagram da Barbearia Século 21"
              >
                <FaInstagram className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <p className="mt-10 border-t border-xxi-line pt-6 text-xs uppercase tracking-wider text-xxi-mute">
            Barbearia Século 21 · Cruzeiro/SP · Atendimento com hora marcada
          </p>
        </div>
      </footer>

      {/* Barra fixa de conversão (mobile). Transição em transform/opacity, sem
          biblioteca de animação. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-xxi-line bg-xxi-ink px-4 py-3 md:hidden"
        id="mobile-sticky-cta"
        style={{
          transform: stickyVisivel ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.24s ease',
        }}
        aria-hidden={!stickyVisivel}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Atendimento hoje</p>
            <p className="truncate text-xs text-xxi-mute">Com hora marcada</p>
          </div>
          <button
            type="button"
            onClick={() => abrirAgendamento()}
            className="xxi-btn xxi-btn-primary shrink-0"
            tabIndex={stickyVisivel ? 0 : -1}
          >
            Agendar
          </button>
        </div>
      </div>

      {isBookingOpen && (
        <BookingForm isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      )}

      {planoEmCheckout && (
        <PlanCheckout plan={planoEmCheckout} onClose={() => setPlanoEmCheckout(null)} />
      )}

      <Toast />
    </div>
  );
}
