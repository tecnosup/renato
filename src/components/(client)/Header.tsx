"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Menu, X, Calendar, MapPin, User, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import ClientDashboard from './ClientDashboard';

const DEFAULT_MEMBERS = [
  {
    id: 'LG-2026',
    name: 'Lincon Cardoso',
    planName: 'Club Legend',
    tier: 'Black' as const,
    price: 360,
    since: '01/03/2026',
    phone: '(11) 98522-2235',
    totalCuts: 'Ilimitado' as const,
    cutsUsed: 4,
    specialCredits: 2,
    specialUsed: 1,
    beerLimit: 10,
    beerUsed: 4
  },
  {
    id: 'EX-1102',
    name: 'Carlos Alberto',
    planName: 'Club Executive',
    tier: 'Silver' as const,
    price: 140,
    since: '15/01/2026',
    phone: '(11) 98765-4321',
    totalCuts: 2 as const,
    cutsUsed: 1,
    specialCredits: 0,
    specialUsed: 0,
    beerLimit: 0,
    beerUsed: 0
  },
  {
    id: 'RY-2849',
    name: 'Dr. Roberto Marinho',
    planName: 'Club Royal',
    tier: 'Gold' as const,
    price: 240,
    since: '02/02/2026',
    phone: '(11) 99122-3344',
    totalCuts: 'Ilimitado' as const,
    cutsUsed: 3,
    specialCredits: 1,
    specialUsed: 0,
    beerLimit: 0,
    beerUsed: 0
  }
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [showClientArea, setShowClientArea] = useState(false);
  const [subscriberId, setSubscriberId] = useState('');
  const [portalError, setPortalError] = useState('');
  const [portalSuccess, setPortalSuccess] = useState(false);
  
  // Real-time Auth tracking states
  const [currentLoggedMember, setCurrentLoggedMember] = useState<any | null>(null);
  const [showSimulationArea, setShowSimulationArea] = useState(false);
  const [simulationPlan, setSimulationPlan] = useState<'Silver' | 'Gold' | 'Black'>('Black');
  const [simulationName, setSimulationName] = useState('');

  // Clock in standard Brazilian / UTC format
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Sao_Paulo'
      };
      setCurrentTime(now.toLocaleTimeString('pt-BR', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'SERVIÇOS', href: '#servicos' },
    { label: 'MANIFESTO', href: '#sobre-nos' },
    { label: 'EQUIPE', href: '#equipe' },
    { label: 'PORTFÓLIO', href: '#portfolio' },
  ];

  const handlePortalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = subscriberId.trim().toUpperCase().replace(/[.\-\s]/g, '');
    if (!cleanId) {
      setPortalError('Por favor, informe seu código ou CPF de assinante.');
      return;
    }
    
    // Find member by parsing mock db and fuzzy matching names/CPFs
    const found = DEFAULT_MEMBERS.find(m => {
      const matchId = m.id.toUpperCase().replace(/[.\-\s]/g, '');
      const matchName = m.name.toUpperCase();
      // Also match simple numerical keys like 123 for Lincon Cardoso
      if (cleanId === '123' && m.id === 'LG-2026') return true;
      if (cleanId === '111' && m.id === 'EX-1102') return true;
      if (cleanId === '222' && m.id === 'RY-2849') return true;
      return matchId === cleanId || matchName.includes(cleanId);
    });

    if (found) {
      setPortalError('');
      setPortalSuccess(true);
      setTimeout(() => {
        setPortalSuccess(false);
        setCurrentLoggedMember(found);
        setSubscriberId('');
      }, 1500);
    } else {
      // Switch to custom user creation simulation view for high interactivity
      setShowSimulationArea(true);
      setSimulationName('');
      setPortalError('');
    }
  };

  const handleSimulationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulationName.trim()) {
      setPortalError('Por favor, insira o seu nome para a simulação.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const mockId = `${simulationPlan === 'Silver' ? 'EX' : simulationPlan === 'Gold' ? 'RY' : 'LG'}-${randomNum}`;
    
    const newSimulatedMember = {
      id: mockId,
      name: simulationName.trim(),
      planName: simulationPlan === 'Silver' ? 'Club Executive' : simulationPlan === 'Gold' ? 'Club Royal' : 'Club Legend',
      tier: simulationPlan,
      since: new Date().toLocaleDateString('pt-BR'),
      price: simulationPlan === 'Silver' ? 140 : simulationPlan === 'Gold' ? 240 : 360,
      phone: '(11) 99999-9999',
      totalCuts: simulationPlan === 'Silver' ? 2 : 'Ilimitado' as const,
      cutsUsed: 0,
      specialCredits: simulationPlan === 'Silver' ? 0 : simulationPlan === 'Gold' ? 1 : 2,
      specialUsed: 0,
      beerLimit: simulationPlan === 'Black' ? 10 : 0,
      beerUsed: 0
    };

    setPortalError('');
    setPortalSuccess(true);
    setTimeout(() => {
      setPortalSuccess(false);
      setShowSimulationArea(false);
      setCurrentLoggedMember(newSimulatedMember);
      setSubscriberId('');
    }, 1500);
  };

  return (
    <>
      {/* Fixed Header & Ticker wrapper for absolute scroll tracking */}
      <div className="w-full fixed top-0 left-0 right-0 z-40 flex flex-col" id="header-fixed-wrapper">
        {/* Top micro ticker (very Swiss, Clean & Architectural) - collapses elegantly on scroll */}
        <div 
          className={`w-full bg-black/40 backdrop-blur-md text-zinc-455 text-[8.5px] font-mono px-4 md:px-8 flex justify-between items-center transition-all duration-300 overflow-hidden border-b border-white/5 ${
            scrolled ? 'h-0 py-0 opacity-0 border-b-0' : 'h-8 py-2 opacity-100'
          }`}
          style={{ transitionProperty: 'all' }}
        >
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 tracking-[0.08em] font-medium text-zinc-400">
              <span className="inline-block w-1.5 h-1.5 bg-[#c2a35d]/85 rounded-full" />
              VAGAS HOJE DISPONÍVEIS
            </span>
            <span className="hidden sm:inline-block text-zinc-800">•</span>
            <span className="hidden sm:inline-block text-zinc-550 tracking-[0.08em]">AV. BRIGADEIRO FARIA LIMA, 4500 • SÃO PAULO</span>
          </div>
          <div className="font-mono text-zinc-500 tracking-[0.08em]">
            SP {currentTime ? `[${currentTime}]` : '[--:--:--]'} BR_TIME
          </div>
        </div>

        <header
          className={`w-full transition-all duration-350 ${
            scrolled 
              ? 'bg-black/60 backdrop-blur-2xl py-3 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
              : 'bg-transparent py-5 border-b border-transparent'
          }`}
          id="app-header"
        >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* Brand Logo & Est - Classic luxury serif and sans pairing */}
          <a href="#" className="flex items-center gap-3.5 group" id="header-brand-logo">
            <div className="w-8.5 h-8.5 rounded-lg border border-gold/20 group-hover:border-gold/50 flex items-center justify-center transition-all duration-500 bg-gold/10 shadow-[inset_0_0_10px_rgba(194,163,93,0.15)]">
              <Scissors className="w-3.5 h-3.5 text-[#c2a35d] transition-transform duration-500 group-hover:-rotate-12" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-medium text-lg md:text-xl tracking-[0.16em] text-white leading-none">
                SÉCULO XXI
              </span>
              <span className="font-sans text-[8.5px] font-bold text-[#c2a35d]/85 tracking-[0.32em] mt-1 leading-none uppercase">
                Estética do Cuidado
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-9" id="desktop-nav">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-sans text-[10px] font-semibold tracking-[0.22em] text-zinc-400 hover:text-white transition-colors duration-300 relative group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#c2a35d]/60 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Right Actions: Subscriber Area + Booking */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setShowClientArea(true)}
              className="flex items-center gap-2 font-sans text-[10px] font-semibold tracking-[0.22em] text-zinc-400 hover:text-white transition-all cursor-pointer py-2 group/client"
              id="header-client-area-btn"
            >
              <User className="w-3.5 h-3.5 text-[#c2a35d] group-hover/client:scale-110 transition-transform" />
              <span>ÁREA DO CLIENTE</span>
              <span className="font-mono text-[7px] text-[#c2a35d] border border-[#c2a35d]/30 px-1 py-0.5 rounded ml-0.5 font-bold uppercase shrink-0">
                CLUBE
              </span>
            </button>

            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('select-service', { detail: '' }));
              }}
              className="bg-linear-to-r from-[#ece4cb] to-[#c2a35d] hover:opacity-90 text-slate-950 font-sans text-[9px] font-black tracking-[0.24em] px-6 py-3 border border-transparent transition-all duration-300 uppercase rounded-xl shadow-[0_0_15px_rgba(194,163,93,0.3)] transform hover:scale-[1.02] cursor-pointer"
              id="cta-reservar-button"
            >
              Agendar Horário
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle Menu"
            id="mobile-menu-toggle"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Fullscreen Navigation Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute top-full left-0 w-full bg-black/80 backdrop-blur-3xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] md:hidden overflow-hidden flex flex-col z-50"
              id="mobile-nav-panel"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                {menuItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="font-sans text-[11px] font-bold tracking-[0.22em] text-zinc-400 hover:text-[#c2a35d] transition-colors py-2 border-b border-zinc-950 uppercase"
                  >
                    {item.label}
                  </a>
                ))}

                {/* Mobile Client Area Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowClientArea(true);
                  }}
                  className="font-sans text-[11px] font-bold tracking-[0.22em] text-[#c2a35d] hover:text-white transition-colors py-2 border-b border-zinc-950 uppercase text-left flex items-center justify-between"
                >
                  <span>ÁREA DO CLIENTE (ASSINANTES)</span>
                  <span className="font-mono text-[7px] text-[#c2a35d] border border-[#c2a35d]/30 px-1 py-0.5 rounded font-black uppercase">
                    ENTRAR
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent('select-service', { detail: '' }));
                  }}
                  className="bg-[#c2a35d] text-zinc-950 text-center font-sans text-[10px] font-bold tracking-[0.22em] py-4 mt-2 rounded-xl w-full flex items-center justify-center gap-2.5 uppercase shadow-lg shadow-gold/15 active:scale-95 transition-all cursor-pointer font-bold"
                >
                  <Calendar className="w-3.5 h-3.5 animate-pulse" />
                  AGENDAR HORÁRIO
                </button>

                {/* Info block */}
                <div className="flex flex-col gap-2 font-mono text-[9px] text-[#c2a35d]/60 pt-4 border-t border-zinc-900">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#c2a35d]/85" />
                    <span>Av. Brigadeiro Faria Lima, 4500 - São Paulo, SP</span>
                  </div>
                  <div className="pl-5">Segunda a Sábado: 09:00 às 21:00</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>

      {/* Luxury Member-Exclusive Client Portal Modal */}
      <AnimatePresence>
        {showClientArea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" id="client-area-modal-container">
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!portalSuccess) setShowClientArea(false);
              }}
              className="absolute inset-0 bg-[#050505]/92 backdrop-blur-md cursor-pointer"
            />

            {/* Portal Card - dynamically enlarges for the premium cockpit layout spacing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className={`relative w-full ${
                currentLoggedMember ? 'max-w-2xl' : 'max-w-md'
              } bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_40px_rgba(0,0,0,0.6)] p-5 sm:p-7 md:p-8 text-left z-10 transition-all duration-300`}
              id="client-portal-modal"
            >
              {/* Refraction ambient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#c2a35d]/5 to-transparent pointer-events-none" />

              {/* Close Button */}
              {!portalSuccess && (
                <button
                  type="button"
                  onClick={() => {
                    setShowClientArea(false);
                    setShowSimulationArea(false);
                  }}
                  className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors cursor-pointer z-20"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* SUCCESS LOADING ANIMATION STATE */}
              {portalSuccess ? (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-4 select-none animate-fade-in">
                  <div className="w-14 h-14 bg-[#c2a35d]/10 border border-[#c2a35d]/45 text-[#c2a35d] rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-display font-medium text-[#e2e2e2] text-xl uppercase tracking-widest mt-2 leading-none">
                    Acesso Permitido
                  </h3>
                  <p className="font-sans text-xs text-zinc-400 max-w-xs leading-relaxed">
                    Sincronizando credenciais. Carregando cockpit seguro da assinatura <strong className="text-gold">SÉCULO XXI</strong>...
                  </p>
                  <div className="w-24 h-1 bg-[#111214] mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#c2a35d] w-1/2 animate-[progress_1.2s_ease-in-out_infinite]" />
                  </div>
                </div>
              ) : currentLoggedMember ? (
                /* LIVE DIGITAL COCKPIT DASHBOARD APPLIED */
                <ClientDashboard 
                  member={currentLoggedMember} 
                  onClose={() => setShowClientArea(false)} 
                  onLogout={() => {
                    setCurrentLoggedMember(null);
                    setShowSimulationArea(false);
                  }} 
                />
              ) : showSimulationArea ? (
                /* SIMULATION WIZARD: CREATE CUSTOM ASSINANTE EXTEMPORANEOUS */
                <div className="space-y-5 animate-fade-in" id="portal-simulation-creation-casing">
                  {/* Header */}
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 font-mono text-[8px] text-amber-500 tracking-widest uppercase bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>SIMULADOR DE ASSINANTE VIRTUAL</span>
                    </div>
                    <h3 className="font-display font-medium text-xl text-white uppercase tracking-wider leading-none">
                      Criar Conta de Membro
                    </h3>
                    <p className="font-sans text-[11px] text-zinc-450 leading-relaxed font-normal">
                      Código ou CPF não correspondente hoje. Preencha seus dados para criar um assinante de simulação e explorar todo o cockpit!
                    </p>
                  </div>

                  <form onSubmit={handleSimulationSubmit} className="space-y-4">
                    {/* Choose Plan selection row */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold">
                        Escolha um Plano para Testar
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { plan: 'Silver', label: 'Silver (Executive)', cost: '140' },
                          { plan: 'Gold', label: 'Gold (Royal)', cost: '240' },
                          { plan: 'Black', label: 'Black (Legend)', cost: '360' }
                        ].map((pOpt) => (
                          <button
                            key={pOpt.plan}
                            type="button"
                            onClick={() => setSimulationPlan(pOpt.plan as any)}
                            className={`p-2.5 border rounded-xl text-left font-mono tracking-tight cursor-pointer transition-all flex flex-col justify-between ${
                              simulationPlan === pOpt.plan
                                ? 'bg-gold/10 border-gold shadow-[inset_0_0_15px_rgba(194,163,93,0.15)] text-gold'
                                : 'bg-white/5 backdrop-blur-md border-white/10 text-slate-500 hover:border-gold/30 hover:bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                            }`}
                          >
                            <span className="text-[9px] font-bold block">{pOpt.plan}</span>
                            <span className="text-[7.5px] mt-1 text-zinc-550">R$ {pOpt.cost}/mês</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Member Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="simName" className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold">
                        Seu Nome Completo
                      </label>
                      <input
                        type="text"
                        id="simName"
                        placeholder="Ex: Gabriel Monteiro"
                        value={simulationName}
                        onChange={(e) => {
                          setSimulationName(e.target.value);
                          if (portalError) setPortalError('');
                        }}
                        className="w-full bg-white/5 backdrop-blur-md border border-white/10 focus:border-gold/50 focus:bg-white/10 focus:outline-none text-slate-100 font-sans text-xs rounded-xl px-4 py-3 tracking-wider placeholder:text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all"
                        name="simName"
                        required
                      />
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSimulationArea(false);
                          setPortalError('');
                        }}
                        className="flex-1 bg-transparent border border-zinc-850 hover:border-zinc-750 text-zinc-400 font-mono text-[9px] uppercase font-bold py-3.5 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-linear-to-r from-[#ece4cb] to-[#c2a35d] text-slate-950 hover:opacity-90 font-sans text-[9px] font-black tracking-[0.24em] uppercase py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(194,163,93,0.3)]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Ativar &amp; Entrar
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* STANDARD LOG IN CREDENTIALS PANEL */
                <div className="space-y-6 animate-fade-in" id="portal-login-credentials-panel">
                  {/* Header info */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 font-mono text-[8px] text-[#c2a35d] tracking-widest uppercase bg-[#c2a35d]/5 border border-[#c2a35d]/15 px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3 text-[#c2a35d]" />
                      <span>PORTAL EXCLUSIVO PARA ASSINANTES</span>
                    </div>
                    <h3 className="font-display font-medium text-xl text-white uppercase tracking-wider leading-none">
                      SÉCULO XXI COCKPIT
                    </h3>
                    <p className="font-sans text-[11px] text-zinc-405 leading-relaxed font-normal">
                      Insira o seu código ou CPF para gerenciar seus rituais, consultar benefícios de assinaturas, bebidas, faturas e agendamentos.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handlePortalSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="memberId" className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold">
                        Código de Assinatura, CPF ou Nome
                      </label>
                      <input
                        type="text"
                        id="memberId"
                        placeholder="Ex: LG-2026, 123 ou seu nome"
                        value={subscriberId}
                        onChange={(e) => {
                          setSubscriberId(e.target.value);
                          if (portalError) setPortalError('');
                        }}
                        className="w-full bg-white/5 backdrop-blur-md border border-white/10 focus:border-gold/50 focus:bg-white/10 focus:outline-none text-slate-100 font-mono text-xs rounded-xl px-4 py-3.5 tracking-wider placeholder:text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all"
                        name="memberId"
                      />
                      {portalError && (
                        <p className="font-mono text-[8.5px] text-rose-500 mt-1">
                          {portalError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-linear-to-r from-[#ece4cb] to-[#c2a35d] hover:opacity-90 text-slate-950 font-sans text-[9px] font-black tracking-[0.24em] uppercase py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(194,163,93,0.3)]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Entrar no Cockpit
                    </button>
                  </form>

                  {/* Preloaded credentials hint block - Classic Bauhaus architectural detail */}
                  <div className="bg-black/30 p-3 border border-white/5 rounded-xl space-y-1.5">
                    <span className="font-mono text-[7px] text-[#c2a35d] uppercase block font-bold">[TESTE_SALAO_DEMO]</span>
                    <p className="font-sans text-[10px] text-zinc-400 leading-normal">
                      Insira <strong className="text-zinc-200">123</strong> para acessar como <strong className="text-zinc-200">Lincon Cardoso</strong> (Legend Black) ou insira qualquer CPF/ID para simular sua própria ativação VIP!
                    </p>
                  </div>

                  {/* Club info links row */}
                  <div className="border-t border-zinc-900 pt-5 flex items-center justify-between font-mono text-[8px] select-none">
                    <div>
                      <span className="text-zinc-650 uppercase block">Ainda não é assinante?</span>
                      <a 
                        href="#assinaturas" 
                        onClick={() => setShowClientArea(false)}
                        className="font-sans text-[9px] font-bold text-[#c2a35d] hover:text-white hover:underline transition-colors mt-0.5 block uppercase tracking-wider"
                      >
                        Conhecer Clubes →
                      </a>
                    </div>
                    <span className="text-zinc-700 uppercase">SÉCULO XXI • EST. 2026</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </>
  );
}
