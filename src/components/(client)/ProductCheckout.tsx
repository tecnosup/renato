"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  QrCode,
  CreditCard,
  Banknote,
  Copy,
  Check,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ChevronLeft,
  Minus,
  Plus,
  MapPin,
} from 'lucide-react';
import type { Product } from '@/lib/types';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

type Step = 'resumo' | 'pagamento' | 'processando' | 'sucesso';
type PayMethod = 'pix' | 'cartao' | 'dinheiro';

interface ProductCheckoutProps {
  product: Product;
  onClose: () => void;
}

/**
 * Checkout de produto (simulado — sem banco/gateway real).
 *
 * Fluxo em passos: resumo → pagamento (PIX / cartão / dinheiro) →
 * processando (spinner fake) → sucesso (nº do pedido + retirada no salão).
 *
 * Toda a "transação" é client-side: o `processando` é um setTimeout e o
 * número do pedido é gerado localmente. Nenhuma chamada de rede.
 */
export default function ProductCheckout({ product, onClose }: ProductCheckoutProps) {
  const [step, setStep] = useState<Step>('resumo');
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState<PayMethod>('pix');
  const [orderId, setOrderId] = useState('');
  const [pixCopied, setPixCopied] = useState(false);

  // Campos do cartão (apenas client-side; nada é enviado a lugar nenhum)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const maxStock = product.stock > 0 ? product.stock : 99;
  const subtotal = product.price * qty;

  // Trava o scroll do fundo enquanto o checkout está aberto (fecha só no X/ESC).
  useLockBodyScroll(true);

  // Avisa a landing que um overlay está aberto (a barra fixa "Agendar Agora"
  // recua para não tapar o checkout).
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('overlay-open', { detail: true }));
    return () => window.dispatchEvent(new CustomEvent('overlay-open', { detail: false }));
  }, []);

  // Fecha no ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Código PIX copia-e-cola fake (formato visualmente plausível)
  const pixCode = useMemo(
    () =>
      `00020126360014BR.GOV.BCB.PIX0114+5512996555081520400005303986540${subtotal
        .toFixed(2)
        .replace('.', '')}5802BR5913SECULO XXI SA6008CRUZEIRO62070503***6304SX21`,
    [subtotal],
  );

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  // Validação Luhn (cartão) — só habilita o pagamento com número plausível
  const cardDigits = cardNumber.replace(/\D/g, '');
  const luhnValid = useMemo(() => {
    if (cardDigits.length < 13) return false;
    let sum = 0;
    let dbl = false;
    for (let i = cardDigits.length - 1; i >= 0; i--) {
      let d = Number(cardDigits[i]);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }, [cardDigits]);

  const cardComplete =
    luhnValid &&
    cardName.trim().length > 2 &&
    /^\d{2}\/\d{2}$/.test(cardExpiry) &&
    cardCvv.replace(/\D/g, '').length >= 3;

  const canPay =
    method === 'pix' || method === 'dinheiro' || (method === 'cartao' && cardComplete);

  // Dispara o "pagamento" simulado
  const handlePay = () => {
    setStep('processando');
    const id = 'SX-' + Math.floor(100000 + Math.random() * 899999);
    setTimeout(() => {
      setOrderId(id);
      setStep('sucesso');
    }, 2200);
  };

  // Máscaras
  const onCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
  };
  const onExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    setCardExpiry(d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      id="product-checkout-overlay"
    >
      {/* Backdrop — sem fechar ao clicar (saída só pelo X/ESC) */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Painel */}
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative w-full max-w-lg bg-[#0b0b0d] bg-tijolo border-2 border-black rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.85),0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden max-h-[88vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={`Comprar ${product.name}`}
      >
        {/* Glow ambiente — glow-decor: só no desktop (blur caro no mobile) */}
        <div className="glow-decor absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-brand-blue/15 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between gap-3 px-5 py-4 border-b border-white/5 shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            {step !== 'resumo' && step !== 'sucesso' && (
              <button
                type="button"
                onClick={() => setStep('resumo')}
                className="w-8 h-8 grid place-items-center rounded-lg bg-[#16161a] border-2 border-black text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.8)] active:translate-y-[2px] active:shadow-none"
                aria-label="Voltar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex flex-col leading-none">
              <span className="font-mono text-[8px] text-brand-blue uppercase tracking-[0.25em] font-black">
                SÉCULO XXI • LOJA
              </span>
              <span className="font-toon text-logo-3d text-lg uppercase tracking-wide mt-1" data-text="Comprar">
                Comprar
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg bg-[#16161a] border-2 border-black text-zinc-400 hover:text-white transition-colors cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.8)] active:translate-y-[2px] active:shadow-none"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo (scrollável) */}
        <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5">
          <AnimatePresence mode="wait">

            {/* PASSO 1 — RESUMO */}
            {step === 'resumo' && (
              <motion.div
                key="resumo"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Card do produto */}
                <div className="flex gap-4 bg-white/[0.03] border-2 border-black/55 rounded-2xl p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="w-24 h-24 shrink-0 rounded-xl bg-zinc-950 border border-zinc-800 grid place-items-center overflow-hidden">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-zinc-700" />
                    )}
                  </div>
                  <div className="flex flex-col justify-between min-w-0 flex-1">
                    <div>
                      <h4 className="font-display font-black text-sm text-zinc-100 uppercase leading-tight">
                        {product.name}
                      </h4>
                      {product.volume && (
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">{product.volume}</span>
                      )}
                    </div>
                    <span className="font-display font-extrabold text-lg text-brand-blue">
                      R$ {product.price},00
                    </span>
                  </div>
                </div>

                {/* Quantidade */}
                <div className="flex items-center justify-between bg-white/[0.03] border-2 border-black/55 rounded-2xl px-4 py-3">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                    Quantidade
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="w-8 h-8 grid place-items-center rounded-lg bg-[#16161a] border-2 border-black text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.8)] active:translate-y-[2px] active:shadow-none transition-all"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-display font-black text-base text-white w-6 text-center tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
                      disabled={qty >= maxStock}
                      className="w-8 h-8 grid place-items-center rounded-lg bg-[#16161a] border-2 border-black text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.8)] active:translate-y-[2px] active:shadow-none transition-all"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Aviso de retirada */}
                <div className="flex items-start gap-2.5 bg-brand-blue/5 border border-brand-blue/20 rounded-xl px-3.5 py-3">
                  <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <p className="font-sans text-[10.5px] text-zinc-400 leading-normal">
                    A retirada é feita no salão em <strong className="text-zinc-200">Cruzeiro/SP</strong>. Separamos seu pedido assim que o pagamento for confirmado.
                  </p>
                </div>
              </motion.div>
            )}

            {/* PASSO 2 — PAGAMENTO */}
            {step === 'pagamento' && (
              <motion.div
                key="pagamento"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Seletor de método */}
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'pix', label: 'PIX', icon: QrCode },
                    { key: 'cartao', label: 'Cartão', icon: CreditCard },
                    { key: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                  ] as const).map(({ key, label, icon: Icon }) => {
                    const active = method === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMethod(key)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 border-black transition-all cursor-pointer ${
                          active
                            ? 'bg-brand-blue text-white shadow-[0_4px_0_rgba(0,0,0,0.85)]'
                            : 'bg-[#0e0e11] text-zinc-400 hover:text-white shadow-[0_4px_0_rgba(0,0,0,0.6)] active:translate-y-[2px] active:shadow-none'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-display font-black text-[9px] uppercase tracking-widest">{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* PIX */}
                {method === 'pix' && (
                  <div className="flex flex-col items-center text-center space-y-3 bg-white/[0.03] border-2 border-black/55 rounded-2xl p-5">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-xl grid place-items-center p-2.5">
                      {/* QR-code decorativo (mockado) */}
                      <QrCode className="w-full h-full text-black" strokeWidth={1} />
                    </div>
                    <p className="font-sans text-[11px] text-zinc-400 leading-normal max-w-xs">
                      Abra o app do seu banco, escaneie o QR ou use o código copia-e-cola abaixo.
                    </p>
                    <button
                      type="button"
                      onClick={copyPix}
                      className="w-full flex items-center justify-between gap-2 bg-[#0e0e11] border-2 border-black rounded-xl px-3.5 py-2.5 text-left cursor-pointer hover:border-brand-blue/50 transition-colors"
                    >
                      <span className="font-mono text-[9px] text-zinc-400 truncate">{pixCode}</span>
                      <span className="shrink-0 text-brand-blue">
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

                {/* CARTÃO */}
                {method === 'cartao' && (
                  <div className="space-y-3 bg-white/[0.03] border-2 border-black/55 rounded-2xl p-4">
                    <div>
                      <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                        Número do cartão
                      </label>
                      <input
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => onCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-mono text-sm text-white tracking-widest placeholder:text-zinc-700 focus:border-brand-blue/60 outline-none transition-colors"
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
                        className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-mono text-sm text-white uppercase placeholder:text-zinc-700 focus:border-brand-blue/60 outline-none transition-colors"
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
                          className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-mono text-sm text-white tracking-widest placeholder:text-zinc-700 focus:border-brand-blue/60 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                          CVV
                        </label>
                        <input
                          inputMode="numeric"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="000"
                          className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-mono text-sm text-white tracking-widest placeholder:text-zinc-700 focus:border-brand-blue/60 outline-none transition-colors"
                        />
                      </div>
                    </div>
                    {cardDigits.length >= 13 && !luhnValid && (
                      <p className="font-mono text-[9px] text-rose-400 uppercase tracking-wide">
                        Número de cartão inválido
                      </p>
                    )}
                  </div>
                )}

                {/* DINHEIRO */}
                {method === 'dinheiro' && (
                  <div className="flex items-start gap-3 bg-white/[0.03] border-2 border-black/55 rounded-2xl p-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 grid place-items-center text-emerald-400">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
                      Seu pedido será <strong className="text-zinc-200">reservado</strong> e você paga em dinheiro ao retirar no salão. Guardamos o item por 48h.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* PASSO 3 — PROCESSANDO */}
            {step === 'processando' && (
              <motion.div
                key="processando"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-14 space-y-4"
              >
                <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                <div>
                  <p className="font-display font-black text-sm text-white uppercase tracking-wide">
                    {method === 'dinheiro' ? 'Reservando pedido' : 'Processando pagamento'}
                  </p>
                  <p className="font-sans text-[11px] text-zinc-500 mt-1">Aguarde um instante…</p>
                </div>
              </motion.div>
            )}

            {/* PASSO 4 — SUCESSO */}
            {step === 'sucesso' && (
              <motion.div
                key="sucesso"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center py-8 space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/50 grid place-items-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                  <CheckCircle2 className="w-9 h-9" />
                </motion.div>
                <div>
                  <h4 className="font-toon text-logo-3d text-xl uppercase tracking-wide" data-text={method === 'dinheiro' ? 'Pedido reservado!' : 'Pagamento aprovado!'}>
                    {method === 'dinheiro' ? 'Pedido reservado!' : 'Pagamento aprovado!'}
                  </h4>
                  <p className="font-sans text-[11px] text-zinc-400 leading-normal mt-2 max-w-xs mx-auto">
                    {qty}× <strong className="text-zinc-200">{product.name}</strong>{' '}
                    {method === 'dinheiro'
                      ? 'reservado. Pague em dinheiro ao retirar no salão.'
                      : 'confirmado. Já estamos separando para retirada no salão.'}
                  </p>
                </div>
                <div className="w-full bg-[#0e0e11] border-2 border-black rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Nº do pedido</span>
                  <span className="font-mono text-sm text-brand-blue font-bold tracking-widest">{orderId}</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Rodapé fixo com total + CTA */}
        {(step === 'resumo' || step === 'pagamento') && (
          <div className="relative z-10 border-t border-white/5 px-5 py-4 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total</span>
              <span className="font-display font-black text-xl text-white">R$ {subtotal},00</span>
            </div>
            {step === 'resumo' ? (
              <button
                type="button"
                onClick={() => setStep('pagamento')}
                className="relative overflow-hidden w-full btn-game text-sm uppercase py-3.5 rounded-xl border-2 border-black/55 bg-brand-blue hover:bg-brand-blue-deep transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] group/cta"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/cta:animate-shimmer" />
                Ir para pagamento
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePay}
                disabled={!canPay}
                className="relative overflow-hidden w-full btn-game text-sm uppercase py-3.5 rounded-xl border-2 border-black/55 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] group/pay"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/pay:animate-shimmer" />
                <ShieldCheck className="w-4 h-4" />
                {method === 'dinheiro' ? 'Reservar pedido' : `Pagar R$ ${subtotal},00`}
              </button>
            )}
            <p className="flex items-center justify-center gap-1.5 font-mono text-[8px] text-zinc-600 uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Ambiente seguro • Século XXI
            </p>
          </div>
        )}

        {/* Rodapé do sucesso */}
        {step === 'sucesso' && (
          <div className="relative z-10 border-t border-white/5 px-5 py-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full btn-game text-sm uppercase py-3.5 rounded-xl border-2 border-black/55 bg-brand-blue hover:bg-brand-blue-deep transition-all cursor-pointer active:scale-[0.98]"
            >
              Concluir
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
