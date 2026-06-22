"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { PartyPopper, CircleDot, Blocks, Joystick, Gamepad2, type LucideIcon } from 'lucide-react';

/**
 * Seção "Sobre a Século XXI" — Missão / Visão / Valores apresentados na mesma
 * linguagem game/street da vitrine de Serviços (OrbCarousel): cada pilar é uma
 * ESFERA DE VIDRO 3D (com glow, anel orbital e brilho especular) sobre um card
 * street (contorno preto + sombra empilhada). A cadeira de barbeiro dourada é o
 * selo central "destino: excelência" no topo dos pilares.
 */

type Pilar = 'red' | 'blue' | 'cream';

interface Marco {
  id: string;
  numero: string;
  titulo: string;
  icone: string;
  cor: Pilar;
  conteudo: React.ReactNode;
}

const MARCOS: Marco[] = [
  {
    id: 'missao',
    numero: '01',
    titulo: 'Missão',
    icone: '/img/tesoura.webp',
    cor: 'red',
    conteudo: (
      <p className="font-serif italic text-zinc-300 text-sm leading-relaxed font-light">
        Oferecer uma experiência de cuidado masculino que une tradição e
        modernidade, proporcionando estilo, bem-estar e confiança a cada cliente.
      </p>
    ),
  },
  {
    id: 'visao',
    numero: '02',
    titulo: 'Visão',
    icone: '/img/lampada.webp',
    cor: 'blue',
    conteudo: (
      <p className="font-serif italic text-zinc-300 text-sm leading-relaxed font-light">
        Ser referência em barbearia contemporânea, reconhecida pela excelência no
        atendimento, inovação nos serviços e valorização do estilo masculino em
        todas as gerações.
      </p>
    ),
  },
  {
    id: 'valores',
    numero: '03',
    titulo: 'Valores',
    icone: '/img/selo.webp',
    cor: 'cream',
    conteudo: (
      <ul className="flex flex-col gap-2.5 text-left">
        {[
          ['Respeito ao cliente', 'Atendimento personalizado e com empatia.'],
          ['Inovação com raízes', 'Unimos técnicas clássicas com tendências atuais.'],
          ['Qualidade em cada detalhe', 'Do corte ao ambiente, buscamos sempre o melhor.'],
          ['Estilo com identidade', 'Valorizamos a autenticidade de cada cliente.'],
          ['Compromisso com a evolução', 'Sempre aprendendo, crescendo e nos atualizando.'],
        ].map(([titulo, desc]) => (
          <li key={titulo} className="flex gap-2.5 items-start">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-brand-red to-brand-blue shrink-0" />
            <span className="font-sans text-[13px] text-zinc-300 leading-snug">
              <strong className="font-semibold text-white">{titulo}:</strong> {desc}
            </span>
          </li>
        ))}
      </ul>
    ),
  },
];

/**
 * Paleta tricolor por pilar — espelha o esquema das orbes do OrbCarousel
 * (radial-gradient com flare claro no topo-esquerda e cor profunda na base).
 */
const ORB_THEME: Record<Pilar, { sphere: string; glow: string; ring: string; accent: string }> = {
  red: {
    sphere: 'radial-gradient(circle at 35% 30%, #eef2ff 0%, #5a93de 16%, #2b4fb8 46%, #16245c 78%, #0a1230 100%)',
    glow: 'bg-brand-blue/40',
    ring: 'border-brand-blue/30',
    accent: 'text-zinc-100',
  },
  blue: {
    sphere: 'radial-gradient(circle at 35% 30%, #eef2ff 0%, #5a93de 16%, #2b4fb8 46%, #16245c 78%, #0a1230 100%)',
    glow: 'bg-brand-blue/40',
    ring: 'border-brand-blue/30',
    accent: 'text-zinc-100',
  },
  cream: {
    sphere: 'radial-gradient(circle at 35% 30%, #eef2ff 0%, #5a93de 16%, #2b4fb8 46%, #16245c 78%, #0a1230 100%)',
    glow: 'bg-brand-blue/40',
    ring: 'border-brand-blue/30',
    accent: 'text-zinc-100',
  },
};

/**
 * Esfera de vidro 3D do pilar — reaproveita a estética das orbes do OrbCarousel:
 * glow ambiente que respira, anel orbital tracejado girando e brilho especular
 * de cima. No centro, o ícone 3D (.webp) do pilar.
 */
function PilarOrb({ icone, titulo, cor }: { icone: string; titulo: string; cor: Pilar }) {
  const t = ORB_THEME[cor];
  return (
    <div className="relative w-40 h-40 sm:w-44 sm:h-44 shrink-0 grid place-items-center [animation:orb-float_6s_ease-in-out_infinite]">
      {/* Glow ambiente que pulsa por trás */}
      <div className={`absolute inset-2 rounded-full blur-2xl [animation:orb-breathe_4s_ease-in-out_infinite] ${t.glow}`} />
      {/* Anel orbital tracejado girando devagar */}
      <div className={`absolute -inset-1 rounded-full border border-dashed [animation:spin-slow_24s_linear_infinite] ${t.ring}`} />
      {/* Corpo da esfera de vidro — contorno preto street + dupla sombra interna */}
      <div
        className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full grid place-items-center overflow-hidden border-2 border-black/60 shadow-[inset_-12px_-12px_24px_rgba(0,0,0,0.85),inset_12px_12px_24px_rgba(255,255,255,0.2),0_18px_36px_rgba(0,0,0,0.7)]"
        style={{ background: t.sphere }}
      >
        {/* Brilho especular curvo de cima (caixa de luz) */}
        <div className="absolute top-[2px] left-5 right-5 h-1/2 rounded-[100%] bg-gradient-to-b from-white/60 via-white/10 to-transparent pointer-events-none" />
        {/* Refração interna sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
        {/* Ícone 3D do pilar */}
        <img
          src={icone}
          alt={titulo}
          className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)]"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}

/**
 * Diferencial da Século XXI: área de entretenimento para a família esperar
 * (e as crianças se divertirem) enquanto o cliente é atendido.
 * Cada card nasce com ícone; quando houver fotos boas, basta trocar o badge
 * do ícone por um <img src={item.foto} /> (campo opcional já previsto).
 */
interface ItemEntretenimento {
  id: string;
  nome: string;
  descricao: string;
  icone: LucideIcon;
  foto?: string; // preparado para receber foto real depois
}

const ENTRETENIMENTO: ItemEntretenimento[] = [
  {
    id: 'cama-elastica',
    nome: 'Cama elástica',
    descricao: 'Pula-pula infantil para gastar a energia da criançada.',
    icone: PartyPopper,
  },
  {
    id: 'piscina-bolinhas',
    nome: 'Piscina de bolinhas',
    descricao: 'Diversão garantida para os pequenos enquanto você relaxa.',
    icone: CircleDot,
  },
  {
    id: 'area-kids',
    nome: 'Área kids',
    descricao: 'Cantinho com brinquedos pensado para as crianças.',
    icone: Blocks,
  },
  {
    id: 'fliperama',
    nome: 'Fliperama',
    descricao: 'Máquina do Subway Surfers para encarar o desafio.',
    icone: Joystick,
  },
  {
    id: 'playstation',
    nome: 'PlayStation 4',
    descricao: 'Videogame liberado para a espera virar partida.',
    icone: Gamepad2,
  },
];

export default function JornadaSobre() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Progresso do scroll dentro da seção → controla o "desenhar" da trilha.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 70%', 'end 60%'],
  });

  return (
    <section
      id="sobre-nos"
      className="relative isolate w-full overflow-hidden py-16 sm:py-24 px-4 md:px-8 scroll-mt-20 md:scroll-mt-24 bg-[#0b0b0d] bg-tijolo border-t-2 border-black"
    >
      {/* Glows tricolor sutis */}
      <div className="absolute top-[10%] right-[6%] w-80 h-80 bg-brand-blue/12 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[12%] left-[4%] w-72 h-72 bg-brand-red/12 rounded-full blur-[110px] -z-10 pointer-events-none" />

      {/* Cabeçalho */}
      <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block font-sans text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-brand-blue bg-brand-blue/5 border border-brand-blue/15 px-4 py-1.5 rounded-full mb-5"
        >
          Século XXI • Nossa Essência
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl tracking-tight"
        >
          <span className="font-toon text-logo-3d" data-text="Sobre a Século XXI">Sobre a Século XXI</span>
        </motion.h2>
        <p className="font-serif italic text-zinc-400 text-sm sm:text-base mt-4 font-light">
          Uma jornada de tradição, visão e propósito — passo a passo até a excelência.
        </p>
      </div>

      {/* Trilha + marcos (jornada vertical).
          Mobile: trilha encostada na ESQUERDA, marcos à direita dela (timeline).
          Desktop (sm+): trilha CENTRALIZADA, marcos em zigue-zague nas laterais. */}
      <div ref={containerRef} className="relative max-w-3xl mx-auto">
        {/* Trilha vertical (SVG) que se desenha conforme o scroll */}
        <svg
          className="absolute left-3 sm:left-1/2 sm:-translate-x-1/2 top-0 h-full w-10 -z-0 pointer-events-none"
          viewBox="0 0 40 1000"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="trilha-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e23a2e" />
              <stop offset="100%" stopColor="#2b4fb8" />
            </linearGradient>
          </defs>
          {/* Trilha base (apagada) */}
          <path
            d="M20 0 C 36 160, 4 320, 20 500 S 36 840, 20 1000"
            stroke="#2a2a2e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="2 14"
          />
          {/* Trilha animada (se desenha no scroll) */}
          <motion.path
            d="M20 0 C 36 160, 4 320, 20 500 S 36 840, 20 1000"
            stroke="url(#trilha-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{ pathLength: scrollYProgress }}
          />
        </svg>

        {/* Marcos em zigue-zague — orbe de vidro de um lado, texto do outro */}
        <div className="relative flex flex-col gap-16 sm:gap-28 py-4 pl-14 sm:pl-0">
          {MARCOS.map((marco, i) => {
            const t = ORB_THEME[marco.cor];
            const orbeEsquerda = i % 2 === 0; // só vale no desktop
            return (
              <div
                key={marco.id}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-10 items-center"
              >
                {/* Orbe de vidro do pilar */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex justify-start sm:justify-center ${orbeEsquerda ? 'sm:order-1' : 'sm:order-2'}`}
                >
                  <PilarOrb icone={marco.icone} titulo={marco.titulo} cor={marco.cor} />
                </motion.div>

                {/* Texto (solto ao lado, sem card envolvendo) */}
                <motion.div
                  initial={{ opacity: 0, x: orbeEsquerda ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`flex flex-col text-left items-start ${orbeEsquerda ? 'sm:order-2 sm:text-left sm:items-start' : 'sm:order-1 sm:text-right sm:items-end'}`}
                >
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-toon text-logo-3d text-2xl" data-text={marco.numero}>
                      {marco.numero}
                    </span>
                    <h3 className={`font-display font-black text-xl sm:text-2xl uppercase tracking-wide ${t.accent}`}>
                      {marco.titulo}
                    </h3>
                  </div>
                  <div className="max-w-sm">{marco.conteudo}</div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Destino: cadeira dourada como último marco no topo do caminho */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center mt-16 sm:mt-20"
        >
          <div className="absolute inset-x-0 -top-4 mx-auto w-44 h-44 bg-[#c8ccd4]/20 blur-[60px] rounded-full -z-10" />
          <img
            src="/img/cadeiradourada.webp"
            alt="Cadeira de barbeiro — o destino da Século XXI"
            className="w-40 h-40 sm:w-52 sm:h-52 object-contain drop-shadow-[0_20px_34px_rgba(0,0,0,0.28)]"
            loading="lazy"
            decoding="async"
          />
          <p className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.28em] uppercase text-[#c8ccd4] mt-2">
            O destino: excelência
          </p>
        </motion.div>
      </div>

      {/* DIFERENCIAL: Espaço de entretenimento (família + crianças) */}
      <div className="relative max-w-5xl mx-auto mt-24 sm:mt-32">
        {/* Cabeçalho do bloco */}
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block font-sans text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-brand-blue bg-brand-blue/5 border border-brand-blue/15 px-4 py-1.5 rounded-full mb-5"
          >
            Diferencial Século XXI
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl tracking-tight"
          >
            <span className="font-toon text-logo-3d" data-text="Enquanto você se cuida, a família se diverte">Enquanto você se cuida, a família se diverte</span>
          </motion.h2>
          <p className="font-serif italic text-zinc-400 text-sm sm:text-base mt-4 font-light">
            Traga a criançada. Aqui a espera vira lazer: um espaço de
            entretenimento pensado para todas as idades.
          </p>
        </div>

        {/* Grid de cards game (contorno preto, sombra dura, brilho especular, glow no hover) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ENTRETENIMENTO.map((item, i) => {
            const Icone = item.icone;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex items-start gap-4 rounded-[24px] border-2 border-black/55 hover:border-black bg-[#0c0c0f] p-5 sm:p-6 transition-all duration-400 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_10px_rgba(0,0,0,0.3)] md:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.5)] md:hover:shadow-[0_20px_45px_-12px_rgba(43,79,184,0.22)]"
              >
                {/* Brilho especular no topo */}
                <div className="glow-decor absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-white/[0.06] via-transparent to-transparent pointer-events-none" />
                {/* Glow azul vivo no hover */}
                <div className="glow-decor absolute -inset-10 bg-brand-blue/[0.01] group-hover:bg-brand-blue/[0.08] blur-2xl rounded-full transition-all duration-500 pointer-events-none" />

                {/* Badge do ícone (trocar por <img src={item.foto}/> quando houver foto) */}
                <div className="relative z-10 shrink-0 grid place-items-center w-12 h-12 rounded-xl border-2 border-black/40 bg-gradient-to-br from-brand-blue/25 to-brand-blue-deep/25 text-zinc-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)] group-hover:from-brand-blue/40 group-hover:to-brand-blue-deep/40 transition-all duration-400">
                  <Icone className="w-6 h-6" strokeWidth={1.6} />
                </div>
                <div className="relative z-10 flex flex-col text-left">
                  <h3 className="font-display font-black text-base sm:text-lg text-zinc-50 uppercase tracking-wide group-hover:text-brand-blue transition-colors">
                    {item.nome}
                  </h3>
                  <p className="font-sans text-[13px] text-zinc-400 leading-snug mt-1">
                    {item.descricao}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
