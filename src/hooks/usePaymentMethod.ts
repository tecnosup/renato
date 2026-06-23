"use client";

import { useMemo, useState } from "react";

/**
 * Estado e validação de pagamento "na hora" (presencial), compartilhado entre os
 * fluxos do cliente: checkout de produto, agendamento e agenda. NÃO há gateway —
 * tudo é client-side. O vocabulário das formas espelha o caixa do admin
 * (lib/comandas + financeiro), para o dado bater quando a integração existir.
 */

export type FormaPagamento = "Dinheiro" | "Pix" | "Cartão Débito" | "Cartão Crédito";

export const FORMAS_PAGAMENTO: readonly FormaPagamento[] = [
  "Dinheiro",
  "Pix",
  "Cartão Débito",
  "Cartão Crédito",
] as const;

/** Débito e Crédito usam o mesmo formulário de cartão (só muda o rótulo). */
export function isCartao(forma: FormaPagamento): boolean {
  return forma === "Cartão Débito" || forma === "Cartão Crédito";
}

export interface UsePaymentMethod {
  forma: FormaPagamento;
  setForma: (f: FormaPagamento) => void;

  // Campos do cartão (controlados; nada é enviado a lugar nenhum).
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
  setCardName: (v: string) => void;
  setCardCvv: (v: string) => void;
  onCardNumber: (v: string) => void;
  onExpiry: (v: string) => void;

  // Validação derivada.
  luhnValid: boolean;
  cardComplete: boolean;
  /** Pode prosseguir com o pagamento na forma escolhida. */
  canPay: boolean;

  reset: () => void;
}

export function usePaymentMethod(initial: FormaPagamento = "Pix"): UsePaymentMethod {
  const [forma, setForma] = useState<FormaPagamento>(initial);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const cardDigits = cardNumber.replace(/\D/g, "");

  // Validação Luhn — só habilita pagamento com número plausível.
  const luhnValid = useMemo(() => {
    if (cardDigits.length < 13) return false;
    let sum = 0;
    let dbl = false;
    for (let i = cardDigits.length - 1; i >= 0; i--) {
      let d = Number(cardDigits[i]);
      if (dbl) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }, [cardDigits]);

  const cardComplete =
    luhnValid &&
    cardName.trim().length > 2 &&
    /^\d{2}\/\d{2}$/.test(cardExpiry) &&
    cardCvv.replace(/\D/g, "").length >= 3;

  const canPay = isCartao(forma) ? cardComplete : true;

  // Máscaras de entrada.
  const onCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
  };
  const onExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    setCardExpiry(d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };

  const reset = () => {
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
  };

  return {
    forma,
    setForma,
    cardNumber,
    cardName,
    cardExpiry,
    cardCvv,
    setCardName,
    setCardCvv: (v: string) => setCardCvv(v.replace(/\D/g, "").slice(0, 4)),
    onCardNumber,
    onExpiry,
    luhnValid,
    cardComplete,
    canPay,
    reset,
  };
}
