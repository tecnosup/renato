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
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Minus,
  Plus,
  MapPin,
} from 'lucide-react';
import type { Product } from '@/lib/types';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { usePaymentMethod } from '@/hooks/usePaymentMethod';
import PaymentMethodFields from './PaymentMethodFields';

type Step = 'checkout' | 'processando' | 'sucesso';

interface ProductCheckoutProps {
  product: Product;
  onClose: () => void;
}

/**
 * Checkout de produto (simulado — sem banco/gateway real).
 *
 * Layout tradicional de 2 colunas em TELA ÚNICA (estilo e-commerce): à esquerda
 * o formulário (contato + forma de pagamento), à direita o resumo do pedido
 * fixo. Sem login: quem compra produto avulso não é assinante (a "Área do
 * Cliente" é só para assinantes), então só pedimos nome + telefone para
 * identificar a retirada.
 *
 * Toda a "transação" é client-side: o `processando` é um setTimeout e o
 * número do pedido é gerado localmente. Nenhuma chamada de rede.
 */
export default function ProductCheckout({ product, onClose }: ProductCheckoutProps) {
  const [step, setStep] = useState<Step>('checkout');
  const [qty, setQty] = useState(1);
  const [orderId, setOrderId] = useState('');

  // Contato do comprador (sem login — só identifica o pedido na retirada).
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  // Forma de pagamento "na hora" (estado + validação compartilhados).
  const payment = usePaymentMethod('Pix');
  const isDinheiro = payment.forma === 'Dinheiro';

  const maxStock = product.stock > 0 ? product.stock : 99;
  const subtotal = product.price * qty;

  // Contato mínimo preenchido (nome + telefone com dígitos suficientes).
  const contatoOk = nome.trim().length > 1 && telefone.replace(/\D/g, '').length >= 10;
  const canFinish = contatoOk && payment.canPay;

  // Trava o scroll do fundo enquanto o checkout está aberto (fecha só no X/ESC).
  useLockBodyScroll(true);

  // Avisa a landing que um overlay está aberto (a barra fixa "Agendar Agora"
  // recua para não tapar o checkout).
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('overlay-open', { detail: true }));
    return () => {
      window.dispatchEvent(new CustomEvent('overlay-open', { detail: false }));
    };
  }, []);

  // Fecha no ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Máscara simples de telefone BR: (00) 00000-0000
  const onTelefone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    setTelefone(out);
  };

  // Código PIX copia-e-cola fake (formato visualmente plausível) — placeholder
  // até existir gateway. O valor entra no campo de valor do payload Pix.
  const pixCode = useMemo(
    () =>
      `00020126360014BR.GOV.BCB.PIX0114+5512996555081520400005303986540${subtotal
        .toFixed(2)
        .replace('.', '')}5802BR5913SECULO XXI SA6008CRUZEIRO62070503***6304SX21`,
    [subtotal],
  );

  // Dispara o "pagamento" simulado
  const handlePay = () => {
    if (!canFinish) return;
    setStep('processando');
    const id = 'SX-' + Math.floor(100000 + Math.random() * 899999);
    setTimeout(() => {
      setOrderId(id);
      setStep('sucesso');
    }, 2200);
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
        className="relative w-full max-w-3xl bg-[#0b0b0d] bg-tijolo border-2 border-black rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.85),0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={`Comprar ${product.name}`}
      >
        {/* Glow ambiente — glow-decor: só no desktop (blur caro no mobile) */}
        <div className="glow-decor absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-brand-blue/15 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between gap-3 px-5 py-4 border-b border-white/5 shrink-0 z-10">
          <div className="flex flex-col leading-none">
            <span className="font-mono text-[8px] text-brand-blue uppercase tracking-[0.25em] font-black">
              SÉCULO XXI • LOJA
            </span>
            <span className="font-toon text-logo-3d text-lg uppercase tracking-wide mt-1" data-text="Finalizar compra">
              Finalizar compra
            </span>
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

        {/* Corpo */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* TELA ÚNICA — CHECKOUT (2 colunas) */}
            {step === 'checkout' && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-[1fr_320px]"
              >
                {/* ===== COLUNA ESQUERDA — FORMULÁRIO ===== */}
                <div className="px-5 py-5 space-y-5 md:border-r md:border-white/5">

                  {/* Contato */}
                  <div className="space-y-3">
                    <h4 className="font-display font-black text-[11px] text-zinc-100 uppercase tracking-widest">
                      Seus dados
                    </h4>
                    <div>
                      <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                        Nome completo
                      </label>
                      <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-sans text-sm text-white placeholder:text-zinc-700 focus:border-brand-blue/60 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                        Telefone (WhatsApp)
                      </label>
                      <input
                        inputMode="numeric"
                        value={telefone}
                        onChange={(e) => onTelefone(e.target.value)}
                        placeholder="(12) 99999-9999"
                        className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-sans text-sm text-white placeholder:text-zinc-700 focus:border-brand-blue/60 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Forma de pagamento */}
                  <div className="space-y-3">
                    <h4 className="font-display font-black text-[11px] text-zinc-100 uppercase tracking-widest">
                      Pagamento
                    </h4>
                    <PaymentMethodFields
                      payment={payment}
                      pixCode={pixCode}
                      dinheiroHint="Seu pedido será reservado e você paga em dinheiro ao retirar no salão. Guardamos o item por 48h."
                    />
                  </div>

                  {/* Aviso de retirada */}
                  <div className="flex items-start gap-2.5 bg-brand-blue/5 border border-brand-blue/20 rounded-xl px-3.5 py-3">
                    <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <p className="font-sans text-[10.5px] text-zinc-400 leading-normal">
                      A retirada é feita no salão em <strong className="text-zinc-200">Cruzeiro/SP</strong>. Separamos seu pedido assim que o pagamento for confirmado.
                    </p>
                  </div>
                </div>

                {/* ===== COLUNA DIREITA — RESUMO DO PEDIDO ===== */}
                <aside className="px-5 py-5 bg-white/[0.02] space-y-4">
                  <h4 className="font-display font-black text-[11px] text-zinc-100 uppercase tracking-widest">
                    Seu pedido
                  </h4>

                  {/* Card do produto */}
                  <div className="flex gap-3 bg-white/[0.03] border-2 border-black/55 rounded-2xl p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <div className="w-16 h-16 shrink-0 rounded-xl bg-zinc-950 border border-zinc-800 grid place-items-center overflow-hidden">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-7 h-7 text-zinc-700" />
                      )}
                    </div>
                    <div className="flex flex-col justify-between min-w-0 flex-1">
                      <div>
                        <h5 className="font-display font-black text-xs text-zinc-100 uppercase leading-tight">
                          {product.name}
                        </h5>
                        {product.volume && (
                          <span className="font-mono text-[9px] text-zinc-500 uppercase">{product.volume}</span>
                        )}
                      </div>
                      <span className="font-display font-extrabold text-sm text-brand-blue">
                        R$ {product.price},00
                      </span>
                    </div>
                  </div>

                  {/* Quantidade */}
                  <div className="flex items-center justify-between bg-white/[0.03] border-2 border-black/55 rounded-2xl px-4 py-2.5">
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                      Quantidade
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        className="w-7 h-7 grid place-items-center rounded-lg bg-[#16161a] border-2 border-black text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.8)] active:translate-y-[2px] active:shadow-none transition-all"
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
                        className="w-7 h-7 grid place-items-center rounded-lg bg-[#16161a] border-2 border-black text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.8)] active:translate-y-[2px] active:shadow-none transition-all"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Totais */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Subtotal</span>
                      <span className="font-display font-bold text-sm text-zinc-200">R$ {subtotal},00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total</span>
                      <span className="font-display font-black text-xl text-white">R$ {subtotal},00</span>
                    </div>
                  </div>

                  {/* CTA finalizar */}
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={!canFinish}
                    className="relative overflow-hidden w-full btn-game text-sm uppercase py-3.5 rounded-xl border-2 border-black/55 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] group/pay"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/pay:animate-shimmer" />
                    <ShieldCheck className="w-4 h-4" />
                    {isDinheiro ? 'Reservar pedido' : `Pagar R$ ${subtotal},00`}
                  </button>
                  {!contatoOk && (
                    <p className="font-mono text-[8.5px] text-zinc-600 uppercase tracking-widest text-center">
                      Preencha nome e telefone para continuar
                    </p>
                  )}
                  <p className="flex items-center justify-center gap-1.5 font-mono text-[8px] text-zinc-600 uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" /> Ambiente seguro • Século XXI
                  </p>
                </aside>
              </motion.div>
            )}

            {/* PROCESSANDO */}
            {step === 'processando' && (
              <motion.div
                key="processando"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-20 px-5 space-y-4"
              >
                <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
                <div>
                  <p className="font-display font-black text-sm text-white uppercase tracking-wide">
                    {isDinheiro ? 'Reservando pedido' : 'Processando pagamento'}
                  </p>
                  <p className="font-sans text-[11px] text-zinc-500 mt-1">Aguarde um instante…</p>
                </div>
              </motion.div>
            )}

            {/* SUCESSO */}
            {step === 'sucesso' && (
              <motion.div
                key="sucesso"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center py-12 px-5 space-y-4"
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
                  <h4 className="font-toon text-logo-3d text-xl uppercase tracking-wide" data-text={isDinheiro ? 'Pedido reservado!' : 'Pagamento aprovado!'}>
                    {isDinheiro ? 'Pedido reservado!' : 'Pagamento aprovado!'}
                  </h4>
                  <p className="font-sans text-[11px] text-zinc-400 leading-normal mt-2 max-w-xs mx-auto">
                    {qty}× <strong className="text-zinc-200">{product.name}</strong>{' '}
                    {isDinheiro
                      ? 'reservado. Pague em dinheiro ao retirar no salão.'
                      : 'confirmado. Já estamos separando para retirada no salão.'}
                  </p>
                </div>
                <div className="w-full max-w-xs bg-[#0e0e11] border-2 border-black rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Nº do pedido</span>
                  <span className="font-mono text-sm text-brand-blue font-bold tracking-widest">{orderId}</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full max-w-xs btn-game text-sm uppercase py-3.5 rounded-xl border-2 border-black/55 bg-brand-blue hover:bg-brand-blue-deep transition-all cursor-pointer active:scale-[0.98]"
                >
                  Concluir
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
