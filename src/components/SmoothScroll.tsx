"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode, useEffect, useState } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  // O smooth scroll do Lenis roda em JS a cada frame e compete com o main
  // thread em aparelhos antigos (iPhone 8), deixando o scroll "grudento". No
  // mobile usamos o scroll nativo do iOS (mais fluido) e ativamos o Lenis so
  // a partir de 768px. smoothWheel nem se aplica a touch.
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const check = () => setEnabled(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
