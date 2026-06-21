"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Check, Gift, Crown, Flame, CheckCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import ThreeDTiltCard from './ThreeDTiltCard';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  tier: 'Silver' | 'Gold' | 'Black';
  popular: boolean;
  tagline: string;
  benefits: string[];
  gradient: string;
  borderColor: string;
  badgeBg: string;
  textColor: string;
}

export default function Memberships() {
  const [activeIndex, setActiveIndex] = useState<number>(1); // Start with Club Royal (index 1)
  const autoRotateTimer = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [windowWidth, setWindowWidth] = useState<number>(1200);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const plans: Plan[] = [
    {
      id: "silver-club",
      name: "Plano Executivo",
      price: 140,
      period: "mês",
      tier: "Silver",
      popular: false,
      tagline: "Para quem corta o cabelo a cada 15 dias.",
      benefits: [
        "2 cortes por mês",
        "Lavagem de cabelo com massagem relaxante",
        "Atendimento com o barbeiro que você escolher",
        "Finalização com pomadas de qualidade",
        "Pode cancelar quando quiser, sem multa"
      ],
      gradient: "from-zinc-950/98 via-zinc-900 to-zinc-950/98",
      borderColor: "border-zinc-800",
      badgeBg: "bg-zinc-900 text-zinc-400 border-zinc-800/60",
      textColor: "text-zinc-100 group-hover/club:text-slate-350"
    },
    {
      id: "gold-club",
      name: "Plano Ouro",
      price: 240,
      period: "mês",
      tier: "Gold",
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
      gradient: "from-[#0d0d0a] via-zinc-950 to-[#0d0d0a]",
      borderColor: "border-[#c8ccd4]/20",
      badgeBg: "bg-[#c8ccd4]/5 text-[#c8ccd4] border-[#c8ccd4]/10",
      textColor: "text-white group-hover/club:text-[#c8ccd4]"
    },
    {
      id: "dark-club",
      name: "Plano Lendário",
      price: 360,
      period: "mês",
      tier: "Black",
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
      gradient: "from-[#08090a]/95 via-zinc-950 to-[#08090a]/95",
      borderColor: "border-zinc-900",
      badgeBg: "bg-purple-900/5 text-purple-400 border-purple-500/10",
      textColor: "text-zinc-100 group-hover/club:text-purple-300"
    }
  ];

  const handleSubscribe = (planName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering slide change
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: {
          title: "SOLICITAÇÃO RECEBIDA",
          message: `Seu interesse no "${planName}" da Século XXI foi registrado. Prossiga com o agendamento de sua simulação ou fale conosco diretamente via WhatsApp para ativação imediata.`,
          type: "success"
        }
      })
    );
  };

  // Safe cyclic index manipulation
  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % plans.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + plans.length) % plans.length);
  };

  // Manage slow motion automatic rotation in background when inactive
  const resetAutoRotateTimer = () => {
    if (autoRotateTimer.current) {
      clearInterval(autoRotateTimer.current);
    }
    autoRotateTimer.current = setInterval(() => {
      nextSlide();
    }, 8000); // Very gentle 8-second rotation
  };

  useEffect(() => {
    resetAutoRotateTimer();
    return () => {
      if (autoRotateTimer.current) clearInterval(autoRotateTimer.current);
    };
  }, []);

  const handleCardClick = (idx: number) => {
    if (activeIndex !== idx) {
      setActiveIndex(idx);
      resetAutoRotateTimer();
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      nextSlide();
      resetAutoRotateTimer();
    } else if (info.offset.x > threshold) {
      prevSlide();
      resetAutoRotateTimer();
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
      className="w-full bg-[#0b0b0d] bg-tijolo py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12 border-t-2 border-black relative overflow-hidden scroll-mt-20 md:scroll-mt-24"
      id="assinaturas"
    >
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
          <p className="font-serif italic text-zinc-400 text-xs sm:text-sm md:text-base max-w-md text-left md:text-right leading-relaxed">
            Esqueça pagamentos unitários. Mantenha seu corte e barba rigorosamente impecáveis com nosso clube fechado em parcelas recorrentes.
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
                background: activeIndex === 2 
                  ? "radial-gradient(circle, rgba(147,51,234,0.18) 0%, rgba(0,0,0,0) 70%)" // Black/Purple vibe for Club Legend
                  : "radial-gradient(circle, rgba(200, 204, 212,0.18) 0%, rgba(0,0,0,0) 70%)", // Gold vibe for Royal / Silver
              }}
              className="absolute left-[15%] right-[15%] top-0 bottom-0 blur-[60px] rounded-full"
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
              let isBlurVal = "blur(0px)";

              if (diff === 0) {
                // Focus foreground card
                xOffset = "0%";
                rotY = 0;
                zOffset = isMobile ? 80 : 160;
                scaleVal = 1.04;
                opacityVal = 1;
                isBlurVal = "blur(0px)";
              } else if (diff === 1) {
                // Orbital right hand card - widely spread so 40%+ of its visual space is exposed to the user
                xOffset = isMobile ? "54%" : isTablet ? "74%" : "84%";
                rotY = isMobile ? -18 : -28;
                zOffset = isMobile ? -80 : -130;
                scaleVal = isMobile ? 0.86 : 0.85;
                opacityVal = isMobile ? 0.48 : 0.58;
                isBlurVal = isMobile ? "blur(0.5px)" : "blur(0.8px)";
              } else if (diff === -1) {
                // Orbital left hand card - widely spread so 40%+ of its visual space is exposed to the user
                xOffset = isMobile ? "-54%" : isTablet ? "-74%" : "-84%";
                rotY = isMobile ? 18 : 28;
                zOffset = isMobile ? -80 : -130;
                scaleVal = isMobile ? 0.86 : 0.85;
                opacityVal = isMobile ? 0.48 : 0.58;
                isBlurVal = isMobile ? "blur(0.5px)" : "blur(0.8px)";
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
                    filter: isBlurVal,
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
                  <ThreeDTiltCard intensity={matchesSelection ? 4 : 0} className="w-full flex group/club h-full">
                    <div 
                      className={`w-full bg-[#0e0e11] p-4 sm:p-5 md:p-6 flex flex-col justify-between text-left relative rounded-xl transition-all duration-300 h-full overflow-hidden border-2 ${
                        matchesSelection
                          ? 'border-[#c8ccd4] shadow-[0_6px_0_rgba(0,0,0,0.9),0_14px_34px_rgba(0,0,0,0.6)]'
                          : 'border-[#f0ebe4]/40 opacity-90 shadow-[0_4px_0_rgba(0,0,0,0.8)]'
                      }`}
                    >
                      {/* Luxe Golden Contour Highlight for Selected card */}
                      {matchesSelection && (
                        <div className="absolute inset-0 rounded-[20px] sm:rounded-[24px] pointer-events-none z-35 border border-[#c8ccd4]/30 shadow-[0_0_15px_rgba(200, 204, 212,0.1)]" />
                      )}

                      {/* Glass Specular Gloss Highlight top layer */}
                      <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-white/[0.03] via-transparent to-transparent pointer-events-none rounded-t-[20px] sm:rounded-t-[24px]" />
                      <div className="absolute inset-[1px] rounded-[19px] sm:rounded-[23px] bg-gradient-to-tr from-transparent via-transparent to-white/[0.015] pointer-events-none" />

                      {/* Card Content Interior Details */}
                      <div className="space-y-2 sm:space-y-3 relative z-10 w-full">
                        
                        {/* Header Row */}
                        <div className="flex justify-between items-center gap-2">
                          <span className={`font-mono text-[7px] sm:text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase ${plan.badgeBg}`}>
                            Nível {plan.tier === 'Silver' ? 'Prata' : plan.tier === 'Gold' ? 'Ouro' : 'Preto'}
                          </span>
                          {matchesSelection ? (
                            <span className="font-mono text-[7px] sm:text-[8px] bg-gradient-to-r from-amber-500 to-[#c8ccd4] text-zinc-950 px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1 rounded shadow-sm">
                              <CheckCircle className="w-2.5 h-2.5 fill-current" />
                              Ativo
                            </span>
                          ) : plan.popular ? (
                            <span className="font-mono text-[7px] sm:text-[8px] bg-[#c8ccd4] text-black px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1 rounded">
                              <Flame className="w-2.5 h-2.5 fill-current" />
                              Desejado
                            </span>
                          ) : (
                            <span className="font-mono text-[6.5px] text-zinc-500 px-1 py-0.5 uppercase border border-zinc-800 rounded flex items-center gap-0.5">
                              <Eye className="w-2 h-2" /> Ver
                            </span>
                          )}
                        </div>

                        {/* Name & Tagline */}
                        <div className="space-y-0.5">
                          <h3 className={`font-display font-black text-base sm:text-lg md:text-xl tracking-wide uppercase transition-colors duration-300 ${plan.textColor}`}>
                            {plan.name}
                          </h3>
                          <p className="font-sans text-[9.5px] sm:text-[10.5px] text-zinc-400 leading-snug font-normal min-h-[28px] max-h-[32px] overflow-hidden">
                            {plan.tagline}
                          </p>
                        </div>

                        {/* Price banner */}
                        <div className="py-1.5 border-y border-zinc-900/60 flex items-baseline gap-1" id={`price-display-${plan.id}`}>
                          <span className="font-sans text-zinc-500 text-[9px] sm:text-[10px] tracking-wider">R$</span>
                          <span className="font-display font-light text-xl sm:text-2xl md:text-3xl text-zinc-100 tracking-tight leading-none">
                            {plan.price}
                          </span>
                          <span className="font-sans text-zinc-500 text-[8.5px] sm:text-[9.5px] tracking-wide">/ {plan.period}</span>
                        </div>

                        {/* Benefits List */}
                        <ul className="space-y-1 sm:space-y-1.5 pt-0.5">
                          {plan.benefits.map((benefit, bIdx) => (
                            <li key={bIdx} className="flex gap-1.5 items-start text-[9.5px] sm:text-[10.5px] text-zinc-350">
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                  plan.popular 
                                    ? 'bg-[#c8ccd4]/20 text-[#c8ccd4]' 
                                    : 'bg-white/10 text-slate-300'
                                }`}>
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
                            handleSubscribe(plan.name, e);
                          }}
                          className="relative overflow-hidden w-full py-3 sm:py-3.5 btn-game btn-game-sm text-xs sm:text-sm uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 transform active:scale-[0.98] hover:scale-[1.02] border-2 border-black/55 group/btn-subs bg-[linear-gradient(135deg,#5a93de_0%,#2f5f8f_42%,#c41f16_70%,#e23a2e_100%)] hover:brightness-110 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                          aria-label={matchesSelection ? `Assinar o ${plan.name}` : `Ver o ${plan.name}`}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover/club:animate-shimmer" />
                          {matchesSelection ? (
                            plan.popular ? (
                              <>
                                <Crown className="w-3 h-3 fill-current" />
                                Assinar o Plano Ouro
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
                  </ThreeDTiltCard>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Carousel Control indicators & left/right arrows */}
        <div className="flex items-center gap-5 mt-4 sm:mt-6 relative z-25">
          <button
            onClick={() => { prevSlide(); resetAutoRotateTimer(); }}
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
            onClick={() => { nextSlide(); resetAutoRotateTimer(); }}
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
    </section>
  );
}
