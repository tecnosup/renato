"use client";
import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface ThreeDTiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  key?: string | number;
}

export default function ThreeDTiltCard({ 
  children, 
  className = '', 
  intensity = 12 
}: ThreeDTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Mouse position values set between 0 and 1
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.4 };
  const rotateX = useSpring(useTransform(y, [0, 1], [intensity, -intensity]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-intensity, intensity]), springConfig);

  // Smooth pop out scales
  const cardScale = useSpring(hovered ? 1.02 : 1, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalise mouse positions to [0, 1] relative to the card dimensions
    const mouseX = (e.clientX - rect.left) / width;
    const mouseY = (e.clientY - rect.top) / height;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale: cardScale,
        transformStyle: 'preserve-3d',
      }}
      className={`perspective-1000 transition-shadow duration-300 ${
        hovered ? 'shadow-[0_20px_40px_rgba(0,0,0,0.4)]' : 'shadow-md'
      } ${className}`}
      id="3d-tilt-card-wrapper"
    >
      {/* Target inner container preserves 3D nested rendering */}
      <div 
        className="w-full h-full preserve-3d" 
        style={{ transform: 'translateZ(0px)' }}
      >
        {children}
      </div>
    </motion.div>
  );
}
