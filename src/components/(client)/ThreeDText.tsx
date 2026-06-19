"use client";
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function ThreeDText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Map progress to left/right scroll offsets
  const xLeftToRight = useTransform(scrollYProgress, [0, 1], [-200, 150]);
  const xRightToLeft = useTransform(scrollYProgress, [0, 1], [150, -200]);

  const springConfig = { damping: 30, stiffness: 80, mass: 0.6 };
  const smoothX1 = useSpring(xLeftToRight, springConfig);
  const smoothX2 = useSpring(xRightToLeft, springConfig);

  return (
    <div 
      ref={containerRef}
      className="w-full bg-transparent py-20 md:py-28 border-y border-white/5 overflow-hidden relative select-none"
      style={{ perspective: '1200px' }}
      id="3d-text-section"
    >
      {/* Background design accents */}
      <div className="absolute left-[5%] top-3 font-sans text-[8px] font-bold text-[#c2a35d]/40 tracking-[0.25em] select-none uppercase">SÉCULO XXI • ESTÉTICA DO CUIDADO</div>
      <div className="absolute right-[5%] bottom-3 font-sans text-[8px] font-bold text-[#c2a35d]/40 tracking-[0.25em] select-none uppercase">HERANÇA & PRECISÃO</div>

      {/* 3D tilt board containment */}
      <div 
        className="flex flex-col gap-8 md:gap-14"
        style={{
          transform: 'rotateY(-8deg) rotateX(8deg) rotateZ(-1deg)',
          transformStyle: 'preserve-3d'
        }}
        id="3d-text-perspective-container"
      >
        <motion.div 
          className={`whitespace-nowrap flex gap-6 font-display font-light text-[40px] md:text-[75px] leading-none text-[#faf9f6] select-none tracking-[0.08em] opacity-95 w-max ${isMobile ? 'animate-[marqueeLeft_20s_linear_infinite]' : ''}`}
          style={isMobile ? undefined : { x: smoothX1, transformStyle: 'preserve-3d' }}
          id="text-vortex-row-1"
        >
          <span>ARTE • </span>
          <span className="text-zinc-700 font-serif italic">ESTILO • </span>
          <span>CORTESIA • </span>
          <span className="text-transparent stroke-text">EXCELÊNCIA • </span>
          <span>PROPORÇÃO • </span>
          <span className="text-zinc-700 font-serif italic">DESIGN • </span>
          {/* Duplicate for infinite loop */}
          <span>ARTE • </span>
          <span className="text-zinc-700 font-serif italic">ESTILO • </span>
          <span>CORTESIA • </span>
          <span className="text-transparent stroke-text">EXCELÊNCIA • </span>
          <span>PROPORÇÃO • </span>
          <span className="text-zinc-700 font-serif italic">DESIGN • </span>
        </motion.div>

        {/* Dynamic separator grid bar */}
        <div className="w-full h-[1px] bg-zinc-900/60 flex justify-between px-10 text-[8px] tracking-[0.24em] font-sans font-bold text-zinc-600 select-none">
          <span>ALFAIATARIA DE CABELO</span>
          <span>FILOSOFIA ATEMPORAL</span>
          <span>CRUZEIRO • SP</span>
        </div>

        <motion.div 
          className={`whitespace-nowrap flex gap-6 font-display font-light text-[40px] md:text-[75px] leading-none text-[#c2a35d]/90 select-none tracking-[0.08em] opacity-95 w-max justify-end ${isMobile ? 'animate-[marqueeRight_20s_linear_infinite]' : ''}`}
          style={isMobile ? undefined : { x: smoothX2, transformStyle: 'preserve-3d' }}
          id="text-vortex-row-2"
        >
          {/* Duplicate for infinite loop */}
          <span className="text-transparent stroke-text">NAVALHA • </span>
          <span>TOALHA PURA • </span>
          <span className="text-zinc-700 font-serif italic">VISAGISMO • </span>
          <span>CUIDADO • </span>
          <span>DEDICAÇÃO • </span>
          <span className="text-zinc-700 font-serif italic">CLASSE • </span>
          
          <span className="text-transparent stroke-text">NAVALHA • </span>
          <span>TOALHA PURA • </span>
          <span className="text-zinc-700 font-serif italic">VISAGISMO • </span>
          <span>CUIDADO • </span>
          <span>DEDICAÇÃO • </span>
          <span className="text-zinc-700 font-serif italic">CLASSE • </span>
        </motion.div>
      </div>

      <style>{`
        .stroke-text {
          -webkit-text-stroke: 1px #c2a35d;
        }
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
