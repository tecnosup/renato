import { Check } from "lucide-react";

/**
 * Feedback de sucesso padrão (mesmo visual do "Pagamento confirmado"): círculo
 * dourado com pop-in e check grosso. Use em modais após concluir uma ação.
 */
export function SuccessSplash({ message, subtitle }: { message: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
      <div className="success-pop flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 shadow-[0_0_28px_rgba(194,163,93,0.55)]">
        <Check className="w-8 h-8" strokeWidth={3} />
      </div>
      <p className="text-base font-bold admin-text-primary">{message}</p>
      {subtitle && <p className="text-xs admin-text-secondary text-center">{subtitle}</p>}
    </div>
  );
}
