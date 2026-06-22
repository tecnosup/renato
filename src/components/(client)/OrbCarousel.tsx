"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToServices } from '@/lib/services';
import { subscribeToProducts } from '@/lib/products';
import { subscribeToCategories, serviceCategoryId } from '@/lib/categories';
import type { BarberService, Product, Category } from '@/lib/types';
import {
  Calendar,
  ShoppingBag,
  ArrowLeft,
  Clock,
  Compass,
  CheckCircle2,
  X
} from 'lucide-react';


interface GlassOrbProps {
  category: 'services' | 'products';
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}

function GlassOrb({ category, onClick, icon, label, sublabel }: GlassOrbProps) {
  const isServices = category === 'services';

  // Esquema de cor por categoria:
  // Services: AZUL → VERDE — verde reforça "ação boa / siga em frente" (neuromarketing:
  //   permissão e avanço), coerente com a luz de ação ao redor da orbe.
  // Products: AZUL PROFUNDO — mais escuro, para contrastar com a de serviços.
  const gradientStyle = isServices
    ? {
        background: 'radial-gradient(circle at 35% 30%, #eafff3 0%, #5a93de 16%, #2b4fb8 42%, #15803d 74%, #0a3d1f 100%)',
      }
    : {
        background: 'radial-gradient(circle at 35% 30%, #eef2ff 0%, #4f6ff0 16%, #1d3585 44%, #16245c 72%, #0a1230 100%)',
      };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-64 h-64 md:w-72 md:h-72 rounded-full cursor-pointer focus:outline-none flex items-center justify-center transition-all duration-500 ease-out select-none active:scale-95"
    >
      {/* 1. Luz/halo em volta — VERDE discreto (acento de "ação boa", sem inundar
          o fundo): glow mais justo à orbe e bem suave, ganha vida só no hover. */}
      <div className="absolute -inset-1 rounded-full blur-2xl opacity-20 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700 pointer-events-none bg-gradient-to-r from-emerald-500 to-green-400" />

      {/* 2. Anel orbital tracejado — verde sutil, acompanhando a luz de ação */}
      <div className="absolute -inset-2 rounded-full border border-dashed animate-[spin_30s_linear_infinite] group-hover:scale-110 transition-all duration-500 pointer-events-none border-emerald-400/25 group-hover:border-emerald-300/60" />

      {/* 3. Moldura street: contorno preto duro + sombra "stacked" (igual aos botões game) */}
      <div className="absolute inset-1 rounded-full border-2 border-black/70 group-hover:border-black transition-colors duration-500 pointer-events-none bg-zinc-950/30 shadow-[0_6px_0_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.06)] group-active:shadow-[0_2px_0_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.06)]" />

      {/* 4. Complete hyper-realistic 3D Glass Sphere container with double-source inner/outer shadow */}
      <div
        className="absolute inset-4 rounded-full overflow-hidden shadow-[inset_-16px_-16px_32px_rgba(0,0,0,0.9),_inset_16px_16px_32px_rgba(255,255,255,0.25),_0_25px_50px_rgba(0,0,0,0.9)] flex items-center justify-center border-2 border-black/55 group-hover:border-black/75 transition-all duration-500"
        style={gradientStyle}
      >
        {/* Specular inner material overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.2),transparent_60%)]" />

        {/* Refração interna do vidro: sheen azul por categoria (sky / blue) */}
        {isServices ? (
          <>
            {/* Refração azul da marca top-left */}
            <div className="absolute top-6 left-5 w-1/2 h-1/2 bg-brand-blue/45 blur-xl rounded-full mix-blend-screen transform -rotate-[25deg]" />
            {/* Sheen verde bottom-right (puxa a base de "ação" do gradiente) */}
            <div className="absolute bottom-2 right-5 w-1/2 h-1/2 bg-emerald-500/35 blur-xl rounded-full mix-blend-screen" />
            {/* Flare branco-azulado de cima */}
            <div className="absolute top-8 left-8 w-1/4 h-1/4 bg-sky-100/25 blur-xl rounded-full mix-blend-screen" />
          </>
        ) : (
          <>
            {/* Refração azul profundo bottom-left */}
            <div className="absolute bottom-1 left-5 w-1/2 h-1/2 bg-blue-500/40 blur-xl rounded-full mix-blend-screen transform -rotate-[25deg]" />
            {/* Sheen índigo far top */}
            <div className="absolute top-3 left-8 w-1/2 h-1/3 bg-indigo-400/30 blur-xl rounded-full mix-blend-screen" />
          </>
        )}

        {/* Central lens glowing cluster */}
        <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_65%)] md:animate-pulse" style={{ animationDuration: '3s' }} />

        {/* 5. Curved high gloss specular highlight mimicking a professional light box source reflection */}
        <div className="absolute top-[2px] right-6 left-6 h-[44%] bg-gradient-to-b from-white/[0.6] via-white/[0.1] to-transparent rounded-[100%_100%_50%_50%] pointer-events-none filter brightness-120" />

        {/* Highlight crisp outer boundary stroke */}
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-tr from-transparent via-transparent to-white/[0.2] pointer-events-none" />

        {/* 6. Dynamic Inner content */}
        <div className="relative z-10 flex flex-col items-center p-6 text-center transform group-hover:scale-108 transition-all duration-500 ease-out">
          {/* Glassmorphic icon container */}
          {/* Botão central VERDE (ação boa) — preenche no hover e brilha verde */}
          <div className="w-12 h-12 rounded-full border-2 border-black/40 flex items-center justify-center transition-all duration-500 mb-3 text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] bg-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-[0_0_22px_rgba(16,185,129,0.85)]">
            {icon}
          </div>
          
          <span className="btn-game text-2xl md:text-3xl uppercase block select-none">
            {label}
          </span>
          {sublabel && (
            <span className="font-mono text-[9px] text-brand-blue tracking-widest uppercase font-black block mt-1.5 group-hover:text-white transition-colors duration-300 select-none bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Orbe miniatura "viva" do header de categoria — esfera puramente CSS (sem
 * imagem, sem lib 3D), que respira: glow pulsante + leve flutuação. Reaproveita
 * a estética das orbes grandes (radial-gradient azul-bebê/azul-escuro).
 * `variant` escolhe a paleta; `icon` é o glifo central.
 */
function CategoryOrb({ variant, icon }: { variant: 'services' | 'products'; icon: React.ReactNode }) {
  const isServices = variant === 'services';
  const sphere = isServices
    ? 'radial-gradient(circle at 35% 30%, #eafff3 0%, #5a93de 18%, #2b4fb8 46%, #15803d 76%, #0a3d1f 100%)'
    : 'radial-gradient(circle at 35% 30%, #eef2ff 0%, #4f6ff0 18%, #1d3585 46%, #16245c 74%, #0a1230 100%)';

  return (
    <div className="relative w-16 h-16 shrink-0 grid place-items-center [animation:orb-float_6s_ease-in-out_infinite]">
      {/* Glow ambiente que pulsa por trás */}
      <div
        className={`absolute inset-0 rounded-full blur-xl [animation:orb-breathe_4s_ease-in-out_infinite] ${
          isServices ? 'bg-emerald-500/40' : 'bg-blue-600/40'
        }`}
      />
      {/* Anel orbital tracejado girando devagar */}
      <div
        className={`absolute -inset-1 rounded-full border border-dashed [animation:spin_24s_linear_infinite] ${
          isServices ? 'border-emerald-400/35' : 'border-blue-500/30'
        }`}
      />
      {/* Corpo da esfera de vidro — contorno preto street */}
      <div
        className="relative w-12 h-12 rounded-full grid place-items-center overflow-hidden border-2 border-black/55 shadow-[inset_-6px_-6px_12px_rgba(0,0,0,0.85),inset_6px_6px_12px_rgba(255,255,255,0.22)]"
        style={{ background: sphere }}
      >
        {/* Brilho especular de cima */}
        <div className="absolute top-[2px] left-3 right-3 h-1/2 rounded-[100%] bg-gradient-to-b from-white/60 via-white/10 to-transparent pointer-events-none" />
        <div className={`relative z-10 ${isServices ? 'text-emerald-50' : 'text-blue-50'} drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function OrbCarousel() {
  // 'menu' | 'services' | 'products'
  const [activeCategory, setActiveCategory] = useState<'menu' | 'services' | 'products'>('menu');
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Serviços reais (Firestore), só os ativos, ordenados. Vitrine reflete o
  // catálogo cadastrado no admin; sem fallback hardcoded.
  const [services, setServices] = useState<BarberService[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeToServices((lista) => {
      setServices(lista.filter((s) => s.active ?? true));
      setLoadingServices(false);
    });
    return unsub;
  }, []);

  // Produtos reais (Firestore), só os ativos, ordenados. Sem fallback hardcoded.
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeToProducts((lista) => {
      setProducts(lista.filter((p) => p.active ?? true));
      setLoadingProducts(false);
    });
    return unsub;
  }, []);

  // Categorias dinâmicas para os chips de filtro da vitrine.
  const [serviceCats, setServiceCats] = useState<Category[]>([]);
  const [productCats, setProductCats] = useState<Category[]>([]);

  useEffect(() => {
    const u1 = subscribeToCategories("servico", setServiceCats);
    const u2 = subscribeToCategories("produto", setProductCats);
    return () => { u1(); u2(); };
  }, []);

  // Chip de categoria ativo em cada aba (null = todas).
  const [serviceCatFilter, setServiceCatFilter] = useState<string | null>(null);
  const [productCatFilter, setProductCatFilter] = useState<string | null>(null);

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

  const handleReserveProduct = (product: Product) => {
    setReservationSuccess(product.name);
    setTimeout(() => {
      setReservationSuccess(null);
    }, 4000);
  };

  // Listas filtradas pelo chip de categoria ativo.
  const servicesShown = serviceCatFilter
    ? services.filter((s) => (s.categoryId ?? serviceCategoryId(s.category)) === serviceCatFilter)
    : services;
  const productsShown = productCatFilter
    ? products.filter((p) => (p.categoryId ?? "") === productCatFilter)
    : products;

  return (
    <section 
      className="w-full bg-[#0b0b0d] bg-tijolo py-12 sm:py-20 px-4 md:px-8 border-t-2 border-black relative overflow-hidden scroll-mt-20 md:scroll-mt-24"
      id="servicos"
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="glow-decor absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/8 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Title Section */}
        <div className="text-center mb-8 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl uppercase tracking-tighter leading-none mb-3">
            <span className="font-toon text-logo-3d" data-text="SERVIÇOS & PRODUTOS">SERVIÇOS & PRODUTOS</span>
          </h2>
          <p className="font-serif italic text-zinc-400 text-xs md:text-base max-w-xl text-center leading-relaxed">
            Escolha uma opção abaixo ou toque nos círculos para ver nossos serviços e produtos e agendar seu horário.
          </p>
        </div>

        {/* Abas de navegação — estilo "game" (contorno preto, sombra dura empilhada,
            afunda no clique). Ativo em creme da marca; inativos escuros. */}
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4 mb-10" id="services-products-tabs">
          {([
            { key: 'menu', label: 'Início' },
            { key: 'services', label: 'Serviços' },
            { key: 'products', label: 'Produtos' },
          ] as const).map(({ key, label }) => {
            const active = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-5 py-2.5 rounded-lg font-display font-black text-[10px] sm:text-xs tracking-widest uppercase border-2 border-black transition-all duration-150 active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.9)] ${
                  active
                    ? 'bg-brand-cream text-black shadow-[0_5px_0_rgba(0,0,0,0.9)]'
                    : 'bg-[#0e0e11] text-zinc-300 hover:text-white hover:bg-[#16161a] shadow-[0_4px_0_rgba(0,0,0,0.8)]'
                }`}
              >
                {label}
              </button>
            );
          })}
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
                  sublabel=""
                />
                <div className="mt-5 max-w-xs px-2 select-none">
                  <h3 className="font-display font-bold text-[#e1e1e1] uppercase text-xs tracking-wider mb-1 group-hover:text-brand-blue">Corte &amp; Barba</h3>
                  <p className="font-sans text-[11px] text-zinc-500 leading-normal">
                    Corte de cabelo, barba com toalha quente e estilos modernos.
                  </p>
                </div>
              </div>

              {/* ORB 2: PRODUCTS ORB */}
              <div className="flex flex-col items-center text-center">
                <GlassOrb
                  category="products"
                  onClick={() => setActiveCategory('products')}
                  icon={<ShoppingBag className="w-5 h-5" />}
                  label="Produtos"
                  sublabel=""
                />
                <div className="mt-5 max-w-xs px-2 select-none">
                  <h3 className="font-display font-bold text-[#e1e1e1] uppercase text-xs tracking-wider mb-1 group-hover:text-brand-blue">Produtos</h3>
                  <p className="font-sans text-[11px] text-zinc-500 leading-normal">
                    Pomadas, shampoos e produtos de qualidade para cuidar do cabelo e da barba em casa.
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
              {/* Header da tela interna — moldura street (contorno preto + sombra dura) */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-center bg-[#0c0c0f] border-2 border-black rounded-3xl p-5 sm:p-6 gap-5 shadow-[0_6px_0_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                  <CategoryOrb variant="services" icon={<Compass className="w-5 h-5 animate-spin-slow" />} />
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="font-mono text-[8.5px] text-emerald-300 tracking-widest uppercase font-black inline-block leading-none mb-2 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded">VOCÊ ESTÁ VENDO</span>
                    <h3 className="font-toon text-zinc-50 text-2xl sm:text-3xl uppercase tracking-wide leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">SERVIÇOS</h3>
                    <p className="font-serif italic text-[11px] text-zinc-400 mt-2">Cortes de cabelo, barba e tratamentos</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCategory('menu')}
                  className="shrink-0 font-display font-black text-[10px] uppercase tracking-widest text-zinc-200 hover:text-white py-3 px-6 border-2 border-black rounded-xl bg-[#16161a] hover:bg-[#1d1d22] transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.8)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.8)]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar
                </button>
              </div>

              {/* Chips de categoria (serviços) */}
              {!loadingServices && serviceCats.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6" id="services-cat-chips">
                  {[{ id: null as string | null, name: "Todos" }, ...serviceCats].map((c) => {
                    const sel = serviceCatFilter === c.id;
                    return (
                      <button
                        key={c.id ?? "todos"}
                        onClick={() => setServiceCatFilter(c.id)}
                        className={`font-display text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full border-2 transition-all active:translate-y-[2px] active:shadow-none ${
                          sel
                            ? "bg-brand-blue text-white border-black shadow-[0_3px_0_rgba(0,0,0,0.85)]"
                            : "bg-[#0e0e11] border-black/60 text-zinc-400 hover:text-white hover:border-black shadow-[0_3px_0_rgba(0,0,0,0.6)]"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dynamic services listing grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="services-orbs-grid">
                {loadingServices ? (
                  // Skeleton enquanto o catálogo carrega do Firestore
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-card p-6 rounded-[24px] border border-white/10 animate-pulse min-h-[230px] flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="h-4 w-20 bg-white/10 rounded" />
                        <div className="h-5 w-40 bg-white/10 rounded" />
                        <div className="h-10 w-full bg-white/5 rounded" />
                      </div>
                      <div className="h-6 w-24 bg-white/10 rounded mt-5" />
                    </div>
                  ))
                ) : servicesShown.length === 0 ? (
                  <div className="col-span-full glass-card p-8 rounded-[24px] border border-white/10 text-center">
                    <p className="font-sans text-sm text-zinc-300">Nenhum serviço disponível no momento.</p>
                    <p className="font-sans text-[11px] text-zinc-500 mt-1">Volte em breve ou entre em contato com a barbearia.</p>
                  </div>
                ) : (
                servicesShown.map((srv, index) => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <motion.div
                      key={srv.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`group glass-card p-6 rounded-[24px] flex flex-col justify-between text-left transition-all duration-500 relative overflow-hidden cursor-pointer select-none border-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_10px_rgba(0,0,0,0.3)] md:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.5)] md:group-hover:shadow-[0_20px_45px_-12px_rgba(56,189,248,0.22)] ${
                        isSelected
                          ? 'border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.4)]'
                          : 'border-black/55 hover:border-black'
                      }`}
                    >
                      {/* Contorno verde quando selecionado (ação/escolha confirmada) */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-[24px] pointer-events-none z-30 border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.45),_inset_0_0_12px_rgba(16,185,129,0.22)]" />
                      )}

                      {/* Glass Specular Gloss Highlight Reflection top bar */}
                      <div className="glow-decor absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-white/[0.06] via-transparent to-transparent pointer-events-none" />
                      <div className="glow-decor absolute inset-[1px] rounded-[23px] bg-gradient-to-tr from-transparent via-transparent to-white/[0.06] pointer-events-none" />

                      {/* Lively backdrop custom glow */}
                      <div className={`glow-decor absolute -inset-10 bg-sky-500/[0.01] group-hover:bg-sky-500/[0.08] blur-2xl rounded-full transition-all duration-500 pointer-events-none ${
                        isSelected ? 'bg-blue-500/[0.05]' : ''
                      }`} />


                      <div className="space-y-3 relative z-10">
                        {/* Foto do serviço — só quando cadastrada (imageUrl).
                            Sem foto, o card mantém o layout original (sem buraco). */}
                        {srv.imageUrl && (
                          <div className="w-full h-40 rounded-xl bg-zinc-950 border border-zinc-800 relative overflow-hidden select-none shadow-inner -mt-1">
                            <img
                              src={srv.imageUrl}
                              alt={srv.name}
                              className="w-full h-full object-cover grayscale brightness-95 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500 pointer-events-none"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-start pr-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[8.5px] font-bold text-sky-300 uppercase bg-sky-500/5 border border-sky-500/15 px-2.5 py-0.5 rounded">
                              {srv.category}
                            </span>
                            {isSelected && (
                              <span className="font-mono text-[8px] font-bold text-emerald-300 uppercase bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                SELECIONADO
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                            <Clock className="w-3 h-3 text-sky-400" />
                            <span>{srv.duration} min</span>
                          </div>
                        </div>

                        <h4 className={`font-display font-black text-base uppercase leading-tight transition-colors ${
                          isSelected ? 'text-emerald-300' : 'text-zinc-200 group-hover:text-sky-300'
                        }`}>
                          {srv.name}
                        </h4>

                        <p className="font-sans text-[11px] text-zinc-400 font-normal leading-relaxed min-h-[50px]">
                          {srv.description}
                        </p>
                      </div>

                      <div className="border-t border-zinc-850 pt-5 mt-5 flex justify-between items-center relative z-10">
                        <div>
                          <span className="font-mono text-[8px] text-zinc-500 uppercase block">PREÇO</span>
                          <span className="font-display font-bold text-lg text-sky-400">R$ {srv.price},00</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid double handler fire Since card itself has click
                            handleBookService(srv.id);
                          }}
                          className={`relative overflow-hidden btn-game btn-game-sm text-xs uppercase py-3.5 px-5 rounded-xl border-2 border-black/55 transition-all flex items-center gap-2 cursor-pointer active:scale-95 group/srv-btn transform hover:scale-[1.03] ${
                            isSelected
                              ? 'bg-emerald-600 shadow-lg shadow-emerald-600/30 hover:bg-emerald-500'
                              : 'bg-brand-blue shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-deep'
                          }`}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/srv-btn:animate-shimmer" />
                          <Calendar className="w-3.5 h-3.5" />
                          {isSelected ? 'Horário Selecionado' : 'Agendar Horário'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
                )}
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
              {/* Header da tela interna — moldura street (contorno preto + sombra dura) */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-center bg-[#0c0c0f] border-2 border-black rounded-3xl p-5 sm:p-6 gap-5 shadow-[0_6px_0_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                  <CategoryOrb variant="products" icon={<ShoppingBag className="w-5 h-5" />} />
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="font-mono text-[8.5px] text-brand-blue tracking-widest uppercase font-black inline-block leading-none mb-2 bg-brand-blue/10 border border-brand-blue/30 px-2 py-1 rounded">VOCÊ ESTÁ VENDO</span>
                    <h3 className="font-toon text-zinc-50 text-2xl sm:text-3xl uppercase tracking-wide leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">PRODUTOS</h3>
                    <p className="font-serif italic text-[11px] text-zinc-400 mt-2">Produtos de qualidade para cabelo e barba</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCategory('menu')}
                  className="shrink-0 font-display font-black text-[10px] uppercase tracking-widest text-zinc-200 hover:text-white py-3 px-6 border-2 border-black rounded-xl bg-[#16161a] hover:bg-[#1d1d22] transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.8)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.8)]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar
                </button>
              </div>

              {/* Chips de categoria (produtos) */}
              {!loadingProducts && productCats.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6" id="products-cat-chips">
                  {[{ id: null as string | null, name: "Todos" }, ...productCats].map((c) => {
                    const sel = productCatFilter === c.id;
                    return (
                      <button
                        key={c.id ?? "todos"}
                        onClick={() => setProductCatFilter(c.id)}
                        className={`font-display text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full border-2 transition-all active:translate-y-[2px] active:shadow-none ${
                          sel
                            ? "bg-brand-blue-deep text-white border-black shadow-[0_3px_0_rgba(0,0,0,0.85)]"
                            : "bg-[#0e0e11] border-black/60 text-zinc-400 hover:text-white hover:border-black shadow-[0_3px_0_rgba(0,0,0,0.6)]"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dynamic products listing grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="products-orbs-grid">
                {loadingProducts ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="glass-card p-5 rounded-[24px] border border-white/10 animate-pulse min-h-[320px] flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="w-full h-44 bg-white/5 rounded-xl" />
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-10 w-full bg-white/5 rounded" />
                      </div>
                      <div className="h-6 w-24 bg-white/10 rounded mt-5" />
                    </div>
                  ))
                ) : productsShown.length === 0 ? (
                  <div className="col-span-full glass-card p-8 rounded-[24px] border border-white/10 text-center">
                    <p className="font-sans text-sm text-zinc-300">Nenhum produto disponível no momento.</p>
                    <p className="font-sans text-[11px] text-zinc-500 mt-1">Volte em breve ou entre em contato com a barbearia.</p>
                  </div>
                ) : (
                productsShown.map((prod, index) => (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group glass-card border-2 border-black/55 hover:border-black p-5 rounded-[24px] flex flex-col justify-between text-left transition-all duration-500 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_10px_rgba(0,0,0,0.3)] md:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.5)] md:group-hover:shadow-[0_20px_45px_-12px_rgba(43,79,184,0.22)]"
                  >
                    {/* Glass Specular Gloss Highlight Reflection top bar */}
                    <div className="glow-decor absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-white/[0.06] via-transparent to-transparent pointer-events-none" />
                    <div className="glow-decor absolute inset-[1px] rounded-[23px] bg-gradient-to-tr from-transparent via-transparent to-white/[0.06] pointer-events-none" />

                    {/* Lively backdrop custom glow */}
                    <div className="glow-decor absolute -inset-10 bg-blue-500/[0.01] group-hover:bg-blue-500/[0.08] blur-2xl rounded-full transition-all duration-500 pointer-events-none" />

                    <div className="space-y-4 relative z-10">
                      {/* Product image frame (placeholder até o upload R2 entrar) */}
                      <div className="w-full h-44 rounded-xl bg-zinc-950 border border-zinc-800 relative overflow-hidden select-none shadow-inner flex items-center justify-center">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover grayscale brightness-95 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500 pointer-events-none"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <ShoppingBag className="w-10 h-10 text-zinc-700" />
                        )}
                        {prod.volume && (
                          <div className="absolute top-2.5 left-2.5 font-mono text-[8px] text-white bg-black/75 px-2 py-0.5 rounded border border-white/5 uppercase">
                            {prod.volume}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-display font-extrabold text-sm text-zinc-200 uppercase group-hover:text-blue-300 transition-colors leading-tight">
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
                        <span className="font-display font-extrabold text-base text-blue-400">R$ {prod.price},00</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReserveProduct(prod)}
                        className="relative overflow-hidden bg-brand-blue-deep hover:bg-brand-blue btn-game btn-game-sm text-xs uppercase py-3.5 px-5 rounded-xl border-2 border-black/55 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-blue/25 active:scale-95 group/prod-btn transform hover:scale-[1.03]"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/prod-btn:animate-shimmer" />
                        <ShoppingBag className="w-3.5 h-3.5" />
Reservar
                      </button>
                    </div>
                  </motion.div>
                ))
                )}
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
              className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#0e0e11] text-zinc-100 p-4.5 rounded-2xl border-2 border-black shadow-[0_8px_0_rgba(0,0,0,0.85),0_24px_50px_rgba(0,0,0,0.6)] flex items-start gap-3.5 text-left"
              id="product-reservation-toast"
            >
              <div className="w-9 h-9 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-400 shrink-0 border-2 border-emerald-500/40">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 leading-tight select-none">
                <h5 className="font-toon text-logo-3d text-base uppercase tracking-wide" data-text="PRODUTO RESERVADO!">PRODUTO RESERVADO!</h5>
                <p className="font-sans text-[10.5px] text-zinc-400 font-normal leading-normal mt-1.5">
                  O item <strong className="text-zinc-200">{reservationSuccess}</strong> foi separado e reservado exclusivamente para você retirar no salão em Cruzeiro.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReservationSuccess(null)}
                className="text-zinc-500 hover:text-zinc-200 cursor-pointer p-0.5"
                aria-label="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
