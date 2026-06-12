"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, X, Calendar, Sparkles } from 'lucide-react';

interface ToastData {
  title: string;
  message: string;
  type: 'success' | 'info';
}

export default function Toast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastData>;
      if (customEvent.detail) {
        setToast(customEvent.detail);
      }
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  // Auto-diminish toast after 6 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white/5 backdrop-blur-3xl text-[#e2e2e2] p-5 rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] flex items-start gap-4 text-left"
          id="global-success-toast"
        >
          {/* Accent light decoration */}
          <div className="absolute inset-0 bg-gradient-to-tr from-gold/2 to-transparent pointer-events-none rounded-2xl" />

          {/* Icon frame */}
          <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold shrink-0 border border-gold/15 relative z-10">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 leading-tight select-none relative z-10">
            <h5 className="font-sans font-bold text-xs uppercase text-white tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              {toast.title}
            </h5>
            <p className="font-sans text-[11px] text-zinc-400 font-normal leading-relaxed mt-2">
              {toast.message}
            </p>
          </div>

          <button 
            type="button"
            onClick={() => setToast(null)}
            className="text-zinc-550 hover:text-white cursor-pointer p-1 transition-colors relative z-10"
            aria-label="Ok"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
