"use client";

import { ElementType, ReactNode, useEffect, useRef } from "react";

/**
 * Reveal "in" leve — anima o elemento (fade + slide) UMA vez quando ele entra
 * na viewport, via CSS puro. Diferente do framer-motion (que cria um observer +
 * MotionValues por elemento), aqui usamos UM ÚNICO IntersectionObserver
 * compartilhado por toda a página: ao entrar, só adicionamos a classe
 * `.is-visible` e paramos de observar. Zero trabalho por frame, só transform/
 * opacity (GPU). Respeita `prefers-reduced-motion` (a transição some no CSS).
 *
 * Uso:
 *   <Reveal>...</Reveal>                  // div, slide de baixo
 *   <Reveal as="section" delay={120}>     // outra tag + atraso em ms
 *   <Reveal variant="left">               // direção do slide
 */

type Variant = "up" | "down" | "left" | "right" | "fade";

// Observer único para a página inteira (criado sob demanda, no client).
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // anima só uma vez
        }
      }
    },
    // dispara um pouco antes de entrar 100% (margem inferior negativa).
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  return sharedObserver;
}

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  /** atraso da transição, em ms (para encadear itens) */
  delay?: number;
  className?: string;
  id?: string;
}

export default function Reveal({
  children,
  as,
  variant = "up",
  delay = 0,
  className = "",
  id,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = getObserver();
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal={variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
