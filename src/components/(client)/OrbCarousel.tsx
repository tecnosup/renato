"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES } from '@/lib/data';
import { 
  Sparkles, 
  Calendar, 
  ShoppingBag, 
  ArrowLeft, 
  Tag, 
  Star, 
  Sparkle, 
  Clock, 
  Compass, 
  CheckCircle2, 
  X, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  volume: string;
  description: string;
  image: string;
  rating: number;
}

const PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    name: 'Pomada Matte Século XXI',
    price: 65,
    volume: '100g',
    description: 'Fixação extra-forte de longa duração com efeito matte de toque seco absoluto. Elaborada com argilas e ceras de abelha naturais.',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&auto=format&fit=crop',
    rating: 5
  },
  {
    id: 'p2',
    name: 'Balm Nutritivo Real',
    price: 55,
    volume: '80ml',
    description: 'Fórmula hidratante biológica que combate coceiras, estimula o bulbo, protege de raios UV e alinha os fios sem pesar.',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=400&auto=format&fit=crop',
    rating: 4.8
  },
  {
    id: 'p3',
    name: 'Shampoo Fortificante Ativo',
    price: 75,
    volume: '250ml',
    description: 'Antiqueda enriquecido com cafeína anidra, mentol criogênico de estimulação sanguínea e biotina concentrada de absorção rápida.',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400&auto=format&fit=crop',
    rating: 5
  }
];

interface GlassOrbProps {
  category: 'services' | 'products';
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}

function GlassOrb({ category, onClick, icon, label, sublabel }: GlassOrbProps) {
  const isServices = category === 'services';

  // NEUROMARKETING OPTIMIZED COLOR SCHEMES
  // Services: Trust/Renewal Activation (Emerald-Teal deep oceanic glass with custom light flares)
  // Products: Reward/Acquisition Activation (Molten Coral-Copper-Gold rich metallic glass)
  const gradientStyle = isServices
    ? {
        background: 'radial-gradient(circle at 35% 30%, #e2fbf0 0%, #0d9488 15%, #0f766e 40%, #042f2e 70%, #011512 100%)',
      }
    : {
        background: 'radial-gradient(circle at 35% 30%, #fffbeb 0%, #f59e0b 15%, #b45309 40%, #451a03 70%, #1c0800 100%)',
      };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-64 h-64 md:w-72 md:h-72 rounded-full cursor-pointer focus:outline-none flex items-center justify-center transition-all duration-500 ease-out select-none active:scale-95"
    >
      {/* 1. Behind-Orb ambient shadow & glow - Enhanced for vivacity! */}
      <div 
        className={`absolute -inset-6 rounded-full blur-3xl opacity-30 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700 pointer-events-none ${
          isServices ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
        }`} 
      />

      {/* 2. Sleek active rotating orbit dash rings - Extra lively and responsive */}
      <div className={`absolute -inset-2 rounded-full border border-dashed animate-[spin_30s_linear_infinite] group-hover:scale-110 transition-all duration-500 pointer-events-none ${
        isServices ? 'border-teal-400/30 group-hover:border-teal-450' : 'border-amber-400/30 group-hover:border-amber-450'
      }`} />
      
      {/* 3. Outer boundary concentric ring with double border */}
      <div className="absolute inset-1 rounded-full border border-white/[0.04] group-hover:border-white/[0.15] transition-colors duration-500 pointer-events-none bg-zinc-950/30 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]" />

      {/* 4. Complete hyper-realistic 3D Glass Sphere container with double-source inner/outer shadow */}
      <div
        className="absolute inset-4 rounded-full overflow-hidden shadow-[inset_-16px_-16px_32px_rgba(0,0,0,0.9),_inset_16px_16px_32px_rgba(255,255,255,0.25),_0_25px_50px_rgba(0,0,0,0.9)] flex items-center justify-center border border-white/[0.15] group-hover:border-white/[0.3] transition-all duration-500"
        style={gradientStyle}
      >
        {/* Specular inner material overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.2),transparent_60%)]" />

        {/* Refraction edge glows inside glass body - mimicking the iridescent green/violet sheen in the reference photo */}
        {isServices ? (
          <>
            {/* Emerald/lime color bottom-left refraction (seen in Reference Image) */}
            <div className="absolute bottom-1 left-5 w-1/2 h-1/2 bg-emerald-300/40 blur-xl rounded-full mix-blend-screen transform -rotate-[25deg]" />
            {/* Iridescent Violet sheen far bottom-right */}
            <div className="absolute bottom-2 right-6 w-1/2 h-1/2 bg-violet-600/30 blur-xl rounded-full mix-blend-screen" />
            {/* Golden flare highlights */}
            <div className="absolute top-8 left-8 w-1/4 h-1/4 bg-yellow-300/20 blur-xl rounded-full mix-blend-screen" />
          </>
        ) : (
          <>
            {/* Fire coral/rose bottom-left refraction */}
            <div className="absolute bottom-1 left-5 w-1/2 h-1/2 bg-rose-500/40 blur-xl rounded-full mix-blend-screen transform -rotate-[25deg]" />
            {/* Gold highlights far top */}
            <div className="absolute top-3 left-8 w-1/2 h-1/3 bg-amber-300/30 blur-xl rounded-full mix-blend-screen" />
          </>
        )}

        {/* Central lens glowing cluster */}
        <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_65%)] animate-pulse" style={{ animationDuration: '3s' }} />

        {/* 5. Curved high gloss specular highlight mimicking a professional light box source reflection */}
        <div className="absolute top-[2px] right-6 left-6 h-[44%] bg-gradient-to-b from-white/[0.6] via-white/[0.1] to-transparent rounded-[100%_100%_50%_50%] pointer-events-none filter brightness-120" />

        {/* Highlight crisp outer boundary stroke */}
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-tr from-transparent via-transparent to-white/[0.2] pointer-events-none" />

        {/* 6. Dynamic Inner content */}
        <div className="relative z-10 flex flex-col items-center p-6 text-center transform group-hover:scale-108 transition-all duration-500 ease-out">
          {/* Glassmorphic icon container */}
          <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 mb-3 text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] ${
            isServices 
              ? 'bg-emerald-400/10 border-emerald-300/20 group-hover:bg-emerald-400 group-hover:text-zinc-950 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.8)]'
              : 'bg-amber-400/10 border-amber-300/20 group-hover:bg-amber-400 group-hover:text-zinc-950 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.8)]'
          }`}>
            {icon}
          </div>
          
          <span className="font-display font-black text-xl md:text-2xl text-white uppercase tracking-wider block drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-none">
            {label}
          </span>
          <span className="font-mono text-[9px] text-[#c2a35d] tracking-widest uppercase font-black block mt-1.5 group-hover:text-white transition-colors duration-300 select-none bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5">
            {sublabel}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function OrbCarousel() {
  // 'menu' | 'services' | 'products'
  const [activeCategory, setActiveCategory] = useState<'menu' | 'services' | 'products'>('menu');
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const handleBookService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    // Triggers the scheduling modal by dispatching the custom-event
    window.dispatchEvent(new CustomEvent('select-service', { detail: serviceId }));
    const formSec = document.getElementById('reservar-modal');
    if (!formSec) {
      // Fallback scroll to top where modal is
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReserveProduct = (product: ProductItem) => {
    setReservationSuccess(product.name);
    setTimeout(() => {
      setReservationSuccess(null);
    }, 4000);
  };

  return (
    <section 
      className="w-full bg-transparent py-12 sm:py-20 px-4 md:px-8 border-t border-white/5 relative overflow-hidden scroll-mt-20 md:scroll-mt-24" 
      id="servicos"
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Title Section */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="font-mono text-[9px] text-[#c2a35d] tracking-[0.3em] uppercase mb-2.5 flex items-center gap-1.5 font-bold bg-gold/5 px-3 py-1 border border-gold/15 rounded-full select-none">
            <Sparkles className="w-3 h-3 text-gold animate-pulse" />
            <span>[03_ESTILO_E_CUIDADO]</span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-5xl text-[#e2e2e2] uppercase tracking-tighter leading-none mb-3">
            SERVIÇOS & PRODUTOS
          </h2>
          <p className="font-serif italic text-zinc-400 text-xs md:text-base max-w-xl text-center leading-relaxed">
            Selecione uma categoria abaixo ou clique nas orbes interativas para explorar as nossas opções premium e agendar seu atendimento.
          </p>
        </div>

        {/* Clear Navigation Tabs for Usability & Intuitiveness */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10" id="services-products-tabs">
          <button
            onClick={() => setActiveCategory('menu')}
            className={`px-4 py-2 rounded-xl font-sans text-[9px] sm:text-[10px] tracking-widest uppercase border transition-all duration-300 font-bold ${
              activeCategory === 'menu'
                ? 'bg-[#c2a35d] text-zinc-950 border-[#c2a35d] shadow-[0_0_20px_rgba(194,163,93,0.3)]'
                : 'bg-white/5 backdrop-blur-md text-zinc-400 border-white/10 hover:text-white hover:border-white/30'
            }`}
          >
            Início / Categorias
          </button>
          <button
            onClick={() => setActiveCategory('services')}
            className={`px-4 py-2 rounded-xl font-sans text-[9px] sm:text-[10px] tracking-widest uppercase border transition-all duration-300 font-bold ${
              activeCategory === 'services'
                ? 'bg-[#c2a35d] text-zinc-950 border-[#c2a35d] shadow-[0_0_20px_rgba(194,163,93,0.3)]'
                : 'bg-white/5 backdrop-blur-md text-zinc-400 border-white/10 hover:text-white hover:border-white/30'
            }`}
          >
            Serviços Exclusivos
          </button>
          <button
            onClick={() => setActiveCategory('products')}
            className={`px-4 py-2 rounded-xl font-sans text-[9px] sm:text-[10px] tracking-widest uppercase border transition-all duration-300 font-bold ${
              activeCategory === 'products'
                ? 'bg-[#c2a35d] text-zinc-950 border-[#c2a35d] shadow-[0_0_20px_rgba(194,163,93,0.3)]'
                : 'bg-white/5 backdrop-blur-md text-zinc-400 border-white/10 hover:text-white hover:border-white/30'
            }`}
          >
            Cosméticos & Produtos
          </button>
        </div>

        {/* Dynamic Transition States */}
        <AnimatePresence mode="wait">
          {activeCategory === 'menu' && (
            <motion.div
              key="main-menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-14 py-8"
              id="orbs-menu-container"
            >
              {/* ORB 1: SERVICES ORB */}
              <div className="flex flex-col items-center text-center">
                <GlassOrb
                  category="services"
                  onClick={() => setActiveCategory('services')}
                  icon={<Compass className="w-5 h-5 animate-spin-slow" />}
                  label="Serviços"
                  sublabel="LINHA_DE_SERVIÇOS"
                />
                <div className="mt-5 max-w-xs px-2 select-none">
                  <h3 className="font-display font-bold text-[#e1e1e1] uppercase text-xs tracking-wider mb-1 group-hover:text-gold">Corte &amp; Barba</h3>
                  <p className="font-sans text-[11px] text-zinc-500 leading-normal">
                    Serviços completos de cabelo, barba clássica com toalhas aquecidas e designs modernos.
                  </p>
                </div>
              </div>

              {/* ORB 2: PRODUCTS ORB */}
              <div className="flex flex-col items-center text-center">
                <GlassOrb
                  category="products"
                  onClick={() => setActiveCategory('products')}
                  icon={<ShoppingBag className="w-5 h-5" />}
                  label="Cosméticos"
                  sublabel="CUIDADO_E_COSMÉTICOS"
                />
                <div className="mt-5 max-w-xs px-2 select-none">
                  <h3 className="font-display font-bold text-[#e1e1e1] uppercase text-xs tracking-wider mb-1 group-hover:text-gold">Produtos &amp; Cosméticos</h3>
                  <p className="font-sans text-[11px] text-zinc-500 leading-normal">
                    Insumos biológicos, pomadas veganas ricas em ceras de abelha e shampoos enriquecidos antiqueda.
                  </p>
                </div>
              </div>

            </motion.div>
          )}

          {/* INSIDE STATE 1: SERVICES DETAIL CATALOGUE */}
          {activeCategory === 'services' && (
            <motion.div
              key="services-inside"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-8"
              id="orbs-services-inside"
            >
              {/* Back navigation header layout */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-black/40 backdrop-blur-xl p-5 rounded-3xl border border-white/10 gap-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-4 text-left">
                  {/* Floating miniature category Orb */}
                  <div className="relative w-16 h-16 rounded-full border border-dashed border-gold/40 flex items-center justify-center shrink-0">
                    <div className="absolute w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=150&auto=format&fit=crop" 
                        alt="Ritual orb"
                        className="w-full h-full object-cover rounded-full grayscale opacity-60"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <Compass className="w-5 h-5 text-gold relative z-10 animate-spin-slow" />
                  </div>
                  <div>
                    <span className="font-mono text-[8.5px] text-[#c2a35d] tracking-widest uppercase font-black block leading-none mb-1.5">VOCÊ ENTROU EM</span>
                    <h3 className="font-display font-light text-xl text-white uppercase tracking-wider">SERVIÇOS EXCLUSIVOS</h3>
                    <p className="font-sans text-[10.5px] text-zinc-500">Nossa linha completa de cabelo, barba e tratamentos</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCategory('menu')}
                  className="font-sans text-[9px] uppercase tracking-widest font-bold text-slate-300 hover:text-white py-3.5 px-6 border border-white/10 rounded-xl hover:border-white/30 bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar para as Orbes
                </button>
              </div>

              {/* Dynamic services listing grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="services-orbs-grid">
                {SERVICES.map((srv, index) => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <motion.div
                      key={srv.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`group bg-white/5 backdrop-blur-xl p-6 rounded-[24px] flex flex-col justify-between text-left transition-all duration-500 relative overflow-hidden cursor-pointer select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_10px_rgba(0,0,0,0.3)] md:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.5)] md:group-hover:shadow-[0_20px_45px_-12px_rgba(16,185,129,0.22)] ${
                        isSelected 
                          ? 'shadow-[0_0_15px_rgba(194,163,93,0.35)] ring-2 ring-[#c2a35d]' 
                          : 'border border-white/10 hover:border-emerald-500/40'
                      }`}
                    >
                      {/* Glowing Luxe Golden Contour when Selected */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-[24px] pointer-events-none z-30 border-2 border-[#c2a35d] shadow-[0_0_25px_rgba(194,163,93,0.4),_inset_0_0_12px_rgba(194,163,93,0.2)]" />
                      )}

                      {/* Glass Specular Gloss Highlight Reflection top bar */}
                      <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-white/[0.06] via-transparent to-transparent pointer-events-none" />
                      <div className="absolute inset-[1px] rounded-[23px] bg-gradient-to-tr from-transparent via-transparent to-white/[0.06] pointer-events-none" />

                      {/* Lively backdrop custom glow */}
                      <div className={`absolute -inset-10 bg-emerald-500/[0.01] group-hover:bg-emerald-500/[0.08] blur-2xl rounded-full transition-all duration-500 pointer-events-none ${
                        isSelected ? 'bg-amber-500/[0.05]' : ''
                      }`} />

                      {/* Subtle aesthetic backdrop design */}
                      <div className="absolute right-0 top-0 w-20 h-20 border-l border-b border-white/[0.02] flex items-center justify-center font-mono text-[8px] text-zinc-800 select-none">
                        {`[0${index + 1}]`}
                      </div>

                      <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-start pr-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[8.5px] font-bold text-emerald-450 uppercase bg-emerald-500/5 border border-emerald-500/15 px-2.5 py-0.5 rounded">
                              {srv.category}
                            </span>
                            {isSelected && (
                              <span className="font-mono text-[8px] font-bold text-amber-400 uppercase bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                SELECIONADO
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>{srv.duration} min</span>
                          </div>
                        </div>

                        <h4 className={`font-display font-black text-base uppercase leading-tight transition-colors ${
                          isSelected ? 'text-[#c2a35d]' : 'text-zinc-200 group-hover:text-emerald-300'
                        }`}>
                          {srv.name}
                        </h4>

                        <p className="font-sans text-[11px] text-zinc-400 font-normal leading-relaxed min-h-[50px]">
                          {srv.description}
                        </p>
                      </div>

                      <div className="border-t border-zinc-850 pt-5 mt-5 flex justify-between items-center relative z-10">
                        <div>
                          <span className="font-mono text-[8px] text-zinc-500 uppercase block">INVESTIMENTO</span>
                          <span className="font-display font-bold text-lg text-emerald-400">R$ {srv.price},00</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid double handler fire Since card itself has click
                            handleBookService(srv.id);
                          }}
                          className={`relative overflow-hidden font-display text-[10px] font-black uppercase tracking-wider py-3.5 px-5 rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 group/srv-btn transform hover:scale-[1.03] ${
                            isSelected 
                              ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20' 
                              : 'bg-[#c2a35d] text-zinc-950 shadow-lg shadow-gold/15 hover:bg-white'
                          }`}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/srv-btn:animate-shimmer" />
                          <Calendar className="w-3.5 h-3.5" />
                          {isSelected ? 'Horário Selecionado' : 'Agendar Horário'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* INSIDE STATE 2: PRODUCTS DETAIL CATALOGUE */}
          {activeCategory === 'products' && (
            <motion.div
              key="products-inside"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-8"
              id="orbs-products-inside"
            >
              {/* Back navigation header layout */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-black/40 backdrop-blur-xl p-5 rounded-3xl border border-white/10 gap-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-4 text-left">
                  {/* Floating miniature category Orb */}
                  <div className="relative w-16 h-16 rounded-full border border-dashed border-[#c2a35d]/40 flex items-center justify-center shrink-0">
                    <div className="absolute w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=150&auto=format&fit=crop" 
                        alt="Product orb"
                        className="w-full h-full object-cover rounded-full grayscale opacity-60"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <ShoppingBag className="w-5 h-5 text-[#c2a35d] relative z-10" />
                  </div>
                  <div>
                    <span className="font-mono text-[8.5px] text-[#c2a35d] tracking-widest uppercase font-black block leading-none mb-1.5">VOCÊ ENTROU EM</span>
                    <h3 className="font-display font-light text-xl text-white uppercase tracking-wider">COSMÉTICOS &amp; PRODUTOS</h3>
                    <p className="font-sans text-[10.5px] text-zinc-500">Linha selecionada de alta performance para cabelo, barba e barba-terapia</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCategory('menu')}
                  className="font-mono text-[9px] uppercase tracking-widest text-[#c2a35d] hover:text-white py-3.5 px-6 border border-[#c2a35d]/15 rounded-xl hover:border-gold bg-zinc-950/70 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar para as Orbes
                </button>
              </div>

              {/* Dynamic products listing grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="products-orbs-grid">
                {PRODUCTS.map((prod, index) => (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 p-5 rounded-[24px] flex flex-col justify-between text-left transition-all duration-500 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_10px_rgba(0,0,0,0.3)] md:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.5)] md:group-hover:shadow-[0_20px_45px_-12px_rgba(245,158,11,0.22)]"
                  >
                    {/* Glass Specular Gloss Highlight Reflection top bar */}
                    <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-white/[0.06] via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-[1px] rounded-[23px] bg-gradient-to-tr from-transparent via-transparent to-white/[0.06] pointer-events-none" />

                    {/* Lively backdrop custom glow */}
                    <div className="absolute -inset-10 bg-amber-500/[0.01] group-hover:bg-amber-500/[0.08] blur-2xl rounded-full transition-all duration-500 pointer-events-none" />

                    <div className="space-y-4 relative z-10">
                      {/* Product image frame with high luxury aesthetics */}
                      <div className="w-full h-44 rounded-xl bg-zinc-950 border border-zinc-800 relative overflow-hidden select-none shadow-inner">
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover grayscale brightness-95 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500 pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2.5 left-2.5 font-mono text-[8px] text-white bg-black/75 px-2 py-0.5 rounded border border-white/5 uppercase">
                          {prod.volume}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-0.5 text-amber-450">
                            {Array.from({ length: 5 }).map((_, si) => (
                              <Star key={si} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <span className="font-mono text-[8px] text-zinc-500 font-bold">{prod.rating}/5.0</span>
                        </div>

                        <h4 className="font-display font-extrabold text-sm text-zinc-200 uppercase group-hover:text-amber-300 transition-colors leading-tight">
                          {prod.name}
                        </h4>

                        <p className="font-sans text-[11px] text-zinc-400 font-normal leading-relaxed min-h-[48px]">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-zinc-850 pt-4.5 mt-5 flex justify-between items-center relative z-10">
                      <div>
                        <span className="font-mono text-[8px] text-zinc-500 uppercase block">VALOR</span>
                        <span className="font-display font-extrabold text-base text-amber-400">R$ {prod.price},00</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReserveProduct(prod)}
                        className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-display text-[10px] font-black uppercase tracking-wider py-3.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/15 active:scale-95 group/prod-btn transform hover:scale-[1.03] hover:from-white hover:to-white font-bold"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/prod-btn:animate-shimmer" />
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Reservar Item
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Product reservation confirmation modal/box overlay */}
        <AnimatePresence>
          {reservationSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-50 max-w-sm bg-white text-zinc-950 p-4.5 rounded-2xl border-2 border-zinc-950 shadow-2xl flex items-start gap-3.5 text-left"
              id="product-reservation-toast"
            >
              <div className="w-9 h-9 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 leading-tight select-none">
                <h5 className="font-display font-black text-xs uppercase text-zinc-900 tracking-wide">RESERVADO COM SUCESSO!</h5>
                <p className="font-sans text-[10.5px] text-zinc-650 font-normal leading-normal mt-1">
                  O item <strong>{reservationSuccess}</strong> foi separado e reservado exclusivamente para você retirar no salão Faria Lima.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setReservationSuccess(null)}
                className="text-zinc-400 hover:text-zinc-650 cursor-pointer p-0.5"
                aria-label="Gravar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </section>
  );
}
