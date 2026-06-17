"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Cabeçalho padrão de modal: título (+ subtítulo opcional) e botão X que gira
 * no hover. Use junto do componente Modal para manter todos os modais iguais.
 */
export function ModalHeader({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children?: React.ReactNode; // conteúdo extra à esquerda do X (badges, etc)
}) {
  return (
    <div className="admin-border-b flex items-center justify-between px-5 pt-5 pb-3">
      <div className="min-w-0">
        <h2 className="text-base font-bold admin-text-primary truncate">{title}</h2>
        {subtitle && <p className="text-xs admin-text-secondary mt-0.5 truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        <button onClick={onClose} className="group admin-text-secondary hover:opacity-80 transition-colors">
          <X className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90" />
        </button>
      </div>
    </div>
  );
}

// Modal genérico de fundo — sobe ao abrir, desce ao fechar
export function Modal({ children, onClose, panelClassName, overlayClassName }: { children: (close: () => void) => React.ReactNode; onClose: () => void; panelClassName?: string; overlayClassName?: string }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // Portal no body: escapa de ancestrais com transform/filter, onde `fixed`
  // ficaria preso ao elemento em vez de cobrir a viewport.
  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-opacity duration-200 ${
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
    </div>,
    document.body
  );
}
