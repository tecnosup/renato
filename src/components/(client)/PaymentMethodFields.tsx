"use client";

import { useState } from "react";
import { QrCode, CreditCard, Banknote, Landmark, Copy, Check } from "lucide-react";
import {
  FORMAS_PAGAMENTO,
  isCartao,
  type FormaPagamento,
  type UsePaymentMethod,
} from "@/hooks/usePaymentMethod";

/** Ícone por forma de pagamento (vocabulário do caixa do admin). */
const FORMA_ICON: Record<FormaPagamento, typeof QrCode> = {
  "Dinheiro": Banknote,
  "Pix": QrCode,
  "Cartão Débito": Landmark,
  "Cartão Crédito": CreditCard,
};

/** Rótulo curto p/ o card do seletor (cabe melhor em 4 colunas). */
const FORMA_LABEL: Record<FormaPagamento, string> = {
  "Dinheiro": "Dinheiro",
  "Pix": "Pix",
  "Cartão Débito": "Débito",
  "Cartão Crédito": "Crédito",
};

interface PaymentMethodFieldsProps {
  /** Estado vindo do hook usePaymentMethod (controlado pela tela). */
  payment: UsePaymentMethod;
  /** Código Pix copia-e-cola (placeholder até existir gateway). Não usado em selectorOnly. */
  pixCode?: string;
  /** Texto de retirada/realização do dinheiro (varia por contexto). */
  dinheiroHint?: string;
  /**
   * Só o seletor de forma + aviso de presencial, sem QR do Pix nem formulário de
   * cartão. Usado no agendamento, onde o cliente apenas DECLARA como vai pagar
   * (paga no balcão). No checkout de produto fica false (fluxo completo).
   */
  selectorOnly?: boolean;
}

/**
 * Seleção de forma de pagamento "na hora" + painel da forma escolhida
 * (Pix com QR placeholder + copia-e-cola, formulário de cartão, aviso de
 * dinheiro). Compartilhado entre checkout de produto, agendamento e agenda —
 * cada tela monta o modal/passos em volta. Sem gateway: tudo client-side.
 */
export default function PaymentMethodFields({
  payment,
  pixCode = "",
  dinheiroHint = "Você paga em dinheiro no balcão, presencialmente, no dia do atendimento.",
  selectorOnly = false,
}: PaymentMethodFieldsProps) {
  const {
    forma,
    setForma,
    cardNumber,
    cardName,
    cardExpiry,
    cardCvv,
    setCardName,
    setCardCvv,
    onCardNumber,
    onExpiry,
    luhnValid,
  } = payment;

  const [pixCopied, setPixCopied] = useState(false);
  const copyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  const cardDigitsLen = cardNumber.replace(/\D/g, "").length;

  return (
    <div className="space-y-4">
      {/* Seletor de forma — 4 cards (espelha o caixa do admin) */}
      <div className="grid grid-cols-4 gap-2">
        {FORMAS_PAGAMENTO.map((f) => {
          const Icon = FORMA_ICON[f];
          const active = forma === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setForma(f)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 border-black transition-all cursor-pointer ${
                active
                  ? "bg-xxi-yellow text-white shadow-[0_4px_0_rgba(0,0,0,0.85)]"
                  : "bg-[#0e0e11] text-zinc-400 hover:text-white shadow-[0_4px_0_rgba(0,0,0,0.6)] active:translate-y-[2px] active:shadow-none"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-display font-black text-[8px] uppercase tracking-widest">
                {FORMA_LABEL[f]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Aviso global: pagamento presencial */}
      <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest text-center">
        Pagamento presencial • no balcão do salão
      </p>

      {/* Painéis detalhados (QR Pix, form de cartão, aviso dinheiro). No modo
          selectorOnly o cliente apenas DECLARA a forma — sem QR nem form. */}
      {!selectorOnly && (
        <>
      {/* PIX */}
      {forma === "Pix" && (
        <div className="flex flex-col items-center text-center space-y-3 bg-white/[0.03] border-2 border-[rgba(0,0,0,0.55)] rounded-2xl p-5">
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-xl grid place-items-center p-2.5">
            {/* QR placeholder (estático) — ligar gerador real depois */}
            <QrCode className="w-full h-full text-black" strokeWidth={1} />
          </div>
          <p className="font-sans text-[11px] text-zinc-400 leading-normal max-w-xs">
            Abra o app do seu banco, escaneie o QR ou use o código copia-e-cola abaixo.
          </p>
          <button
            type="button"
            onClick={copyPix}
            className="w-full flex items-center justify-between gap-2 bg-[#0e0e11] border-2 border-black rounded-xl px-3.5 py-2.5 text-left cursor-pointer hover:border-xxi-line transition-colors"
          >
            <span className="font-mono text-[9px] text-zinc-400 truncate">{pixCode}</span>
            <span className="shrink-0 text-xxi-yellow">
              {pixCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </span>
          </button>
          {pixCopied && (
            <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest font-bold">
              Código copiado!
            </span>
          )}
        </div>
      )}

      {/* CARTÃO (Débito ou Crédito — mesmos campos) */}
      {isCartao(forma) && (
        <div className="space-y-3 bg-white/[0.03] border-2 border-[rgba(0,0,0,0.55)] rounded-2xl p-4">
          <div>
            <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
              Número do cartão
            </label>
            <input
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => onCardNumber(e.target.value)}
              placeholder="0000 0000 0000 0000"
              className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-mono text-sm text-white tracking-widest placeholder:text-zinc-700 focus:border-xxi-line outline-none transition-colors"
            />
          </div>
          <div>
            <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
              Nome impresso
            </label>
            <input
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="COMO ESTÁ NO CARTÃO"
              className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-mono text-sm text-white uppercase placeholder:text-zinc-700 focus:border-xxi-line outline-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                Validade
              </label>
              <input
                inputMode="numeric"
                value={cardExpiry}
                onChange={(e) => onExpiry(e.target.value)}
                placeholder="MM/AA"
                className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-mono text-sm text-white tracking-widest placeholder:text-zinc-700 focus:border-xxi-line outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                CVV
              </label>
              <input
                inputMode="numeric"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                placeholder="000"
                className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-mono text-sm text-white tracking-widest placeholder:text-zinc-700 focus:border-xxi-line outline-none transition-colors"
              />
            </div>
          </div>
          {cardDigitsLen >= 13 && !luhnValid && (
            <p className="font-mono text-[9px] text-rose-400 uppercase tracking-wide">
              Número de cartão inválido
            </p>
          )}
        </div>
      )}

      {/* DINHEIRO */}
      {forma === "Dinheiro" && (
        <div className="flex items-start gap-3 bg-white/[0.03] border-2 border-[rgba(0,0,0,0.55)] rounded-2xl p-4">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[rgba(16,185,129,0.15)] border-2 border-[rgba(16,185,129,0.4)] grid place-items-center text-emerald-400">
            <Banknote className="w-5 h-5" />
          </div>
          <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">{dinheiroHint}</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
