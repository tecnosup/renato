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
      className="w-full bg-[#0b0b0d] bg-tijolo py-16 md:py-24 border-y-2 border-black overflow-hidden relative select-none"
      style={{ perspective: '1200px' }}
      id="3d-text-section"
    >
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
          className={`whitespace-nowrap flex gap-6 btn-game text-[40px] md:text-[75px] leading-none select-none w-max ${isMobile ? 'animate-[marqueeLeft_20s_linear_infinite]' : ''}`}
          style={isMobile ? undefined : { x: smoothX1, transformStyle: 'preserve-3d' }}
          id="text-vortex-row-1"
        >
          <span>ARTE • </span>
          <span>ESTILO • </span>
          <span>CORTESIA • </span>
          <span>EXCELÊNCIA • </span>
          <span>PROPORÇÃO • </span>
          <span>DESIGN • </span>
          {/* Duplicate for infinite loop */}
          <span>ARTE • </span>
          <span>ESTILO • </span>
          <span>CORTESIA • </span>
          <span>EXCELÊNCIA • </span>
          <span>PROPORÇÃO • </span>
          <span>DESIGN • </span>
        </motion.div>

        {/* Linha divisória simples entre as duas faixas */}
        <div className="w-full px-6 md:px-10 select-none">
          <div className="h-[2px] w-full bg-[#c8ccd4]/25" />
        </div>

        <motion.div
          className={`whitespace-nowrap flex gap-6 btn-game text-[40px] md:text-[75px] leading-none select-none w-max justify-end ${isMobile ? 'animate-[marqueeRight_20s_linear_infinite]' : ''}`}
          style={isMobile ? undefined : { x: smoothX2, transformStyle: 'preserve-3d' }}
          id="text-vortex-row-2"
        >
          {/* Duplicate for infinite loop */}
          <span>NAVALHA • </span>
          <span>TOALHA PURA • </span>
          <span>VISAGISMO • </span>
          <span>CUIDADO • </span>
          <span>DEDICAÇÃO • </span>
          <span>CLASSE • </span>

          <span>NAVALHA • </span>
          <span>TOALHA PURA • </span>
          <span>VISAGISMO • </span>
          <span>CUIDADO • </span>
          <span>DEDICAÇÃO • </span>
          <span>CLASSE • </span>
        </motion.div>
      </div>

      <style>{`
        .stroke-text {
          -webkit-text-stroke: 1px #c8ccd4;
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
