"use client";

import { useEffect, useState } from "react";

// Modal genérico de fundo — sobe ao abrir, desce ao fechar
export function Modal({ children, onClose, panelClassName, overlayClassName }: { children: (close: () => void) => React.ReactNode; onClose: () => void; panelClassName?: string; overlayClassName?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`transform-gpu fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-opacity duration-200 ${
        overlayClassName ?? "bg-black/10"
      } ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={close}
    >
      <div
        className={`transform-gpu w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          panelClassName ?? "admin-glass-modal"
        } ${
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-full sm:translate-y-24 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children(close)}
      </div>
    </div>
  );
}
