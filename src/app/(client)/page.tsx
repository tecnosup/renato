"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Sparkle, ArrowDown, MapPin, Phone, ShieldCheck, Mail, ArrowUpRight, Award, Compass, Star, Camera, Video, MessageCircle, Share2 } from 'lucide-react';
import Header from '@/components/(client)/Header';
import ThreeDBox from '@/components/(client)/ThreeDBox';
import ThreeDText from '@/components/(client)/ThreeDText';
import BookingForm from '@/components/(client)/BookingForm';
import OrbCarousel from '@/components/(client)/OrbCarousel';
import Memberships from '@/components/(client)/Memberships';
import ShowcaseBanner from '@/components/(client)/ShowcaseBanner';
import ThreeDTiltCard from '@/components/(client)/ThreeDTiltCard';
import Toast from '@/components/(client)/Toast';
import { BARBERS } from '@/lib/data';

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Dispatches selected service ID to populate the physical form below and opens the modal
  const handleSelectServiceDirect = (serviceId: string) => {
    window.dispatchEvent(new CustomEvent('select-service', { detail: serviceId }));
    setIsBookingOpen(true);
  };

  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Listen to select-service-from-orb custom triggers to open modal automatically
  useEffect(() => {
    const handleOrbTrigger = () => {
      setIsBookingOpen(true);
    };
    window.addEventListener('select-service', handleOrbTrigger);
    return () => window.removeEventListener('select-service', handleOrbTrigger);
  }, []);

  // Monitor scroll height to conditionally reveal mobile floating CTA bar
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowStickyCTA(window.scrollY > 450);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#e2e2e2] antialiased overflow-x-hidden selection:bg-gold selection:text-black" id="main-layout">
      
      {/* Immersive Dark Refractive Background Layer */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1000&auto=format&fit=crop"
          alt="Aesthetic Dark Background"
          className="w-full h-full object-cover opacity-[0.06] grayscale"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#020202]/95 via-[#080808]/90 to-[#020202]/98" />
      </div>

      {/* Decorative Background Glows */}
      <div className="fixed top-[-10%] right-[-15%] w-[700px] h-[700px] bg-[#c2a35d]/5 rounded-full blur-[140px] pointer-events-none hidden md:block" id="decorative-glow-1"></div>
      <div className="absolute top-[35%] left-[-10%] w-[500px] h-[500px] bg-[#c2a35d]/3 rounded-full blur-[120px] pointer-events-none hidden md:block" id="decorative-glow-2"></div>
      <div className="fixed bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-gold/3 rounded-full blur-[130px] pointer-events-none hidden md:block" id="decorative-glow-3"></div>
      
      {/* Background Graphic Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" id="design-grid-overlay">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, #c2a35d 1px, transparent 0),
            linear-gradient(to right, #c2a35d 1.5px, transparent 1.5px),
            linear-gradient(to bottom, #c2a35d 1.5px, transparent 1.5px)
          `,
          backgroundSize: '40px 40px, 160px 160px, 160px 160px',
        }} />
      </div>

      {/* Primary Top Header */}
      <Header />
 
      {/* SECTION 1: HERO (With Booking Form CTA) */}
      <section className="relative min-h-[85vh] lg:min-h-[92vh] flex flex-col justify-center items-center px-4 md:px-8 pt-28 pb-10 sm:pt-36 sm:pb-16 md:pt-40 md:pb-20 z-10" id="hero-section">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-center relative">
          
          {/* Slogan Text Left (7 columns) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-20">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-sans text-[8.5px] text-[#c2a35d] uppercase tracking-[0.35em] mb-3 sm:mb-4 flex items-center gap-2.5 font-bold bg-[#c2a35d]/5 border border-[#c2a35d]/10 px-4.5 py-1.5 rounded-full"
            >
              <span className="inline-block w-1.5 h-1.5 bg-[#c2a35d] rounded-full" />
              SÃO PAULO • CLUBE HIGH-CLASS
            </motion.div>
 
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display font-light text-3xl sm:text-6xl xl:text-[74px] text-zinc-100 tracking-wide leading-[1.05] mb-4 sm:mb-8"
            >
              MAESTRIA EM<br/>
              <span className="text-[#c2a35d] font-serif italic font-light">Cada Corte</span>
            </motion.h1>
 
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="font-serif italic text-zinc-400 text-sm sm:text-base md:text-lg md:max-w-md mb-4 sm:mb-8 leading-relaxed font-light"
            >
              Uma experiência sob medida de autocuidado masculino combinada com a tradicional navalha italiana e alta harmonização estética do visagismo.
            </motion.p>
 
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="flex flex-col items-start gap-4 w-full"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto animate-fade-in">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="relative overflow-hidden h-12 sm:h-13 bg-linear-to-r from-[#ece4cb] to-[#c2a35d] text-slate-950 font-sans text-[10.5px] sm:text-xs font-black tracking-[0.15em] px-8 rounded-xl border border-transparent hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(194,163,93,0.3)] active:scale-[0.98] transform hover:scale-[1.01] group/hero-btn"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/hero-btn:animate-shimmer" />
                  AGENDAR ATENDIMENTO
                  <Scissors className="w-3.5 h-3.5 rotate-45 text-slate-950 group-hover/hero-btn:rotate-90 transition-transform duration-300" />
                </button>
                <a
                  href="#servicos"
                  className="h-12 sm:h-13 bg-transparent text-zinc-300 hover:text-white border border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/35 font-sans text-[10.5px] sm:text-xs font-bold tracking-[0.15em] px-8 rounded-xl transition-all duration-300 text-center flex items-center justify-center uppercase"
                >
                  Explorar Serviços
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[9px] text-zinc-500 font-semibold pl-1 select-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  AGENDAMENTO GARANTIDO EM 1 MINUTO
                </span>
                <span className="hidden sm:inline-block text-zinc-800">•</span>
                <span>PAGAMENTO REALIZADO APENAS NO SALÃO</span>
                <span className="hidden sm:inline-block text-zinc-800">•</span>
                <span className="text-gold/90 font-bold">REMANESCENTE: POUCAS VAGAS DISPONÍVEIS HOJE</span>
              </div>
            </motion.div>
          </div>

          {/* Majestic Interactive 3D Cube (5 columns, centered) */}
          <div className="lg:col-span-5 flex justify-center py-6 lg:py-0 select-none z-10" id="hero-cube-anchor">
            <ThreeDBox />
          </div>
        </div>
      </section>

      {/* SECTION 2: SOBRE NÓS (Manifesto + Filosofia de design) */}
      <section className="w-full bg-black/60 md:bg-black/40 md:backdrop-blur-md py-12 sm:py-20 md:py-24 px-4 md:px-8 border-t border-white/5 relative z-10 scroll-mt-20 md:scroll-mt-24" id="sobre-nos">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Parallax block 1: Manifesto */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 flex flex-col items-start text-left space-y-6"
            >
              <span className="font-sans text-[8px] text-[#c2a35d] tracking-[0.25em] font-bold uppercase bg-[#c2a35d]/5 px-3 py-1.5 rounded border border-[#c2a35d]/10">SÉCULO XXI • NOSSA ESSÊNCIA</span>
              
              <h2 className="font-display font-light text-3xl md:text-4xl text-[#faf9f6] tracking-wide leading-tight uppercase">
                A Precisão como <span className="font-serif italic text-[#c2a35d]">Forma de Arte</span>
              </h2>
              
              <p className="font-serif italic text-zinc-400 text-lg leading-relaxed font-light">
                "Na Século XXI, cada traço da navalha e cada ângulo da tesoura obedecem ao rigor de proporções refinadas e ao respeito fisionômico individual. Não oferecemos apenas cortes rápidos. Nós geramos uma assinatura visual de presença, distinção e elegância autoral."
              </p>

              <div className="space-y-4 pt-4 border-t border-gold/10 w-full">
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 border border-gold/30 flex items-center justify-center text-gold mt-1 shrink-0 rounded">
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="flex flex-col text-left">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#e2e2e2]">Higiene em Escala Cirúrgica</h4>
                    <p className="font-sans text-[11px] text-zinc-500 leading-normal font-normal">
                      Lâminas descartáveis de aço sueco e todos os insumos metálicos esterilizados em ciclo UV medicinal.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start border-t border-gold/10 pt-4">
                  <div className="w-5 h-5 border border-gold/30 flex items-center justify-center text-gold mt-1 shrink-0 rounded">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#e2e2e2]">Análise Visual Geométrica</h4>
                    <p className="font-sans text-[11px] text-zinc-500 leading-normal font-normal">
                      Cada fisionomia é estudada baseada em ângulos de maxilar e contraste ótico de sombras de barba.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 flex flex-col gap-6"
            >
              <ThreeDTiltCard intensity={6} className="w-full">
                <div className="glass-card p-8 md:p-10 text-left relative overflow-hidden rounded-3xl depth-card shadow-lg md:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.5)]">
                  <div className="absolute right-0 top-0 w-32 h-32 border-l border-b border-white/5 flex items-center justify-center font-sans text-[8px] text-[#c2a35d]/40 tracking-[0.16em] uppercase select-none font-bold">FILOSOFIA</div>
                  
                  <h3 className="font-display font-light text-xl text-white tracking-wide uppercase mb-4">
                    COMPROMISSO HISTÓRICO
                  </h3>
 
                  <p className="font-sans text-xs text-zinc-450 leading-relaxed font-normal mb-8 max-w-sm">
                    Nossos profissionais preservam as técnicas consagradas com dedicação exclusiva às proporções ideais de cada cliente. Um atendimento digno resgata a arte clássica e promove momentos saudáveis de cuidados pessoais em primeira classe.
                  </p>
 
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-900 font-sans text-[8.5px] font-bold text-[#c2a35d] tracking-widest uppercase">
                    <span className="bg-white/5 px-3 py-1.5 border border-white/5 rounded">TOALHAS AQUECIDAS &amp; ARRÔMAS</span>
                    <span className="bg-white/5 px-3 py-1.5 border border-white/5 rounded">CORTES AUTORAIS</span>
                    <span className="bg-white/5 px-3 py-1.5 border border-white/5 rounded">ATENDIMENTO V.I.P</span>
                  </div>
                </div>
              </ThreeDTiltCard>
 
              <div className="bg-black/30 md:backdrop-blur-sm p-4 border border-white/5 text-left font-sans text-[11px] text-zinc-400 leading-normal rounded-2xl md:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <span className="text-[#c2a35d] font-bold uppercase tracking-wider text-[10px] mr-1.5">COMPROMISSO NATURAL:</span>Trabalhamos exclusivamente com insumos orgânicos botânicos certificados de altíssimo desempenho, totalmente livres de essências sintéticas ou irritantes.
              </div>
            </motion.div>
 
          </div>
 


        </div>
      </section>

      {/* SECTION 3: SERVIÇOS E PRODUTOS (Circulativo OrbCarousel) */}
      <OrbCarousel />

      {/* Optional Beautiful Text ring separation block */}
      <ThreeDText />

      {/* SECTION 4: ASSINATURAS (Memberships) */}
      <Memberships />

      {/* SECTION 5: BANNER DE IMAGENS ESTÉTICAS & CORTES EM ALTA */}
      <ShowcaseBanner />

      {/* SECTION 6: FOOTER (With Social Medias redes sociais and contacts) */}
      <footer className="w-full bg-black/90 md:bg-black/80 md:backdrop-blur-3xl py-16 px-4 md:px-8 border-t border-white/10 relative z-30" id="footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start text-left">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 bg-[#c2a35d] text-black rounded-full flex items-center justify-center font-display font-medium shadow-md shadow-gold/5">
                <Scissors className="w-3.5 h-3.5" />
              </div>
              <span className="font-display font-light text-zinc-100 tracking-[0.16em] uppercase">SÉCULO <span className="text-[#c2a35d] font-serif italic">XXI</span></span>
            </div>
            
            <p className="font-sans text-xs text-zinc-550 leading-relaxed font-normal max-w-sm">
              Visagismo avançado, rituais térmicos aromatizados com óleos essenciais de eucalipto e atendimento estético redesenhados sob a ótica da alta-costura contemporânea masculina.
            </p>
 
            <div className="flex gap-3 pt-2" id="social-networks-block">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-[#c2a35d] hover:bg-[#c2a35d] hover:text-black flex items-center justify-center text-[#c2a35d] transition-all"
                aria-label="Siga o Século XXI no Instagram"
              >
                <Camera className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-[#c2a35d] hover:bg-[#c2a35d] hover:text-black flex items-center justify-center text-[#c2a35d] transition-all"
                aria-label="Assista nos no YouTube"
              >
                <Video className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/5511998765432" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-[#c2a35d] hover:bg-[#c2a35d] hover:text-black flex items-center justify-center text-[#c2a35d] transition-all animate-pulse"
                aria-label="Chame-nos no WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <button 
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('show-toast', {
                      detail: {
                        title: "COMPARTILHADO",
                        message: "Convite exclusivo para agendamento na Século XXI copiado com sucesso! Envie para seus contatos.",
                        type: "success"
                      }
                    })
                  );
                }}
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-[#c2a35d] hover:bg-[#c2a35d] hover:text-black flex items-center justify-center text-[#c2a35d] transition-all cursor-pointer"
                aria-label="Compartilhar link do salão"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
 
            <p className="font-sans text-[9px] text-[#c2a35d]/40 select-none pt-4 tracking-wider uppercase font-bold">
              © SÉCULO XXI ESTÉTICA S/A. TODOS OS DIREITOS RESERVADOS.
            </p>
          </div>

          {/* Quick Access Links */}
          <div className="md:col-span-2 space-y-3 font-display text-xs">
            <h4 className="font-mono text-[9px] text-[#c2a35d]/60 block uppercase tracking-widest font-bold">[LINKS_ACESSO]</h4>
            <ul className="space-y-2 font-medium text-zinc-400">
              <li><a href="#hero-section" className="hover:text-gold transition-colors">Início</a></li>
              <li><a href="#sobre-nos" className="hover:text-gold transition-colors">Sobre Nós & Manifesto</a></li>
              <li><a href="#servicos" className="hover:text-gold transition-colors">Serviços & Produtos</a></li>
              <li><a href="#assinaturas" className="hover:text-gold transition-colors">Assinaturas VIP</a></li>
              <li><a href="#portfolio" className="hover:text-gold transition-colors">Aesthetics & Cortes</a></li>
            </ul>
          </div>

          {/* Location details */}
          <div className="md:col-span-3 space-y-3 font-mono text-[10px] text-zinc-400">
            <h4 className="text-[9px] text-[#c2a35d]/60 block uppercase tracking-widest font-bold">[O_SALÃO_SÃO_PAULO]</h4>
            <div className="flex gap-2 items-start text-[11px] leading-relaxed">
              <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-sans font-semibold">Av. Brigadeiro Faria Lima, 4500</p>
                <p>Itaim Bibi (Templo Corporativo)</p>
                <p>São Paulo, SP</p>
              </div>
            </div>
            <div className="flex gap-2 items-center text-[11px] pt-1">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <a href="tel:+5511998765432" className="text-white font-sans font-medium hover:underline">+55 (11) 99876-5432</a>
            </div>
          </div>

          {/* Operating hours */}
          <div className="md:col-span-3 space-y-3 font-mono text-[10px] text-zinc-400">
            <h4 className="text-[9px] text-[#c2a35d]/60 block uppercase tracking-widest font-bold">[CRONOMETRAGEM]</h4>
            <div className="space-y-1">
              <div className="flex justify-between border-b border-gold/5 pb-1">
                <span>Segunda a Sábado</span>
                <span className="text-white">09h - 21h</span>
              </div>
              <div className="flex justify-between border-b border-gold/5 pb-1">
                <span>Domingo</span>
                <span className="text-zinc-650 font-bold text-zinc-600">Fechado</span>
              </div>
            </div>
            
            <div className="pt-2">
              <a
                href="#"
                className="text-[9px] uppercase hover:underline text-gold flex items-center gap-1 mt-4"
              >
                Voltar ao topo ↑
              </a>
            </div>
          </div>

        </div>
        
        {/* Bottom grid specs indicator row */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-650 font-sans text-[8px] select-none uppercase tracking-wider">
          <span>ATENDIMENTO PRIVADO EXCLUSIVAMENTE SOB AGENDAMENTO PRÉVIO VIA PLATAFORMA</span>
          <span className="bg-black px-3 py-1.5 text-[#c2a35d]/60 border border-zinc-850 font-bold rounded">SÉCULO XXI • SÃO PAULO</span>
        </div>
      </footer>

      {/* Mobile Sticky Floating CTA Bar for conversion fluidity */}
      <AnimatePresence>
        {showStickyCTA && !isBookingOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-[#070708]/95 border-t border-white/[0.06] px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.95)] max-w-full"
            id="mobile-sticky-cta"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col text-left">
                <span className="font-sans text-[7.5px] text-[#c2a35d] tracking-widest font-black uppercase">SÉCULO XXI</span>
                <span className="font-display font-light text-xs text-zinc-100 uppercase tracking-wide">Atendimento Hoje</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-mono text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider">Vagas Livres</span>
                </div>
              </div>
              
              <button
                onClick={() => setIsBookingOpen(true)}
                className="relative overflow-hidden bg-linear-to-r from-[#ece4cb] to-[#c2a35d] hover:opacity-90 active:scale-95 text-slate-950 font-sans text-[10px] font-black tracking-widest py-3.5 px-6 rounded-xl flex items-center gap-2.5 shadow-[0_0_20px_rgba(194,163,93,0.3)] cursor-pointer"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full animate-shimmer" />
                AGENDAR AGORA
                <Scissors className="w-3.5 h-3.5 rotate-45 text-slate-950" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Scheduling Hub Overlay BookingForm Dialog */}
      <AnimatePresence>
        {isBookingOpen && (
          <BookingForm 
            isOpen={isBookingOpen} 
            onClose={() => setIsBookingOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Global Success Feedback Toast */}
      <Toast />

    </div>
  );
}
