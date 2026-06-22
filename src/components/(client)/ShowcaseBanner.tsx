"use client";
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Flame, Scissors, Wind, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

type HairType = 'liso' | 'afro';
const HAIR_ORDER: HairType[] = ['liso', 'afro'];
const HAIR_LABEL: Record<HairType, string> = { liso: 'Liso', afro: 'Crespo' };

interface TrendingCut {
  id: string;
  name: string;
  type: string;
  /** PNG sem fundo por textura de cabelo (cabeça flutuante). */
  images: Record<HairType, string>;
  popularity: string;
  styling: string;
  description: string;
}

/**
 * Carrossel da cabeça de um corte: alterna entre as texturas (liso/afro) por
 * setas, arraste ou clique nos dots. Cada card tem o seu — independentes.
 */
function CutCarousel({ cut }: { cut: TrendingCut }) {
  const [idx, setIdx] = useState(0); // índice em HAIR_ORDER
  const hair = HAIR_ORDER[idx];
  const go = (next: number) => setIdx((next + HAIR_ORDER.length) % HAIR_ORDER.length);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Palco da cabeça flutuante */}
      <div className="relative w-full flex items-center justify-center [animation:cut-float_7s_ease-in-out_infinite]">
        {/* Glow dourado ambiente atrás da cabeça */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square bg-[#c8ccd4]/10 rounded-full blur-[60px] group-hover:bg-[#c8ccd4]/20 transition-all duration-700 pointer-events-none" />

        {/* Área arrastável com crossfade entre texturas */}
        <motion.div
          className="relative w-[260px] h-[260px] md:w-[320px] md:h-[320px] cursor-grab active:cursor-grabbing touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(idx + 1);
            else if (info.offset.x > 60) go(idx - 1);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={hair}
              src={cut.images[hair]}
              alt={`${cut.name} — cabelo ${HAIR_LABEL[hair]}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)] pointer-events-none select-none"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </AnimatePresence>
        </motion.div>

        {/* Sombra elíptica projetada no "chão" */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-black/60 rounded-[100%] blur-md pointer-events-none" />

        {/* Setas laterais */}
        <button
          type="button"
          onClick={() => go(idx - 1)}
          aria-label="Textura anterior"
          className="absolute left-0 md:-left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full grid place-items-center bg-black/55 md:backdrop-blur-sm border border-white/10 text-zinc-300 hover:text-zinc-950 hover:bg-[#c8ccd4] hover:border-[#c8ccd4] transition-all duration-300 cursor-pointer active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => go(idx + 1)}
          aria-label="Próxima textura"
          className="absolute right-0 md:-right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full grid place-items-center bg-black/55 md:backdrop-blur-sm border border-white/10 text-zinc-300 hover:text-zinc-950 hover:bg-[#c8ccd4] hover:border-[#c8ccd4] transition-all duration-300 cursor-pointer active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots + rótulo da textura ativa */}
      <div className="flex items-center gap-3 mt-1">
        <div className="flex items-center gap-2">
          {HAIR_ORDER.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Ver cabelo ${HAIR_LABEL[t]}`}
              aria-pressed={i === idx}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === idx ? 'w-5 h-1.5 bg-[#c8ccd4]' : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-[8.5px] text-zinc-500 uppercase tracking-widest font-bold min-w-[28px] text-left">
          {HAIR_LABEL[hair]}
        </span>
      </div>
    </div>
  );
}

export default function ShowcaseBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Parallax Scroll calculation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Offset de parallax do trilho único da galeria (desliza com o scroll)
  const xLeftTrack = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  const springConfig = { damping: 25, stiffness: 60, mass: 0.5 };
  const smoothLeftX = useSpring(xLeftTrack, springConfig);

  // Cortes mais pedidos, cada um em duas texturas de cabelo (liso / afro).
  // As imagens são manequins 3D sem fundo (PNG transparente) — a cabeça flutua.
  const trendingCuts: TrendingCut[] = [
    {
      id: "americano",
      name: "Americano",
      type: "Degradê nas laterais",
      images: {
        liso: "/cortes/americano-liso.webp",
        afro: "/cortes/americano-afro.webp",
      },
      popularity: "95%",
      styling: "Acabamento com pomada sem brilho",
      description: "Cabelo mais curto no topo e degradê limpo nas laterais e na nuca. Combina com qualquer tipo de rosto."
    },
    {
      id: "midfade",
      name: "Degradê com Volume",
      type: "Volume no topo",
      images: {
        liso: "/cortes/midfade-liso.webp",
        afro: "/cortes/midfade-afro.webp",
      },
      popularity: "92%",
      styling: "Acabamento com pomada e secador",
      description: "Volume jogado para cima e degradê na altura da orelha. Moderno e fácil de manter no dia a dia."
    }
  ];

  // Galeria sem fotos ainda: 8 "polaroids" pichados como placeholder estiloso.
  // Cada slot tem orientação (retrato/paisagem), uma legenda de rua e uma
  // leve inclinação — quando o material real chegar, basta plugar a foto.
  // Máx. 8 slots de propósito: nada de parede de retângulos repetidos.
  const galleryPolaroids: { legenda: string; orient: 'retrato' | 'paisagem'; tilt: number }[] = [
    { legenda: 'fade na régua', orient: 'retrato', tilt: -3 },
    { legenda: 'antes & depois', orient: 'paisagem', tilt: 2 },
    { legenda: '@seculoxxi', orient: 'retrato', tilt: 2.5 },
    { legenda: 'barba na navalha', orient: 'paisagem', tilt: -2 },
    { legenda: 'disfarçado', orient: 'retrato', tilt: 3 },
    { legenda: 'freestyle', orient: 'paisagem', tilt: -2.5 },
    { legenda: 'risca na lateral', orient: 'retrato', tilt: -1.5 },
    { legenda: 'no capricho', orient: 'paisagem', tilt: 2 },
  ];

  return (
    <section 
      ref={containerRef}
      className="w-full bg-[#0b0b0d] bg-tijolo py-12 sm:py-20 md:py-24 border-t-2 border-black overflow-hidden relative scroll-mt-20 md:scroll-mt-24"
      id="portfolio"
    >
      {/* Glowing atmospheric dust over the tracks */}
      <div className="absolute top-[30%] left-[20%] w-[250px] h-[250px] bg-[#c8ccd4]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen hidden md:block" />
      <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] bg-[#c8ccd4]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen hidden md:block" />

      {/* Embed micro-scrolling keyframe inside the component for perfect portability */}
      <style>{`
        @keyframes marqueeImagesLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* Flutuação suave da cabeça do corte */
        @keyframes cut-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="cut-float"] { animation: none !important; }
        }
      `}</style>

      {/* Title & Metadata Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16 select-none">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left"
        >
          <div className="space-y-2">
            <span className="font-sans text-[8px] text-[#c8ccd4] tracking-[0.25em] uppercase flex items-center gap-2 font-bold select-none">SÉCULO XXI • NOSSOS CORTES</span>
            <h2 className="text-3xl md:text-5xl uppercase tracking-wide">
              <span className="font-toon text-logo-3d" data-text="Nossos Cortes">Nossos Cortes</span>
            </h2>
          </div>
          <p className="font-serif italic text-zinc-400 text-sm md:text-base max-w-sm font-light leading-relaxed">
            Veja alguns dos cortes feitos na <strong>Século XXI</strong>. Trabalho caprichado, do clássico ao moderno, aqui em Cruzeiro.
          </p>
        </motion.div>
      </div>

      {/* Galeria em montagem: UM trilho de polaroids pichados (8 slots, sem repetir) */}
      <div className="w-full relative overflow-hidden py-8 select-none bg-black/30 md:backdrop-blur-md border-y border-white/5 mb-20 md:mb-24">

        {/* Selo assumido: a galeria está sendo montada, de propósito e com estilo */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6 flex items-center gap-3">
          <span className="font-toon text-[#c8ccd4] text-sm uppercase -rotate-2 inline-block">Galeria em montagem</span>
          <div className="h-px bg-[#c8ccd4]/15 flex-1" />
          <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold hidden sm:block">Fotos reais chegando</span>
        </div>

        {/* Trilho único — parallax no desktop, marquee suave no mobile */}
        <motion.div
          style={isMobile ? undefined : { x: smoothLeftX }}
          className={`flex items-center gap-5 md:gap-7 w-max px-4 ${isMobile ? 'animate-[marqueeImagesLeft_45s_linear_infinite]' : 'md:w-[120%]'}`}
        >
          {[...galleryPolaroids, ...galleryPolaroids].map((slot, i) => {
            const isRetrato = slot.orient === 'retrato';
            return (
              <div
                key={i}
                className="flex-shrink-0 bg-[#f4f1ea] p-2 pb-7 rounded-sm shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.8)] transition-shadow duration-300 relative"
                style={{ transform: `rotate(${slot.tilt}deg)` }}
              >
                {/* Fita crepe no topo */}
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-5 bg-[#c8ccd4]/30 border border-white/20 rotate-2 rounded-[1px] backdrop-blur-[1px]" />

                {/* "Foto" — moldura escura com ícone, placeholder até a imagem real */}
                <div className={`overflow-hidden relative bg-gradient-to-br from-[#1a1a20] to-[#0b0b0e] flex items-center justify-center ${isRetrato ? 'h-[210px] md:h-[260px] w-[150px] md:w-[185px]' : 'h-[160px] md:h-[200px] w-[220px] md:w-[280px]'}`}>
                  <ImageIcon className="w-8 h-8 text-[#c8ccd4]/25" strokeWidth={1.5} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,204,212,0.06),transparent_60%)]" />
                </div>

                {/* Legenda manuscrita/pichada na borda branca da polaroid */}
                <span className="absolute bottom-1.5 left-0 right-0 text-center font-toon text-[#1a1a20] text-[11px] lowercase tracking-tight">
                  {slot.legenda}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Trending Cuts Showcase Card Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Carousel title indicator */}
        <div className="flex items-center gap-3 mb-12 select-none">
          <Flame className="w-5 h-5 text-[#c8ccd4] animate-bounce" />
          <span className="font-mono text-[10px] text-white uppercase tracking-[0.3em] font-extrabold whitespace-nowrap">CORTES MAIS PEDIDOS</span>
          <div className="h-[1.5px] bg-[#c8ccd4]/15 flex-1" />
          <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold hidden md:block whitespace-nowrap">Use as setas para ver • Cabelo liso ou crespo</span>
        </div>

        {/* Vitrine: cabeças flutuantes sem moldura, carrossel liso/afro por corte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12" id="trending-grid">
          {trendingCuts.map((cut, idx) => (
            <motion.div
              key={cut.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative flex flex-col items-center text-center pt-8 pb-2 select-none"
            >
              {/* Badge de ranking — leaderboard de cortes (combina com o tema game) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/70 md:backdrop-blur-sm border border-[#c8ccd4]/30 rounded-full pl-2 pr-3 py-1 shadow-lg">
                <span className="font-toon text-[#c8ccd4] text-sm leading-none">#{idx + 1}</span>
                <span className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest font-bold leading-none">mais pedido</span>
              </div>

              {/* Carrossel da cabeça (setas + arraste + dots) */}
              <CutCarousel cut={cut} />

              {/* Pill de info abaixo da cabeça (o "contorno azul" do esboço, refinado) */}
              <div className="relative mt-4 w-full max-w-[300px] rounded-2xl border border-white/10 bg-black/40 md:backdrop-blur-md px-5 py-4 group-hover:border-[#c8ccd4]/40 group-hover:bg-black/55 transition-all duration-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <span className="font-mono text-[8px] text-[#c8ccd4]/70 uppercase block font-bold tracking-[0.2em] leading-none mb-1.5">{cut.type}</span>
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight group-hover:text-[#c8ccd4] transition-colors">{cut.name}</h3>

                {/* Barra de popularidade — sempre visível (vira "ranking" de procura) */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#c8ccd4]/60 to-[#c8ccd4]" style={{ width: cut.popularity }} />
                  </div>
                  <span className="font-mono text-[10px] text-[#c8ccd4] font-bold leading-none flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />{cut.popularity}
                  </span>
                </div>

                {/* Detalhes que só se revelam no hover/toque — texto em segundo plano */}
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-out">
                  <div className="overflow-hidden">
                    <p className="font-sans text-[11px] text-zinc-400 leading-relaxed font-normal pt-3">{cut.description}</p>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 justify-center font-mono text-[10px] text-[#c8ccd4] font-bold">
                      <Wind className="w-3 h-3 shrink-0" />
                      <span className="truncate">{cut.styling}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Call Directing back to booking */}
        <div className="mt-16 text-center select-none">
          <a
            href="#reservar"
            className="inline-flex items-center gap-2 font-display text-[11px] font-bold tracking-widest text-[#c8ccd4] hover:text-white border-b border-dashed border-[#c8ccd4]/25 hover:border-white py-2 uppercase transition-all"
          >
quero agendar um corte destes
            <Scissors className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
