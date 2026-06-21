"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Sparkle, ArrowDown, MapPin, Phone, ShieldCheck, Mail, ArrowUpRight, Award, Camera, Video, MessageCircle, Share2 } from 'lucide-react';
import Header from '@/components/(client)/Header';
import ThreeDText from '@/components/(client)/ThreeDText';
import JornadaSobre from '@/components/(client)/JornadaSobre';
import BookingForm from '@/components/(client)/BookingForm';
import OrbCarousel from '@/components/(client)/OrbCarousel';
import Memberships from '@/components/(client)/Memberships';
import ShowcaseBanner from '@/components/(client)/ShowcaseBanner';
import LocationMap from '@/components/(client)/LocationMap';
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
    <div className="landing-fonts relative min-h-screen bg-[#050505] text-[#e2e2e2] antialiased overflow-x-hidden selection:bg-gold selection:text-black" id="main-layout">
      
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

      {/* Decorative Background Glows — tricolor da marca (azul + vermelho) */}
      <div className="fixed top-[-10%] right-[-15%] w-[700px] h-[700px] bg-brand-blue/8 rounded-full blur-[140px] pointer-events-none hidden md:block" id="decorative-glow-1"></div>
      <div className="absolute top-[35%] left-[-10%] w-[500px] h-[500px] bg-brand-red/6 rounded-full blur-[120px] pointer-events-none hidden md:block" id="decorative-glow-2"></div>
      <div className="fixed bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-gold/4 rounded-full blur-[130px] pointer-events-none hidden md:block" id="decorative-glow-3"></div>
      
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
 
      {/* SECTION 1: HERO — 2 colunas (texto à esquerda + personagem 3D à direita) sobre fundo claro */}
      <section className="relative isolate min-h-[92vh] flex flex-col justify-center px-5 md:px-8 pt-32 pb-12 sm:pt-36 sm:pb-16 z-10 overflow-hidden" id="hero-section">
        {/* Fundo do hero: parede de tijolinhos (cobre o background escuro global) */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: "url('/img/fundohero.jpeg')" }}
        />
        {/* Overlay escuro (parede à noite) para contraste do texto claro */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_35%_30%,rgba(8,8,10,0.78)_0%,rgba(5,5,7,0.86)_55%,rgba(2,2,3,0.94)_100%)]" />
        {/* Glows tricolor suaves */}
        <div className="absolute top-[8%] left-[8%] w-[420px] h-[420px] bg-brand-red/15 rounded-full blur-[130px] -z-10 pointer-events-none" />
        <div className="absolute bottom-[6%] right-[6%] w-[460px] h-[460px] bg-brand-blue/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
        {/* Fade da base: dissolve os tijolos no dark da próxima seção (#0a0a0c) */}
        <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 -z-10 pointer-events-none bg-gradient-to-b from-transparent to-[#0a0a0c]" />

        <div className="max-w-7xl w-full mx-auto grid grid-cols-12 gap-3 sm:gap-6 items-center">

          {/* COLUNA ESQUERDA — conteúdo */}
          <div className="col-span-7 flex flex-col items-start text-left">

            {/* Logo */}
            <motion.img
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              src="/img/logo.png"
              alt="Barbearia Século XXI"
              className="w-full max-w-[280px] sm:max-w-[440px] lg:max-w-[520px] h-auto object-contain select-none drop-shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
              loading="eager"
              decoding="async"
            />

            {/* Headline com underline pontilhado vermelho */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display font-medium text-lg sm:text-3xl xl:text-5xl text-zinc-50 tracking-tight leading-[1.05] mt-3 sm:mt-6 pb-2 sm:pb-3 border-b-2 border-dotted border-brand-red"
            >
              MAESTRIA EM <span className="font-serif italic font-semibold bg-gradient-to-r from-brand-red to-brand-blue bg-clip-text text-transparent">Cada Corte</span>
            </motion.h1>

            {/* Parágrafo curto */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-serif italic text-zinc-300 text-[11px] sm:text-base max-w-md mt-3 mb-5 sm:mt-5 sm:mb-8 leading-snug sm:leading-relaxed font-light"
            >
              Uma experiência sob medida de autocuidado masculino com a tradicional navalha italiana e alta harmonização estética do visagismo.
            </motion.p>

            {/* Dois botões empilhados — gradientes invertidos */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col items-stretch gap-2.5 sm:gap-3.5 w-full max-w-sm"
            >
              <button
                onClick={() => setIsBookingOpen(true)}
                className="relative overflow-hidden h-10 sm:h-13 bg-linear-to-r from-brand-red to-brand-blue text-white font-sans text-[11px] sm:text-sm font-black tracking-[0.12em] rounded-xl sm:rounded-2xl border border-white/10 hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_24px_rgba(43,79,184,0.28)] active:scale-[0.98] hover:scale-[1.01] group/hero-btn uppercase"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/hero-btn:animate-shimmer" />
                Agendar
                <Scissors className="w-3.5 h-3.5 rotate-45 text-white group-hover/hero-btn:rotate-90 transition-transform duration-300" />
              </button>
              <a
                href="#servicos"
                className="relative overflow-hidden h-10 sm:h-13 bg-linear-to-r from-brand-blue to-brand-red text-white font-sans text-[11px] sm:text-sm font-black tracking-[0.12em] rounded-xl sm:rounded-2xl border border-white/10 hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(226,58,46,0.24)] active:scale-[0.98] hover:scale-[1.01] uppercase"
              >
                Serviços / Produtos
              </a>
            </motion.div>

            {/* Selos de confiança — escondidos no mobile (sem espaço com 2 colunas) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hidden sm:flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 font-mono text-[9px] text-zinc-400 font-semibold mt-7 select-none"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                AGENDAMENTO EM 1 MINUTO
              </span>
              <span className="hidden sm:inline-block text-zinc-600">•</span>
              <span>PAGAMENTO APENAS NO SALÃO</span>
              <span className="hidden sm:inline-block text-zinc-600">•</span>
              <span className="text-brand-red font-bold">POUCAS VAGAS HOJE</span>
            </motion.div>
          </div>

          {/* COLUNA DIREITA — personagem 3D do Renato com sombra CSS + float */}
          <div className="col-span-5 flex justify-center items-end select-none" id="hero-character-anchor">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center"
            >
              {/* Sombra CSS no chão (estática) */}
              <div
                aria-hidden="true"
                className="absolute bottom-1 w-[55%] h-4 sm:h-5 bg-black/40 rounded-[100%] blur-md"
              />
              {/* Personagem (sem animação) */}
              <img
                src="/img/personagemrenato.png"
                alt="Renato — Barbearia Século XXI"
                className="relative z-10 w-full h-auto max-h-[42vh] sm:max-h-[56vh] lg:max-h-[72vh] object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)]"
                loading="eager"
                decoding="async"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SOBRE A SÉCULO XXI — jornada Missão/Visão/Valores com trilha 3D */}
      <JornadaSobre />

      {/* SECTION 3: SERVIÇOS E PRODUTOS (Circulativo OrbCarousel) */}
      <OrbCarousel />

      {/* Optional Beautiful Text ring separation block */}
      <ThreeDText />

      {/* SECTION 4: ASSINATURAS (Memberships) */}
      <Memberships />

      {/* SECTION 5: BANNER DE IMAGENS ESTÉTICAS & CORTES EM ALTA */}
      <ShowcaseBanner />

      {/* SECTION 6: LOCALIZAÇÃO (Mapa travado → abre Google Maps) */}
      <LocationMap />

      {/* SECTION 7: FOOTER (With Social Medias redes sociais and contacts) */}
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
                href="https://wa.me/5512996555081"
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
              <li><a href="#localizacao" className="hover:text-gold transition-colors">Como Chegar</a></li>
            </ul>
          </div>

          {/* Location details */}
          <div className="md:col-span-3 space-y-3 font-mono text-[10px] text-zinc-400">
            <h4 className="text-[9px] text-[#c2a35d]/60 block uppercase tracking-widest font-bold">[O_SALÃO_SÃO_PAULO]</h4>
            <div className="flex gap-2 items-start text-[11px] leading-relaxed">
              <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-sans font-semibold">R. Dr. José Rodrigues Alves Sobrinho, 351</p>
                <p>Vila Paulo Romeu</p>
                <p>Cruzeiro, SP • 12710-410</p>
              </div>
            </div>
            <div className="flex gap-2 items-center text-[11px] pt-1">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <a href="tel:+5512996555081" className="text-white font-sans font-medium hover:underline">+55 (12) 99655-5081</a>
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
          <span className="bg-black px-3 py-1.5 text-[#c2a35d]/60 border border-zinc-850 font-bold rounded">SÉCULO XXI • CRUZEIRO/SP</span>
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
