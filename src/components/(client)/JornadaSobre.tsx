"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';

/**
 * Seção "Sobre a Século XXI" — Missão / Visão / Valores apresentados como uma
 * JORNADA: uma trilha vertical (SVG) que se "desenha" conforme o usuário rola,
 * com 3 marcos em zigue-zague (ícone 3D de um lado, texto do outro) e a cadeira
 * de barbeiro dourada como destino no topo.
 */

interface Marco {
  id: string;
  numero: string;
  titulo: string;
  icone: string;
  conteudo: React.ReactNode;
}

const MARCOS: Marco[] = [
  {
    id: 'missao',
    numero: '01',
    titulo: 'Missão',
    icone: '/img/tesoura.png',
    conteudo: (
      <p className="font-serif italic text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
        Oferecer uma experiência de cuidado masculino que une tradição e
        modernidade, proporcionando estilo, bem-estar e confiança a cada cliente.
      </p>
    ),
  },
  {
    id: 'visao',
    numero: '02',
    titulo: 'Visão',
    icone: '/img/lampada.png',
    conteudo: (
      <p className="font-serif italic text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
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
    icone: '/img/selo.png',
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
            <span className="font-sans text-[13px] sm:text-sm text-zinc-300 leading-snug">
              <strong className="font-semibold text-white">{titulo}:</strong> {desc}
            </span>
          </li>
        ))}
      </ul>
    ),
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
      className="relative isolate w-full overflow-hidden py-16 sm:py-24 px-4 md:px-8 scroll-mt-20 md:scroll-mt-24 bg-[linear-gradient(180deg,#0a0a0c_0%,#070708_100%)]"
    >
      {/* Glows tricolor sutis */}
      <div className="absolute top-[10%] right-[6%] w-80 h-80 bg-brand-blue/12 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[12%] left-[4%] w-72 h-72 bg-brand-red/12 rounded-full blur-[110px] -z-10 pointer-events-none" />

      {/* Cabeçalho */}
      <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-20">
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
          className="font-display font-medium text-3xl sm:text-5xl text-zinc-50 tracking-tight"
        >
          Sobre a{' '}
          <span className="font-serif italic bg-gradient-to-r from-brand-red to-brand-blue bg-clip-text text-transparent">
            Século XXI
          </span>
        </motion.h2>
        <p className="font-serif italic text-zinc-400 text-sm sm:text-base mt-4 font-light">
          Uma jornada de tradição, visão e propósito — passo a passo até a excelência.
        </p>
      </div>

      {/* Trilha + marcos.
          Mobile: trilha encostada na ESQUERDA, marcos à direita dela (timeline) — nada passa por trás do texto.
          Desktop (sm+): trilha CENTRALIZADA, marcos em zigue-zague nas laterais. */}
      <div ref={containerRef} className="relative max-w-3xl mx-auto">
        {/* Trilha vertical (SVG) */}
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

        {/* Marcos */}
        <div className="relative flex flex-col gap-14 sm:gap-28 py-4 pl-14 sm:pl-0">
          {MARCOS.map((marco, i) => {
            const iconeEsquerda = i % 2 === 0; // só vale no desktop
            return (
              <div
                key={marco.id}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-10 items-center"
              >
                {/* Ícone 3D */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex justify-start sm:justify-center ${iconeEsquerda ? 'sm:order-1' : 'sm:order-2'}`}
                >
                  <img
                    src={marco.icone}
                    alt={marco.titulo}
                    className="w-24 h-24 sm:w-44 sm:h-44 object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.22)]"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>

                {/* Texto */}
                <motion.div
                  initial={{ opacity: 0, x: iconeEsquerda ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`flex flex-col text-left items-start ${iconeEsquerda ? 'sm:order-2 sm:text-left sm:items-start' : 'sm:order-1 sm:text-right sm:items-end'}`}
                >
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-display font-bold text-2xl bg-gradient-to-r from-brand-red to-brand-blue bg-clip-text text-transparent">
                      {marco.numero}
                    </span>
                    <h3 className="font-display font-semibold text-xl sm:text-2xl text-zinc-50 uppercase tracking-wide">
                      {marco.titulo}
                    </h3>
                  </div>
                  <div className="max-w-sm">{marco.conteudo}</div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Destino: cadeira dourada no topo do caminho */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center mt-14 sm:mt-20"
        >
          <div className="absolute inset-x-0 -top-4 mx-auto w-44 h-44 bg-[#c2a35d]/20 blur-[60px] rounded-full -z-10" />
          <img
            src="/img/cadeiradourada.png"
            alt="Cadeira de barbeiro — o destino da Século XXI"
            className="w-40 h-40 sm:w-52 sm:h-52 object-contain drop-shadow-[0_20px_34px_rgba(0,0,0,0.28)]"
            loading="lazy"
            decoding="async"
          />
          <p className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.28em] uppercase text-[#c2a35d] mt-2">
            O destino: excelência
          </p>
        </motion.div>
      </div>
    </section>
  );
}
