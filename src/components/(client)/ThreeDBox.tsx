"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Scissors, Sparkles } from 'lucide-react';

export default function ThreeDBox() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // No mobile o tilt por mouse nao existe (touch) e as animacoes infinitas
  // (aneis girando, sparkles pulsando, springs) saturam a GPU de aparelhos
  // antigos. Renderizamos o cubo estatico abaixo de 768px.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Spring options for rich, organic interactive physics
  const springConfig = { damping: 25, stiffness: 120, mass: 0.6 };
  
  // Use Motion Values to tracking relative mouse coordinate offsets (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Map mouse offsets to multi-axis 3D rotations
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), springConfig);
  
  // Parallax translating depths
  const poleTranslateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const poleTranslateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), springConfig);
  
  const scissTranslateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), springConfig);
  const scissTranslateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Normalize coordinates
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseEnter={isMobile ? undefined : () => setIsHovered(true)}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      className="relative w-[320px] h-[320px] md:w-[410px] md:h-[410px] flex items-center justify-center select-none cursor-pointer"
      style={{ perspective: '1000px' }}
      id="elegant-barber-sculpture-container"
    >
      {/* Background elegant architectural rings */}
      <div className="absolute inset-0 border border-zinc-900/60 rounded-full pointer-events-none flex items-center justify-center">
        <motion.div
          animate={isMobile ? undefined : { rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="w-[94%] h-[94%] border border-dashed border-[#c2a35d]/10 rounded-full"
        />
      </div>
      <div className="absolute inset-4 border border-zinc-900/30 rounded-full pointer-events-none flex items-center justify-center">
        <motion.div
          animate={isMobile ? undefined : { rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="w-[90%] h-[90%] border border-[#c2a35d]/5 rounded-full"
        />
      </div>

      {/* Main 3D Interactive Stage */}
      <motion.div
        className="w-[280px] h-[280px] md:w-[340px] md:h-[340px] relative flex items-center justify-center"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        id="barber-interactive-stage"
      >
        {/* Sleek shadow beneath the elements */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/50 blur-xl rounded-full opacity-60 pointer-events-none" />

        {/* Backdrop Card Plate */}
        <div 
          className="absolute inset-0 bg-[#0d0e10]/80 rounded-3xl border border-zinc-850 p-6 flex flex-col justify-between shadow-2xl md:backdrop-blur-md"
          style={{ transform: 'translateZ(-40px)' }}
          id="sculpture-backdrop"
        >
          {/* Top aesthetic corner labels */}
          <div className="flex justify-between items-center text-[7.5px] text-[#c2a35d]/40 tracking-[0.2em] font-sans font-bold">
            <span>SÉCULO XXI • ESTÉTICA</span>
            <span>EXCELÊNCIA</span>
          </div>

          {/* Underlay schematic blueprint lines */}
          <div className="absolute inset-10 border border-zinc-900/40 rounded-2xl pointer-events-none flex items-center justify-center opacity-40">
            <div className="w-[1px] h-full bg-zinc-900/40 absolute left-1/2" />
            <div className="h-[1px] w-full bg-zinc-900/40 absolute top-1/2" />
          </div>

          {/* Bottom labeling */}
          <div className="flex justify-between items-end text-[7.5px] text-zinc-550 tracking-[0.15em] font-sans">
            <span>SÃO PAULO, BR</span>
            <span>PRECISÃO E DESIGN</span>
          </div>
        </div>

        {/* CENTER ELEMENT: The Luxury Barber Pole (Parallax Layer 1) */}
        <motion.div
          className="w-[64px] h-[200px] md:w-[74px] md:h-[238px] relative flex flex-col justify-between"
          style={{
            x: poleTranslateX,
            y: poleTranslateY,
            transformStyle: 'preserve-3d',
            translateZ: '10px'
          }}
          id="luxury-barber-pole-model"
        >
          {/* Top cap - brass finish */}
          <div className="w-full h-8 md:h-10 bg-gradient-to-r from-amber-600 via-[#c2a35d] to-[#7c6331] rounded-t-full shadow-lg border border-[#c2a35d]/40 flex flex-col items-center justify-center relative">
            <div className="w-3 h-3 bg-gradient-to-r from-[#faf9f6]/40 to-transparent rounded-full absolute top-1 left-2 blur-[1px]" />
            {/* Small top crown */}
            <div className="w-5 h-2 -mt-4 bg-[#c2a35d] rounded-t-sm border-t border-[#faf9f6]/20" />
          </div>

          {/* Core glass cylinder containing rotating diagonal stripes */}
          <div className="flex-1 w-[90%] mx-auto bg-black/90 border-x border-zinc-850/80 relative overflow-hidden flex items-center shadow-inner">
            {/* Inner rotating texture cylinder */}
            <div
              className="absolute inset-y-0 w-full md:animate-[barberScroll_4s_linear_infinite]"
              style={{
                backgroundImage: 'repeating-linear-gradient(135deg, #c2a35d, #c2a35d 14px, #1a1a1c 14px, #1a1a1c 28px, #ffffff 28px, #ffffff 32px)',
                backgroundSize: '100% 50px',
              }}
            />
            
            {/* Glass high-reflection highlights overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-black/60 pointer-events-none" />
            <div className="absolute top-0 bottom-0 left-2 w-[3px] bg-white/20 blur-[0.5px] pointer-events-none" />
            <div className="absolute top-0 bottom-0 left-4 w-px bg-white/10 pointer-events-none" />
          </div>

          {/* Bottom cap - brass finish */}
          <div className="w-full h-8 md:h-10 bg-gradient-to-r from-amber-600 via-[#c2a35d] to-[#7c6331] rounded-b-full shadow-lg border border-[#c2a35d]/40 relative flex flex-col items-center justify-start">
            <div className="w-3 h-3 bg-gradient-to-r from-[#faf9f6]/20 to-transparent rounded-full absolute bottom-1 left-2" />
            {/* Small bottom ornament */}
            <div className="w-4 h-2 mt-8 bg-[#7c6331] rounded-b-sm" />
          </div>
        </motion.div>

        {/* LEFT ELEMENT: Floating Luxury Styling Scissors (Parallax Layer 2) */}
        <motion.div
          className="absolute left-4 md:left-8 top-16 w-24 h-24 md:w-28 md:h-28 flex items-center justify-center pointer-events-none"
          style={{
            x: scissTranslateX,
            y: scissTranslateY,
            translateZ: '50px',
            rotate: isHovered ? -15 : -32
          }}
          transition={{ type: 'spring', damping: 20 }}
          id="sculpture-scissors"
        >
          {/* Glassmorhic capsule carrying scissors */}
          <div className="relative p-3 bg-zinc-950/40 border border-[#c2a35d]/20 rounded-2xl shadow-xl md:backdrop-blur-md flex items-center justify-center group">
            {/* Scissors vector icon */}
            <motion.div 
              animate={{ 
                scale: isHovered ? 1.08 : 1,
                rotate: isHovered ? [0, 5, -5, 0] : 0 
              }}
              transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0, repeatType: 'reverse' }}
              className="text-[#c2a35d] w-12 h-12 md:w-16 md:h-16 flex items-center justify-center relative filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
            >
              <Scissors className="w-full h-full stroke-[1.25]" />
            </motion.div>
            
            {/* Micro details */}
            <span className="absolute bottom-1 font-sans text-[6.5px] text-[#c2a35d]/60 tracking-wider">SHEARS</span>
          </div>
        </motion.div>

        {/* RIGHT ELEMENT: Floating Luxury Comb (Parallax Layer 3) */}
        <motion.div
          className="absolute right-4 md:right-8 bottom-16 w-24 h-20 md:w-28 md:h-24 flex items-center justify-center pointer-events-none"
          style={{
            x: useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), springConfig),
            y: useSpring(useTransform(mouseY, [-0.5, 0.5], [-12, 12]), springConfig),
            translateZ: '70px',
            rotate: isHovered ? 18 : 8
          }}
          id="sculpture-comb"
        >
          {/* Glassmorhic capsule carrying styling comb representation */}
          <div className="relative py-2.5 px-4 bg-zinc-950/40 border border-zinc-800 rounded-xl shadow-xl md:backdrop-blur-md flex flex-col justify-between items-center w-full">
            {/* Aesthetic representation of gold styling comb teeth */}
            <div className="w-full flex justify-between space-x-[2px] h-6 items-start">
              {Array.from({ length: 14 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className="w-px bg-gradient-to-b from-[#c2a35d] to-transparent" 
                  style={{ height: `${12 + (idx % 3) * 4}px` }} 
                />
              ))}
            </div>
            
            {/* Comb stem */}
            <div className="w-full h-1.5 bg-gradient-to-r from-[#c2a35d] via-[#faf9f6]/90 to-[#7c6331] rounded-full mt-1.5" />
            
            <span className="font-sans text-[6px] text-zinc-500 tracking-widest uppercase mt-1">SÉCULO XXI COMB</span>
          </div>
        </motion.div>

        {/* TOP FLOATING ATMOSPHERIC SPARKS */}
        <motion.div
          className="absolute -top-4 right-16 text-[#c2a35d]/30"
          animate={isMobile ? undefined : { y: [0, -6, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ translateZ: '30px' }}
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-12 text-[#c2a35d]/20"
          animate={isMobile ? undefined : { y: [0, 4, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          style={{ translateZ: '20px' }}
        >
          <Sparkles className="w-3 h-3" />
        </motion.div>
      </motion.div>

      {/* Embed micro-scrolling keyframe inside the component for perfect portability */}
      <style>{`
        @keyframes barberScroll {
          0% {
            background-position-y: 0px;
          }
          100% {
            background-position-y: 50px;
          }
        }
      `}</style>
    </div>
  );
}
