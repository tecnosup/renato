"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Check, Gift, Crown, Flame, CheckCircle, ChevronLeft, ChevronRight, Eye, Award, Gem } from 'lucide-react';
import PlanCheckout from './PlanCheckout';

type Tier = 'Ouro' | 'Platina' | 'Diamante';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  tier: Tier;
  popular: boolean;
  tagline: string;
  benefits: string[];
  /** Gradiente radial do mini-orbe de vidro do nível */
  orbGradient: string;
  /** Cor do glow/anel do orbe (ação ambiente do tier) */
  orbGlow: string;
  /** Borda do card quando este plano está em foco */
  activeBorder: string;
  /** Estilo do badge de nível */
  badgeBg: string;
  /** Selo "ATIVO" preenchido na cor da orbe do nível */
  activeBadge: string;
  /** Fundo do botão de assinar, na cor do nível (sem o gradiente tricolor) */
  ctaBg: string;
  /** Cor do nome do plano (estado normal e hover) */
  textColor: string;
  /** Cor do contorno luminoso interno quando em foco */
  haloShadow: string;
}

/**
 * Mini-orbe de vidro do nível — mesma estética street das orbes grandes
 * (radial-gradient + contorno preto + brilho especular). Identifica o tier
 * (Ouro / Platina / Diamante) no topo de cada card de assinatura.
 */
function TierOrb({ gradient, glow, icon }: { gradient: string; glow: string; icon: React.ReactNode }) {
  return (
    <div className="relative w-11 h-11 shrink-0 grid place-items-center">
      {/* Glow ambiente pulsando atrás */}
      <div className={`absolute inset-0 rounded-full blur-lg opacity-60 ${glow}`} />
      {/* Anel orbital tracejado girando devagar (keyframe global; respeita reduce-motion) */}
      <div className="absolute -inset-1 rounded-full border border-dashed border-white/20 animate-spin-slower" />
      {/* Corpo da esfera de vidro — contorno preto street */}
      <div
        className="relative w-9 h-9 rounded-full grid place-items-center overflow-hidden border-2 border-black/60 shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.85),inset_5px_5px_10px_rgba(255,255,255,0.22)]"
        style={{ background: gradient }}
      >
        {/* Brilho especular de cima */}
        <div className="absolute top-[2px] left-2 right-2 h-1/2 rounded-[100%] bg-gradient-to-b from-white/60 via-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Dados estáticos dos planos — fora do componente para não recriar o array
// (com strings grandes) a cada render. O carrossel re-renderiza com frequência.
const plans: Plan[] = [
    {
      id: "ouro-club",
      name: "Plano Ouro",
      price: 140,
      period: "mês",
      tier: "Ouro",
      popular: false,
      tagline: "Para quem corta o cabelo a cada 15 dias.",
      benefits: [
        "2 cortes por mês",
        "Lavagem de cabelo com massagem relaxante",
        "Atendimento com o barbeiro que você escolher",
        "Finalização com pomadas de qualidade",
        "Pode cancelar quando quiser, sem multa"
      ],
      // Ouro = âmbar/dourado
      orbGradient: "radial-gradient(circle at 35% 30%, #fff7e0 0%, #fcd34d 18%, #f59e0b 48%, #b45309 78%, #5c2e08 100%)",
      orbGlow: "bg-amber-500/40",
      activeBorder: "border-amber-400 shadow-[0_6px_0_rgba(0,0,0,0.9),0_14px_34px_rgba(245,158,11,0.18)]",
      badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      activeBadge: "bg-amber-400 text-amber-950 border-amber-300",
      ctaBg: "bg-[linear-gradient(135deg,#fcd34d_0%,#f59e0b_55%,#b45309_100%)] text-amber-950",
      textColor: "text-zinc-100 group-hover/club:text-amber-300",
      haloShadow: "border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.18)]"
    },
    {
      id: "platina-club",
      name: "Plano Platina",
      price: 240,
      period: "mês",
      tier: "Platina",
      popular: true,
      tagline: "O nosso plano mais procurado.",
      benefits: [
        "Cortes de cabelo SEM LIMITE",
        "1 barba completa por mês",
        "Lavagem caprichada em toda visita",
        "10% de desconto nos produtos",
        "Atendimento mais rápido, sem fila",
        "Atendimento com barbeiro especialista"
      ],
      // Platina = prata azulada (brand-blue suave)
      orbGradient: "radial-gradient(circle at 35% 30%, #f4f7ff 0%, #cbd5e1 16%, #94a3b8 44%, #5a93de 74%, #1d3585 100%)",
      orbGlow: "bg-slate-300/40",
      activeBorder: "border-slate-200 shadow-[0_6px_0_rgba(0,0,0,0.9),0_14px_34px_rgba(148,163,184,0.2)]",
      badgeBg: "bg-slate-300/10 text-slate-200 border-slate-300/30",
      activeBadge: "bg-slate-200 text-slate-900 border-white",
      ctaBg: "bg-[linear-gradient(135deg,#e2e8f0_0%,#94a3b8_55%,#475569_100%)] text-slate-900",
      textColor: "text-white group-hover/club:text-slate-200",
      haloShadow: "border-slate-200/40 shadow-[0_0_15px_rgba(203,213,225,0.16)]"
    },
    {
      id: "diamante-club",
      name: "Plano Diamante",
      price: 360,
      period: "mês",
      tier: "Diamante",
      popular: false,
      tagline: "Para quem quer o melhor, sem limites.",
      benefits: [
        "CORTES E BARBA SEM LIMITE",
        "Espuma quente e massagem no rosto",
        "Cervejas artesanais à vontade",
        "Atendimento exclusivo e prioritário",
        "1 kit de produtos para cabelo por ano",
        "Hidratação de cabelo relaxante inclusa"
      ],
      // Diamante = azul-ciano brilhante (brand-blue + cyan)
      orbGradient: "radial-gradient(circle at 35% 30%, #ecfeff 0%, #67e8f9 16%, #22d3ee 44%, #2b4fb8 74%, #16245c 100%)",
      orbGlow: "bg-cyan-400/40",
      activeBorder: "border-cyan-300 shadow-[0_6px_0_rgba(0,0,0,0.9),0_14px_34px_rgba(34,211,238,0.2)]",
      badgeBg: "bg-cyan-400/10 text-cyan-200 border-cyan-400/30",
      activeBadge: "bg-cyan-300 text-cyan-950 border-cyan-200",
      ctaBg: "bg-[linear-gradient(135deg,#67e8f9_0%,#22d3ee_55%,#0e7490_100%)] text-cyan-950",
      textColor: "text-zinc-100 group-hover/club:text-cyan-200",
      haloShadow: "border-cyan-300/40 shadow-[0_0_15px_rgba(34,211,238,0.18)]"
    }
];

export default function Memberships() {
  const [activeIndex, setActiveIndex] = useState<number>(1); // Start with Club Royal (index 1)
  const autoRotateTimer = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(1200);
  // Plano selecionado para o checkout de assinatura (null = fechado).
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubscribe = (plan: Plan, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering slide change
    // Abre o checkout de assinatura (tela única, 2 colunas, tema street).
    setCheckoutPlan(plan);
  };

  // Safe cyclic index manipulation
  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % plans.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + plans.length) % plans.length);
  };

  // Auto-rotação "consciente": só avança quando a seção está VISÍVEL e o usuário
  // não pediu menos movimento. Fora da viewport (ou em aba oculta) o intervalo
  // não re-renderiza o carrossel 3D — segue o padrão de performance da landing
  // (loops infinitos não devem manter o compositor ativo fora da tela).
  const isVisibleRef = useRef(false);
  // Timestamp do próximo avanço automático; uma interação "adia" o próximo giro
  // sem precisar derrubar/recriar o intervalo (evita closures sobre setState).
  // Inicia em 0 (sem chamar Date.now em render); o efeito agenda o 1º giro.
  const nextRotateAt = useRef<number>(0);

  // Adia o próximo giro automático após uma interação manual.
  const pokeRotation = () => {
    nextRotateAt.current = Date.now() + 8000;
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Respeita reduce-motion: nenhuma auto-rotação. O usuário ainda navega
    // manualmente pelas setas/dots/drag.
    if (prefersReduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.2 }
    );
    observer.observe(section);

    // Agenda o primeiro giro (não chamamos Date.now em tempo de render).
    nextRotateAt.current = Date.now() + 8000;

    // Um único intervalo curto que só age quando visível e quando o "relógio"
    // do próximo giro venceu. Não dispara setState fora da viewport.
    autoRotateTimer.current = setInterval(() => {
      if (!isVisibleRef.current) return;
      if (document.hidden) return;
      if (Date.now() < nextRotateAt.current) return;
      nextRotateAt.current = Date.now() + 8000;
      nextSlide();
    }, 1000);

    return () => {
      observer.disconnect();
      if (autoRotateTimer.current) clearInterval(autoRotateTimer.current);
    };
  }, []);

  const handleCardClick = (idx: number) => {
    if (activeIndex !== idx) {
      setActiveIndex(idx);
      pokeRotation();
    }
  };

  const handleDragEnd = (event: unknown, info: { offset: { x: number } }) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      nextSlide();
      pokeRotation();
    } else if (info.offset.x > threshold) {
      prevSlide();
      pokeRotation();
    }
  };

  // Responsive orbital carousel constants
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const carouselWidthClass = isMobile ? "w-[270px] xs:w-[305px]" : isTablet ? "w-[340px]" : "w-[370px]";
  const carouselHeightClass = isMobile ? "h-[440px] xs:h-[465px]" : isTablet ? "h-[490px]" : "h-[510px]";

  return (
    <section 
      ref={sectionRef} 
      className="w-full bg-[#0b0b0d] bg-tijolo py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12 relative overflow-hidden scroll-mt-20 md:scroll-mt-24"
      id="assinaturas"
    >
      {/* Fade de transição da seção anterior — dissolve o limite sem linha dura */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 sm:h-40 z-0 pointer-events-none bg-gradient-to-b from-[#0a0a0c] to-transparent" />

      {/* Background Graphic elements matching luxury look */}
      <div className="glow-decor absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-brand-blue/8 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        
        {/* Header Title with animated reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-left mb-6 sm:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full"
        >
          <div className="space-y-1 sm:space-y-2">
            <div className="font-sans text-[8px] sm:text-[9px] text-brand-blue tracking-[0.25em] uppercase flex items-center gap-2 font-bold select-none">
              SÉCULO XXI • CLUBE PRIVADO
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl tracking-[0.05em] leading-tight uppercase">
              <span className="font-toon text-logo-3d" data-text="CLUBE DE ASSINATURAS">CLUBE DE ASSINATURAS</span>
            </h2>
          </div>
          <p className="font-sans text-zinc-400 text-xs sm:text-sm md:text-base max-w-md text-left md:text-right leading-relaxed">
            Esqueça pagamentos avulsos. Mantenha o corte e a barba sempre impecáveis com nosso clube fechado, numa mensalidade só.
          </p>
        </motion.div>

        {/* Subtle instructions for carousel interaction - placed statically with safe spacing */}
        <div className="font-mono text-[8.5px] text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-6 md:mb-8 select-none pointer-events-none">
          <Sparkles className="w-3 h-3 text-brand-blue/70 animate-pulse" />
          <span>Arraste para os lados ou clique para ver cada plano</span>
        </div>

        {/* Outer 3D Carousel Stage - set to overflow-visible to prevent card cropping */}
        <div className={`relative w-full overflow-visible flex flex-col items-center justify-center select-none ${carouselHeightClass}`}>
          
          {/* Fluid Dynamic Ambient Glow Spotlight (under-cards) */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[350px] w-full max-w-[600px] mx-auto pointer-events-none z-0 overflow-visible">
            <motion.div
              animate={{
                x: activeIndex === 0 ? (isMobile ? "-28%" : "-44%") : activeIndex === 1 ? "0%" : (isMobile ? "28%" : "44%"),
                scale: [1, 1.05, 1],
                opacity: [0.55, 0.72, 0.55],
              }}
              transition={{
                x: { type: "spring", stiffness: 80, damping: 20 },
                scale: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                opacity: { repeat: Infinity, duration: 6, ease: "easeInOut" }
              }}
              style={{
                background:
                  activeIndex === 0
                    ? "radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(0,0,0,0) 70%)" // Ouro / âmbar
                    : activeIndex === 2
                    ? "radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(0,0,0,0) 70%)" // Diamante / ciano
                    : "radial-gradient(circle, rgba(203,213,225,0.18) 0%, rgba(0,0,0,0) 70%)", // Platina / prata
              }}
              className="glow-decor absolute left-[15%] right-[15%] top-0 bottom-0 blur-[60px] rounded-full"
            />
          </div>

          <div 
            className={`relative h-[85%] mt-6 ${carouselWidthClass}`}
            style={{ 
              perspective: "1400px", 
              transformStyle: "preserve-3d" 
            }}
          >
            {plans.map((plan, idx) => {
              const matchesSelection = activeIndex === idx;
              
              // Calculate index distance loop-safe [-1, 0, 1]
              let diff = idx - activeIndex;
              if (diff < -1) diff += plans.length;
              if (diff > 1) diff -= plans.length;

              // Orbital dynamic positions - wide spread to expose cards fully
              let xOffset = "0%";
              let rotY = 0;
              let zOffset = 50;
              let scaleVal = 1.0;
              let opacityVal = 1;

              if (diff === 0) {
                // Focus foreground card
                xOffset = "0%";
                rotY = 0;
                zOffset = isMobile ? 80 : 160;
                scaleVal = 1.04;
                opacityVal = 1;
              } else if (diff === 1) {
                // Orbital right hand card - widely spread so 40%+ of its visual space is exposed to the user
                xOffset = isMobile ? "54%" : isTablet ? "74%" : "84%";
                rotY = isMobile ? -18 : -28;
                zOffset = isMobile ? -80 : -130;
                scaleVal = isMobile ? 0.86 : 0.85;
                opacityVal = isMobile ? 0.48 : 0.58;
              } else if (diff === -1) {
                // Orbital left hand card - widely spread so 40%+ of its visual space is exposed to the user
                xOffset = isMobile ? "-54%" : isTablet ? "-74%" : "-84%";
                rotY = isMobile ? 18 : 28;
                zOffset = isMobile ? -80 : -130;
                scaleVal = isMobile ? 0.86 : 0.85;
                opacityVal = isMobile ? 0.48 : 0.58;
              }

              return (
                <motion.div
                  key={plan.id}
                  style={{
                    transformStyle: "preserve-3d",
                    pointerEvents: "auto"
                  }}
                  animate={{
                    translateX: xOffset,
                    rotateY: rotY,
                    translateZ: zOffset,
                    scale: scaleVal,
                    opacity: opacityVal,
                    zIndex: matchesSelection ? 30 : 15
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 110,
                    damping: 24,
                    mass: 0.7
                  }}
                  drag={matchesSelection ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.35}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleCardClick(idx)}
                  className="absolute inset-0 w-full h-full flex cursor-grab active:cursor-grabbing"
                >
                  <div className="w-full flex group/club h-full">
                    <div
                      className={`w-full bg-[#0e0e11] p-4 sm:p-5 md:p-6 flex flex-col justify-between text-left relative rounded-[20px] sm:rounded-[24px] transition-all duration-300 h-full overflow-hidden border-2 ${
                        matchesSelection
                          ? plan.activeBorder
                          : 'border-black/55 opacity-90 shadow-[0_4px_0_rgba(0,0,0,0.85)]'
                      }`}
                    >
                      {/* Contorno luminoso na cor do nível (card em foco) */}
                      {matchesSelection && (
                        <div className={`absolute inset-0 rounded-[20px] sm:rounded-[24px] pointer-events-none z-35 border ${plan.haloShadow}`} />
                      )}

                      {/* Glass Specular Gloss Highlight top layer */}
                      <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-white/[0.04] via-transparent to-transparent pointer-events-none rounded-t-[20px] sm:rounded-t-[24px]" />
                      <div className="absolute inset-[1px] rounded-[19px] sm:rounded-[23px] bg-gradient-to-tr from-transparent via-transparent to-white/[0.02] pointer-events-none" />

                      {/* Card Content Interior Details */}
                      <div className="space-y-2 sm:space-y-3 relative z-10 w-full">

                        {/* Header Row — mini-orbe do nível + selo de estado */}
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-2">
                            <TierOrb
                              gradient={plan.orbGradient}
                              glow={plan.orbGlow}
                              icon={
                                plan.tier === 'Ouro' ? <Award className="w-4 h-4" /> :
                                plan.tier === 'Platina' ? <Shield className="w-4 h-4" /> :
                                <Gem className="w-4 h-4" />
                              }
                            />
                            <span className={`font-mono text-[7px] sm:text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${plan.badgeBg}`}>
                              Nível {plan.tier}
                            </span>
                          </div>
                          {matchesSelection ? (
                            <span className={`font-mono text-[7px] sm:text-[8px] px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1 rounded shadow-sm border ${plan.activeBadge}`}>
                              <CheckCircle className="w-2.5 h-2.5 fill-current" />
                              Ativo
                            </span>
                          ) : plan.popular ? (
                            <span className="font-mono text-[7px] sm:text-[8px] bg-brand-cream text-black px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1 rounded border border-black/30">
                              <Flame className="w-2.5 h-2.5 fill-current" />
                              Mais procurado
                            </span>
                          ) : (
                            <span className="font-mono text-[6.5px] text-zinc-500 px-1 py-0.5 uppercase border border-zinc-800 rounded flex items-center gap-0.5">
                              <Eye className="w-2 h-2" /> Ver
                            </span>
                          )}
                        </div>

                        {/* Name & Tagline */}
                        <div className="space-y-0.5">
                          <h3 className={`font-toon text-lg sm:text-xl md:text-2xl tracking-wide uppercase transition-colors duration-300 drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] ${plan.textColor}`}>
                            {plan.name}
                          </h3>
                          <p className="font-sans text-[9.5px] sm:text-[10.5px] text-zinc-400 leading-snug font-normal min-h-[28px] max-h-[32px] overflow-hidden">
                            {plan.tagline}
                          </p>
                        </div>

                        {/* Price banner */}
                        <div className="py-1.5 border-y border-zinc-900/60 flex items-baseline gap-1" id={`price-display-${plan.id}`}>
                          <span className="font-sans text-zinc-500 text-[9px] sm:text-[10px] tracking-wider">R$</span>
                          <span className="font-display font-black text-xl sm:text-2xl md:text-3xl text-zinc-100 tracking-tight leading-none">
                            {plan.price}
                          </span>
                          <span className="font-sans text-zinc-500 text-[8.5px] sm:text-[9.5px] tracking-wide">/ {plan.period}</span>
                        </div>

                        {/* Benefits List */}
                        <ul className="space-y-1 sm:space-y-1.5 pt-0.5">
                          {plan.benefits.map((benefit, bIdx) => (
                            <li key={bIdx} className="flex gap-1.5 items-start text-[9.5px] sm:text-[10.5px] text-zinc-350">
                              <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/20 text-emerald-300">
                                <Check className="w-1.5 h-1.5" />
                              </div>
                              <span className="font-sans leading-normal text-zinc-300 truncate max-w-[210px] sm:max-w-none">{benefit}</span>
                            </li>
                          ))}
                        </ul>

                      </div>

                      {/* Submission triggers */}
                      <div className="mt-3 sm:mt-4 pt-2 border-t border-zinc-900/40 w-full relative z-10 font-sans">
                        <button
                          onClick={(e) => {
                            if (!matchesSelection) {
                              e.stopPropagation();
                              handleCardClick(idx);
                              return;
                            }
                            handleSubscribe(plan, e);
                          }}
                          className={`relative overflow-hidden w-full py-3 sm:py-3.5 btn-game btn-game-sm text-xs sm:text-sm uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 transform active:scale-[0.98] hover:scale-[1.02] border-2 border-black group/btn-subs hover:brightness-110 shadow-[0_5px_0_rgba(0,0,0,0.9),0_10px_24px_rgba(0,0,0,0.45)] active:translate-y-[3px] active:shadow-[0_2px_0_rgba(0,0,0,0.9)] ${plan.ctaBg}`}
                          aria-label={matchesSelection ? `Assinar o ${plan.name}` : `Ver o ${plan.name}`}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover/club:animate-shimmer" />
                          {matchesSelection ? (
                            plan.popular ? (
                              <>
                                <Crown className="w-3 h-3 fill-current" />
                                Assinar o {plan.name}
                              </>
                            ) : (
                              `Assinar o ${plan.name}`
                            )
                          ) : (
                            `Ver o ${plan.name}`
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Carousel Control indicators & left/right arrows */}
        <div className="flex items-center gap-5 mt-4 sm:mt-6 relative z-25">
          <button
            onClick={() => { prevSlide(); pokeRotation(); }}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 md:backdrop-blur-md text-slate-300 hover:text-white hover:border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Plano anterior"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>

          {/* Quick jump dots indicators */}
          <div className="flex gap-2">
            {plans.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleCardClick(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  activeIndex === idx 
                    ? 'w-6 bg-brand-blue shadow-[0_0_8px_rgba(43,79,184,0.6)]'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
                aria-label={`Visualizar plano ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => { nextSlide(); pokeRotation(); }}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 md:backdrop-blur-md text-slate-300 hover:text-white hover:border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Próximo plano"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Bottom trust seal */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 sm:mt-12 md:mt-14 glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 font-sans text-[10px] sm:text-xs text-slate-300 w-full md:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          <div className="flex items-center gap-2 text-left">
            <div className="w-5 h-5 rounded-full bg-brand-blue/10 border border-brand-blue/25 flex items-center justify-center text-brand-blue shrink-0">
              <Shield className="w-3 h-3" />
            </div>
            <span>Pagamento mensal seguro. Você pode cancelar quando quiser, sem taxas extras.</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-mono text-[9px] font-bold shrink-0">
            <Gift className="w-3 h-3 mr-0.5" />
            <span>BRINDE ESPECIAL ESTE MÊS</span>
          </div>
        </motion.div>

      </div>

      {/* Checkout de assinatura (overlay, tela única estilo street) */}
      <AnimatePresence>
        {checkoutPlan && (
          <PlanCheckout
            plan={{
              id: checkoutPlan.id,
              name: checkoutPlan.name,
              price: checkoutPlan.price,
              period: checkoutPlan.period,
              tagline: checkoutPlan.tagline,
              benefits: checkoutPlan.benefits,
            }}
            onClose={() => setCheckoutPlan(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
