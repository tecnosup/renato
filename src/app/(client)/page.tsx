"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Sparkle, ArrowDown, MapPin, Phone, ShieldCheck, Mail, ArrowUpRight, Award, Camera, Video, MessageCircle, Share2, Users, Lock, Check, X } from 'lucide-react';
import Header from '@/components/(client)/Header';
import Reveal from '@/components/(client)/Reveal';
import ThreeDText from '@/components/(client)/ThreeDText';
import JornadaSobre from '@/components/(client)/JornadaSobre';
import BookingForm from '@/components/(client)/BookingForm';
import OrbCarousel from '@/components/(client)/OrbCarousel';
import Memberships from '@/components/(client)/Memberships';
import ShowcaseBanner from '@/components/(client)/ShowcaseBanner';
import LocationMap from '@/components/(client)/LocationMap';
import Toast from '@/components/(client)/Toast';
import { BARBERS } from '@/lib/data';

// Barbeiros do hero. Só o Renato tem personagem 3D pronto; os demais entram
// como "sombra bloqueada" (cadeado + Em breve) até o Abraão criar os personagens.
const HERO_BARBERS = [
  { id: 'renato', name: 'Renato', role: 'Dono & Barbeiro', img: '/img/personagemrenato.webp', locked: false },
  { id: 'barbeiro-2', name: 'Em breve', role: 'Novo barbeiro', img: null, locked: true },
  { id: 'barbeiro-3', name: 'Em breve', role: 'Novo barbeiro', img: null, locked: true },
] as const;

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeBarberId, setActiveBarberId] = useState<string>('renato');
  const [isBarberPickerOpen, setIsBarberPickerOpen] = useState(false);
  const activeBarber = HERO_BARBERS.find((b) => b.id === activeBarberId) ?? HERO_BARBERS[0];

  // Dispatches selected service ID to populate the physical form below and opens the modal
  const handleSelectServiceDirect = (serviceId: string) => {
    window.dispatchEvent(new CustomEvent('select-service', { detail: serviceId }));
    setIsBookingOpen(true);
  };

  const [showStickyCTA, setShowStickyCTA] = useState(false);
  // Algum overlay/checkout aberto? A barra fixa "Agendar Agora" recua para não tapá-lo.
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Listen to select-service-from-orb custom triggers to open modal automatically
  useEffect(() => {
    const handleOrbTrigger = () => {
      setIsBookingOpen(true);
    };
    window.addEventListener('select-service', handleOrbTrigger);
    return () => window.removeEventListener('select-service', handleOrbTrigger);
  }, []);

  // Recolhe a barra fixa "Agendar Agora" enquanto um overlay (ex: checkout) está aberto
  useEffect(() => {
    const handleOverlay = (e: Event) => {
      setIsOverlayOpen(Boolean((e as CustomEvent).detail));
    };
    window.addEventListener('overlay-open', handleOverlay);
    return () => window.removeEventListener('overlay-open', handleOverlay);
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
    <div className="landing-fonts relative min-h-screen bg-[#050505] text-[#e2e2e2] antialiased overflow-x-hidden selection:bg-[#c8ccd4] selection:text-black" id="main-layout">
      
      {/* Base escura global — a textura de tijolo agora vem por seção (.bg-tijolo). */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none bg-[#0a0a0b]" />

      {/* Decorative Background Glows — tricolor da marca (azul + vermelho) */}
      <div className="fixed top-[-10%] right-[-15%] w-[700px] h-[700px] bg-brand-blue/8 rounded-full blur-[140px] pointer-events-none hidden md:block" id="decorative-glow-1"></div>
      <div className="absolute top-[35%] left-[-10%] w-[500px] h-[500px] bg-brand-red/6 rounded-full blur-[120px] pointer-events-none hidden md:block" id="decorative-glow-2"></div>
      <div className="fixed bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-[#c8ccd4]/4 rounded-full blur-[130px] pointer-events-none hidden md:block" id="decorative-glow-3"></div>
      
      {/* Background Graphic Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" id="design-grid-overlay">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, #c8ccd4 1px, transparent 0),
            linear-gradient(to right, #c8ccd4 1.5px, transparent 1.5px),
            linear-gradient(to bottom, #c8ccd4 1.5px, transparent 1.5px)
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
          style={{ backgroundImage: "url('/img/fundohero.webp')" }}
        />
        {/* Overlay escuro (parede à noite) para contraste do texto claro */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_35%_30%,rgba(8,8,10,0.78)_0%,rgba(5,5,7,0.86)_55%,rgba(2,2,3,0.94)_100%)]" />
        {/* Glows tricolor suaves — escondidos no mobile (blur gigante pesa no GPU
            de aparelhos antigos; o overlay radial já dá a ambiência). */}
        <div className="hidden md:block absolute top-[8%] left-[8%] w-[420px] h-[420px] bg-brand-red/15 rounded-full blur-[130px] -z-10 pointer-events-none" />
        <div className="hidden md:block absolute bottom-[6%] right-[6%] w-[460px] h-[460px] bg-brand-blue/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
        {/* Fade da base: dissolve os tijolos no dark da próxima seção (#0a0a0c) */}
        <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 -z-10 pointer-events-none bg-gradient-to-b from-transparent to-[#0a0a0c]" />

        <div className="max-w-7xl w-full mx-auto grid grid-cols-12 gap-3 sm:gap-6 items-center">

          {/* COLUNA ESQUERDA — conteúdo */}
          <div className="col-span-7 flex flex-col items-start text-left">

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[280px] sm:max-w-[440px] lg:max-w-[520px] select-none"
            >
              <Image
                src="/img/logo.webp"
                alt="Barbearia Século XXI"
                width={1200}
                height={427}
                priority
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 440px, 520px"
                className="w-full h-auto object-contain drop-shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
              />
            </motion.div>

            {/* Headline com underline pontilhado vermelho */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display font-medium text-lg sm:text-3xl xl:text-5xl text-zinc-50 tracking-tight leading-[1.05] mt-3 sm:mt-6 pb-2 sm:pb-3 border-b-2 border-dotted border-brand-red"
            >
              MAESTRIA EM <span className="font-toon text-logo-3d" data-text="Cada Corte">Cada Corte</span>
            </motion.h1>

            {/* Parágrafo curto */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-serif italic text-zinc-300 text-[11px] sm:text-base max-w-md mt-3 mb-5 sm:mt-5 sm:mb-8 leading-snug sm:leading-relaxed font-light"
            >
              Corte e barba feitos com capricho e a barba na navalha, do jeito tradicional. Um visual que combina com você.
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
                className="relative overflow-hidden h-12 sm:h-15 bg-[linear-gradient(135deg,#5a93de_0%,#2f5f8f_42%,#c41f16_70%,#e23a2e_100%)] font-graffiti text-base sm:text-xl rounded-xl sm:rounded-2xl border-2 border-black/60 hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.45)] active:scale-[0.98] hover:scale-[1.01] group/hero-btn uppercase"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/hero-btn:animate-shimmer" />
                Agendar
                <Scissors className="w-3.5 h-3.5 rotate-45 text-[#f0ebe4] group-hover/hero-btn:rotate-90 transition-transform duration-300" />
              </button>
              <a
                href="#servicos"
                className="relative overflow-hidden h-12 sm:h-15 bg-[linear-gradient(135deg,#5a93de_0%,#2f5f8f_42%,#c41f16_70%,#e23a2e_100%)] font-graffiti text-sm sm:text-lg rounded-xl sm:rounded-2xl border-2 border-black/60 hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)] active:scale-[0.98] hover:scale-[1.01] uppercase"
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

          {/* COLUNA DIREITA — personagem 3D maior + seletor "Trocar Barbeiro" */}
          <div className="col-span-5 flex justify-center items-end select-none" id="hero-character-anchor">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center w-full"
            >
              {/* Badge "Trocar Barbeiro" sobre o personagem */}
              <button
                type="button"
                onClick={() => setIsBarberPickerOpen(true)}
                className="relative z-20 mb-2 sm:mb-3 flex items-center gap-1.5 bg-black/70 md:backdrop-blur-sm border-2 border-[#c8ccd4]/40 hover:border-[#c8ccd4] text-[#f0ebe4] hover:text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full font-mono text-[7.5px] sm:text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer active:scale-95 shadow-[0_3px_0_rgba(0,0,0,0.85)]"
                aria-label="Trocar barbeiro"
              >
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c8ccd4]" />
                Trocar Barbeiro
              </button>

              {/* Sombra CSS no chão (estática) */}
              <div
                aria-hidden="true"
                className="absolute bottom-1 w-[55%] h-4 sm:h-5 bg-black/40 rounded-[100%] blur-md"
              />
              {/* Personagem ativo — maior que antes */}
              <Image
                src={activeBarber.img ?? '/img/personagemrenato.webp'}
                alt={`${activeBarber.name} — Barbearia Século XXI`}
                width={220}
                height={567}
                priority
                sizes="(max-width: 640px) 48vw, (max-width: 1024px) 36vw, 30vw"
                className="relative z-10 w-full h-auto max-h-[50vh] sm:max-h-[66vh] lg:max-h-[82vh] object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)]"
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
          <Reveal as="div" className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 bg-[#c8ccd4] text-black rounded-full flex items-center justify-center font-display font-medium shadow-md shadow-[#c8ccd4]/5">
                <Scissors className="w-3.5 h-3.5" />
              </div>
              <span className="font-display font-light text-zinc-100 tracking-[0.16em] uppercase">SÉCULO <span className="text-[#c8ccd4] font-serif italic">XXI</span></span>
            </div>
            
            <p className="font-sans text-xs text-zinc-550 leading-relaxed font-normal max-w-sm">
              Corte, barba e cuidados masculinos com capricho e atendimento de primeira. Tradição e estilo moderno em Cruzeiro.
            </p>
 
            <div className="flex gap-3 pt-2" id="social-networks-block">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-[#c8ccd4] hover:bg-[#c8ccd4] hover:text-black flex items-center justify-center text-[#c8ccd4] transition-all"
                aria-label="Siga o Século XXI no Instagram"
              >
                <Camera className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-[#c8ccd4] hover:bg-[#c8ccd4] hover:text-black flex items-center justify-center text-[#c8ccd4] transition-all"
                aria-label="Assista nos no YouTube"
              >
                <Video className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/5512996555081"
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-[#c8ccd4] hover:bg-[#c8ccd4] hover:text-black flex items-center justify-center text-[#c8ccd4] transition-all animate-pulse"
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
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-[#c8ccd4] hover:bg-[#c8ccd4] hover:text-black flex items-center justify-center text-[#c8ccd4] transition-all cursor-pointer"
                aria-label="Compartilhar link do salão"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
 
            <p className="font-sans text-[9px] text-[#c8ccd4]/40 select-none pt-4 tracking-wider uppercase font-bold">
              © SÉCULO XXI ESTÉTICA S/A. TODOS OS DIREITOS RESERVADOS.
            </p>
          </Reveal>

          {/* Quick Access Links */}
          <Reveal as="div" delay={80} className="md:col-span-2 space-y-3 font-display text-xs">
            <h4 className="font-mono text-[9px] text-[#c8ccd4]/60 block uppercase tracking-widest font-bold">LINKS</h4>
            <ul className="space-y-2 font-medium text-zinc-400">
              <li><a href="#hero-section" className="hover:text-[#c8ccd4] transition-colors">Início</a></li>
              <li><a href="#sobre-nos" className="hover:text-[#c8ccd4] transition-colors">Sobre Nós</a></li>
              <li><a href="#servicos" className="hover:text-[#c8ccd4] transition-colors">Serviços & Produtos</a></li>
              <li><a href="#assinaturas" className="hover:text-[#c8ccd4] transition-colors">Assinaturas</a></li>
              <li><a href="#portfolio" className="hover:text-[#c8ccd4] transition-colors">Nossos Cortes</a></li>
              <li><a href="#localizacao" className="hover:text-[#c8ccd4] transition-colors">Como Chegar</a></li>
            </ul>
          </Reveal>

          {/* Location details */}
          <Reveal as="div" delay={160} className="md:col-span-3 space-y-3 font-mono text-[10px] text-zinc-400">
            <h4 className="text-[9px] text-[#c8ccd4]/60 block uppercase tracking-widest font-bold">O SALÃO</h4>
            <div className="flex gap-2 items-start text-[11px] leading-relaxed">
              <MapPin className="w-4 h-4 text-[#c8ccd4] shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-sans font-semibold">R. Dr. José Rodrigues Alves Sobrinho, 351</p>
                <p>Vila Paulo Romeu</p>
                <p>Cruzeiro, SP • 12710-410</p>
              </div>
            </div>
            <div className="flex gap-2 items-center text-[11px] pt-1">
              <Phone className="w-4 h-4 text-[#c8ccd4] shrink-0" />
              <a href="tel:+5512996555081" className="text-white font-sans font-medium hover:underline">+55 (12) 99655-5081</a>
            </div>
          </Reveal>

          {/* Operating hours */}
          <Reveal as="div" delay={240} className="md:col-span-3 space-y-3 font-mono text-[10px] text-zinc-400">
            <h4 className="text-[9px] text-[#c8ccd4]/60 block uppercase tracking-widest font-bold">HORÁRIOS</h4>
            <div className="space-y-1">
              <div className="flex justify-between border-b border-[#c8ccd4]/5 pb-1">
                <span>Segunda a Sábado</span>
                <span className="text-white">09h - 21h</span>
              </div>
              <div className="flex justify-between border-b border-[#c8ccd4]/5 pb-1">
                <span>Domingo</span>
                <span className="text-zinc-650 font-bold text-zinc-600">Fechado</span>
              </div>
            </div>
            
            <div className="pt-2">
              <a
                href="#"
                className="text-[9px] uppercase hover:underline text-[#c8ccd4] flex items-center gap-1 mt-4"
              >
                Voltar ao topo ↑
              </a>
            </div>
          </Reveal>

        </div>

        {/* Bottom grid specs indicator row */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-650 font-sans text-[8px] select-none uppercase tracking-wider">
          <span>ATENDIMENTO COM HORA MARCADA</span>
          <span className="bg-black px-3 py-1.5 text-[#c8ccd4]/60 border border-zinc-850 font-bold rounded">SÉCULO XXI • CRUZEIRO/SP</span>
        </div>
      </footer>

      {/* Mobile Sticky Floating CTA Bar for conversion fluidity */}
      <AnimatePresence>
        {showStickyCTA && !isBookingOpen && !isOverlayOpen && !isBarberPickerOpen && (
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
                <span className="font-sans text-[7.5px] text-[#c8ccd4] tracking-widest font-black uppercase">SÉCULO XXI</span>
                <span className="font-display font-light text-xs text-zinc-100 uppercase tracking-wide">Atendimento Hoje</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-mono text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider">Vagas Livres</span>
                </div>
              </div>
              
              <button
                onClick={() => setIsBookingOpen(true)}
                className="relative overflow-hidden bg-[linear-gradient(135deg,#5a93de_0%,#2f5f8f_42%,#c41f16_70%,#e23a2e_100%)] hover:brightness-110 active:scale-95 font-graffiti text-sm py-3 px-6 rounded-xl flex items-center gap-2.5 border-2 border-black/60 shadow-[0_8px_24px_rgba(0,0,0,0.45)] cursor-pointer uppercase"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full animate-shimmer" />
                AGENDAR AGORA
                <Scissors className="w-3.5 h-3.5 rotate-45 text-[#f0ebe4]" />
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

      {/* Seletor de Barbeiro — Renato ativo; demais bloqueados (Em breve) */}
      <AnimatePresence>
        {isBarberPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
            id="barber-picker-overlay"
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsBarberPickerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-md bg-[#0b0b0d] bg-tijolo border-2 border-black rounded-t-3xl sm:rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.85),0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Escolher barbeiro"
            >
              {/* Glow ambiente — glow-decor: só no desktop (blur caro no mobile) */}
              <div className="glow-decor absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-brand-blue/15 blur-[120px] rounded-full pointer-events-none" />

              {/* Header */}
              <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/5 z-10">
                <div className="flex flex-col leading-none">
                  <span className="font-mono text-[8px] text-brand-blue uppercase tracking-[0.25em] font-black">
                    NOSSA EQUIPE
                  </span>
                  <span className="font-toon text-logo-3d text-lg uppercase tracking-wide mt-1" data-text="Escolha o Barbeiro">
                    Escolha o Barbeiro
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBarberPickerOpen(false)}
                  className="w-8 h-8 grid place-items-center rounded-lg bg-[#16161a] border-2 border-black text-zinc-400 hover:text-white transition-colors cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.8)] active:translate-y-[2px] active:shadow-none"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de barbeiros */}
              <div className="relative z-10 p-5 grid grid-cols-3 gap-3">
                {HERO_BARBERS.map((barber) => {
                  const isActive = barber.id === activeBarberId;
                  return (
                    <button
                      key={barber.id}
                      type="button"
                      disabled={barber.locked}
                      onClick={() => {
                        if (barber.locked) return;
                        setActiveBarberId(barber.id);
                        setIsBarberPickerOpen(false);
                      }}
                      className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all ${
                        barber.locked
                          ? 'border-black/40 bg-[#0e0e11] cursor-not-allowed'
                          : isActive
                            ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_18px_rgba(16,185,129,0.35)] cursor-pointer'
                            : 'border-black/55 bg-white/[0.03] hover:border-[#c8ccd4]/60 cursor-pointer active:scale-95'
                      }`}
                    >
                      {/* Selo de selecionado */}
                      {isActive && !barber.locked && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 grid place-items-center text-white shadow-md z-20">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                      )}

                      {/* Imagem ou sombra bloqueada */}
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 grid place-items-center">
                        {barber.img ? (
                          <Image
                            src={barber.img}
                            alt={barber.name}
                            width={120}
                            height={160}
                            className="w-full h-full object-contain object-bottom"
                          />
                        ) : (
                          <>
                            {/* Silhueta/sombra bloqueada */}
                            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/40 to-black flex items-end justify-center">
                              <div className="w-2/3 h-3/4 bg-black/70 rounded-t-[50%] blur-[1px]" />
                            </div>
                            <span className="relative z-10 w-8 h-8 rounded-full bg-black/80 border-2 border-zinc-700 grid place-items-center text-zinc-500">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          </>
                        )}
                      </div>

                      {/* Nome + papel */}
                      <div className="text-center leading-none">
                        <span className={`font-display font-black text-[10px] uppercase block ${barber.locked ? 'text-zinc-600' : 'text-zinc-100'}`}>
                          {barber.name}
                        </span>
                        <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-wide mt-1 block">
                          {barber.role}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="relative z-10 px-5 pb-5 -mt-1">
                <p className="font-sans text-[10px] text-zinc-500 text-center leading-normal">
                  Novos barbeiros chegando em breve. Por enquanto, agende com o <strong className="text-zinc-300">Renato</strong>.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Success Feedback Toast */}
      <Toast />

    </div>
  );
}
