"use client";
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Eye, Flame, Sparkles, Sliders, Scissors, Wind } from 'lucide-react';

interface TrendingCut {
  id: string;
  name: string;
  type: string;
  image: string;
  popularity: string;
  styling: string;
  description: string;
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

  // Calculate sliding offsets for dual tracks
  const xLeftTrack = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const xRightTrack = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const scaleCenterImage = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.03, 0.95]);

  const springConfig = { damping: 25, stiffness: 60, mass: 0.5 };
  const smoothLeftX = useSpring(xLeftTrack, springConfig);
  const smoothRightX = useSpring(xRightTrack, springConfig);
  const smoothScale = useSpring(scaleCenterImage, springConfig);

  const trendingCuts: TrendingCut[] = [
    {
      id: "tc1",
      name: "Textured Crop French",
      type: "Degradê Médio Alto",
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=500&auto=format&fit=crop",
      popularity: "95%",
      styling: "Pó Texturizador + Pomada Matte",
      description: "Corte moderno com o topo texturizado e degradê acentuado, ideal para fisionomias despojadas e urbanas."
    },
    {
      id: "tc2",
      name: "Slick Back Pompadour",
      type: "Navalhado Conectado",
      image: "https://images.unsplash.com/photo-1593702295094-aec22597af05?q=80&w=500&auto=format&fit=crop",
      popularity: "88%",
      styling: "Pomada Alto Brilho / Classic Grooming",
      description: "Topete polido penteado para trás com as laterais em degradê sombreado limpo e imponente."
    },
    {
      id: "tc3",
      name: "Classic Side-Part Royal",
      type: "Corte na Tesoura",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=500&auto=format&fit=crop",
      popularity: "92%",
      styling: "Creme de Pentear + Spray de Brilho",
      description: "O requinte atemporal. Divisão lateral perfeita lapidada inteiramente no fio de tesoura de alta precisão."
    },
    {
      id: "tc4",
      name: "Modern Luxury Beard",
      type: "Navalhado & Terapia",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=500&auto=format&fit=crop",
      popularity: "98%",
      styling: "Balm Nutritivo + Óleo Essencial",
      description: "Design de barba imponente com linhas afiadas na navalha em gradiente com as costeletas."
    }
  ];

  const aestheticImages = [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593702295094-aec22597af05?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop"
  ];

  return (
    <section 
      ref={containerRef}
      className="w-full bg-transparent py-12 sm:py-20 md:py-24 border-t border-white/5 overflow-hidden relative scroll-mt-20 md:scroll-mt-24" 
      id="portfolio"
    >
      {/* Glowing atmospheric dust over the tracks */}
      <div className="absolute top-[30%] left-[20%] w-[250px] h-[250px] bg-gold/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen hidden md:block" />
      <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] bg-[#c2a35d]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen hidden md:block" />

      {/* Embed micro-scrolling keyframe inside the component for perfect portability */}
      <style>{`
        @keyframes marqueeImagesLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeImagesRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
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
            <span className="font-sans text-[8px] text-[#c2a35d] tracking-[0.25em] uppercase flex items-center gap-2 font-bold select-none">SÉCULO XXI • GALERIA VISUAL</span>
            <h2 className="font-display font-light text-3xl md:text-5xl text-white uppercase tracking-wide">
              Estilo &amp; <span className="text-[#c2a35d] italic font-serif font-light">Harmonia Visual</span>
            </h2>
          </div>
          <p className="font-serif italic text-zinc-400 text-sm md:text-base max-w-sm font-light leading-relaxed">
            Retratos de atitude e excelência técnica esculpidos no templo da <strong>Século XXI</strong>. Visuais que ditam as tendências e representam sofisticação em São Paulo.
          </p>
        </motion.div>
      </div>

      {/* Sliding Parallax Panorama Track (Immersive Scroll Effect) */}
      <div className="w-full relative overflow-hidden py-6 select-none bg-black/30 backdrop-blur-md border-y border-white/5 mb-24">
        
        {/* Track 1: Moving left to right */}
        <motion.div 
          style={isMobile ? undefined : { x: smoothLeftX }}
          className={`flex gap-4 w-max mb-4 ${isMobile ? 'animate-[marqueeImagesLeft_35s_linear_infinite]' : 'md:w-[150%]'}`}
        >
          {[...aestheticImages, ...aestheticImages].map((src, i) => (
            <div key={i} className="h-[200px] md:h-[260px] aspect-[4/3] overflow-hidden grayscale hover:grayscale-0 relative border border-gold/10 hover:border-gold/35 rounded-xl transition-all duration-500 flex-shrink-0">
              <img 
                src={src} 
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700 pointer-events-none" 
                alt="Aesthetic Barbershop Capture" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <span className="font-mono text-[9px] text-gold/60 uppercase">CENA_{i + 1}_PREMIUM</span>
              </div>
            </div>
          ))}
          {/* Duplicate for infinite glide wrap */}
          {aestheticImages.map((src, i) => (
            <div key={`dup1-${i}`} className="h-[200px] md:h-[260px] aspect-[4/3] overflow-hidden grayscale hover:grayscale-0 relative border border-gold/10 hover:border-gold/35 rounded-xl transition-all duration-500 flex-shrink-0">
              <img 
                src={src} 
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700 pointer-events-none" 
                alt="Aesthetic Barbershop Capture duplication" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <span className="font-mono text-[9px] text-gold/60 uppercase">CENA_{i + 11}_PREMIUM</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Track 2: Moving right to left */}
        <motion.div 
          style={isMobile ? undefined : { x: smoothRightX }}
          className={`flex gap-4 w-max justify-end ${isMobile ? 'animate-[marqueeImagesRight_30s_linear_infinite]' : 'md:w-[150%]'}`}
        >
          {[...aestheticImages, ...aestheticImages].reverse().map((src, i) => (
            <div key={i} className="h-[140px] md:h-[180px] aspect-[4/3] overflow-hidden grayscale hover:grayscale-0 relative border border-gold/10 hover:border-gold/35 rounded-xl transition-all duration-500 flex-shrink-0">
              <img 
                src={src} 
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700 pointer-events-none" 
                alt="Aesthetic Detail Shot" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <span className="font-mono text-[9px] text-gold/60 uppercase">DECOR_{i + 1}_VINTAGE</span>
              </div>
            </div>
          ))}
          {/* Duplicate for infinite glide wrap */}
          {[...aestheticImages].reverse().map((src, i) => (
            <div key={`dup2-${i}`} className="h-[140px] md:h-[180px] aspect-[4/3] overflow-hidden grayscale hover:grayscale-0 relative border border-gold/10 hover:border-gold/35 rounded-xl transition-all duration-500 flex-shrink-0">
              <img 
                src={src} 
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700 pointer-events-none" 
                alt="Aesthetic Detail Shot duplication" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <span className="font-mono text-[9px] text-gold/60 uppercase">DECOR_{i + 11}_VINTAGE</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Trending Cuts Showcase Card Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Carousel title indicator */}
        <div className="flex items-center gap-3 mb-10 select-none">
          <Flame className="w-5 h-5 text-gold animate-bounce" />
          <span className="font-mono text-[10px] text-white uppercase tracking-[0.3em] font-extrabold">CORTES SÃO PAULO TRENDS EM ALTA</span>
          <div className="h-[1.5px] bg-gold/15 flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="trending-grid">
          {trendingCuts.map((cut, idx) => (
            <motion.div
              key={cut.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] group overflow-hidden flex flex-col justify-between text-left rounded-2xl md:hover:border-gold/40 hover:shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-all duration-300 relative depth-card h-full min-h-[460px]"
            >
              <div>
                {/* Image Container with scale effects */}
                <div className="w-full h-[220px] overflow-hidden relative select-none">
                  <img 
                    src={cut.image} 
                    alt={cut.name} 
                    className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500 pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-95" />
                  
                  {/* Floating index */}
                  <span className="absolute top-4 left-4 font-mono text-[9px] bg-black/80 border border-gold/15 text-gold px-2 py-0.5 rounded">
                    [REF_0{idx + 1}]
                  </span>

                  {/* Rating or popularity stats tag bottom right */}
                  <div className="absolute bottom-4 right-4 bg-gold/10 backdrop-blur-sm border border-gold/30 text-gold px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>EM ALTA: {cut.popularity}</span>
                  </div>
                </div>

                {/* Details text panel */}
                <div className="p-6 space-y-3">
                  <span className="font-mono text-[9px] text-[#c2a35d]/70 uppercase block font-bold tracking-wider leading-none">{cut.type}</span>
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-tight group-hover:text-gold transition-colors">{cut.name}</h3>
                  <p className="font-sans text-[11px] text-zinc-400 leading-relaxed font-normal">{cut.description}</p>
                </div>
              </div>

              {/* Bottom Products Advice specs block */}
              <div className="p-6 pt-0 border-t border-white/5 mt-4">
                <div className="bg-black/30 backdrop-blur-sm p-3 border border-white/5 rounded-xl text-left space-y-1">
                  <span className="font-mono text-[8px] text-slate-400 block uppercase font-bold leading-none">PRODUTO RECOMENDADO</span>
                  <div className="font-mono text-[10px] text-gold font-bold flex items-center gap-1 truncate">
                    <Wind className="w-3 h-3 shrink-0" />
                    <span>{cut.styling}</span>
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
            className="inline-flex items-center gap-2 font-display text-[11px] font-bold tracking-widest text-[#c2a35d] hover:text-white border-b border-dashed border-gold/25 hover:border-white py-2 uppercase transition-all"
          >
            quero agendar um destes modelos
            <Scissors className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
