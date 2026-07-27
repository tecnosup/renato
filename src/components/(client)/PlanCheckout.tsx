"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Check,
  Crown,
  CalendarClock,
} from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { usePaymentMethod } from '@/hooks/usePaymentMethod';
import PaymentMethodFields from './PaymentMethodFields';

type Step = 'checkout' | 'processando' | 'sucesso';

/** Dados mínimos do plano que a tela de assinatura precisa exibir. */
export interface PlanSummary {
  id: string;
  name: string;
  price: number;
  period: string;
  tagline: string;
  benefits: string[];
}

interface PlanCheckoutProps {
  plan: PlanSummary;
  onClose: () => void;
}

/**
 * Checkout de ASSINATURA (plano do Clube) — simulado, sem gateway real.
 *
 * Mesmo molde do checkout de produto: tela única de 2 colunas no tema street.
 * À esquerda os dados do assinante + forma de pagamento; à direita o resumo do
 * plano com seus benefícios. A cobrança recorrente é acompanhada depois pela
 * automação de WhatsApp (avisos de pagamento), por isso aceitamos as 4 formas.
 *
 * Toda a "transação" é client-side: o `processando` é um setTimeout e o número
 * da assinatura é gerado localmente. Nenhuma chamada de rede.
 */
export default function PlanCheckout({ plan, onClose }: PlanCheckoutProps) {
  const [step, setStep] = useState<Step>('checkout');
  const [subId, setSubId] = useState('');

  // Dados do assinante (sem login — cria-se o vínculo na ativação).
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  const payment = usePaymentMethod('Pix');
  const isDinheiro = payment.forma === 'Dinheiro';

  const contatoOk = nome.trim().length > 1 && telefone.replace(/\D/g, '').length >= 10;
  const canFinish = contatoOk && payment.canPay;

  useLockBodyScroll(true);

  // Avisa a landing que um overlay está aberto (a barra fixa "Agendar" recua).
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

  // Máscara de telefone BR: (00) 00000-0000
  const onTelefone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    setTelefone(out);
  };

  // Código PIX copia-e-cola fake (placeholder até existir gateway).
  const pixCode = useMemo(
    () =>
      `00020126360014BR.GOV.BCB.PIX0114+5512996555081520400005303986540${plan.price
        .toFixed(2)
        .replace('.', '')}5802BR5913SECULO XXI SA6008CRUZEIRO62070503***6304SX21`,
    [plan.price],
  );

  const handleSubscribe = () => {
    if (!canFinish) return;
    setStep('processando');
    const id = 'SX-CLUBE-' + Math.floor(10000 + Math.random() * 89999);
    setTimeout(() => {
      setSubId(id);
      setStep('sucesso');
    }, 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      id="plan-checkout-overlay"
    >
      {/* Backdrop — sem fechar ao clicar (saída só pelo X/ESC) */}
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-sm" aria-hidden="true" />

      {/* Painel */}
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative w-full max-w-3xl bg-[#0b0b0d] border-2 border-black rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.85),0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={`Assinar ${plan.name}`}
      >
        {/* Glow ambiente — só no desktop */}
        <div className="glow-decor absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-xxi-graphite-hi blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.05)] shrink-0 z-10">
          <div className="flex flex-col leading-none">
            <span className="font-mono text-[8px] text-xxi-yellow uppercase tracking-[0.25em] font-black">
              SÉCULO XXI • CLUBE
            </span>
            <span className="xxi-title text-lg uppercase tracking-wide mt-1" data-text="Assinar plano">
              Assinar plano
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
                {/* ===== ESQUERDA — FORMULÁRIO ===== */}
                <div className="px-5 py-5 space-y-5 md:border-r md:border-[rgba(255,255,255,0.05)]">
                  {/* Dados do assinante */}
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
                        className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-sans text-sm text-white placeholder:text-zinc-700 focus:border-xxi-line outline-none transition-colors"
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
                        className="w-full bg-[#0e0e11] border-2 border-black rounded-lg px-3 py-2.5 font-sans text-sm text-white placeholder:text-zinc-700 focus:border-xxi-line outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Pagamento */}
                  <div className="space-y-3">
                    <h4 className="font-display font-black text-[11px] text-zinc-100 uppercase tracking-widest">
                      Pagamento
                    </h4>
                    <PaymentMethodFields
                      payment={payment}
                      pixCode={pixCode}
                      dinheiroHint="A primeira mensalidade pode ser paga em dinheiro no balcão. As próximas são lembradas pelo WhatsApp."
                    />
                  </div>

                  {/* Aviso de recorrência */}
                  <div className="flex items-start gap-2.5 bg-xxi-graphite-hi border border-xxi-line rounded-xl px-3.5 py-3">
                    <CalendarClock className="w-4 h-4 text-xxi-yellow shrink-0 mt-0.5" />
                    <p className="font-sans text-[10.5px] text-zinc-400 leading-normal">
                      Assinatura mensal de <strong className="text-zinc-200">R$ {plan.price}/{plan.period}</strong>. Você pode cancelar quando quiser, sem multa.
                    </p>
                  </div>
                </div>

                {/* ===== DIREITA — RESUMO DO PLANO ===== */}
                <aside className="px-5 py-5 bg-white/[0.02] space-y-4">
                  <h4 className="font-display font-black text-[11px] text-zinc-100 uppercase tracking-widest">
                    Seu plano
                  </h4>

                  {/* Card do plano */}
                  <div className="bg-white/[0.03] border-2 border-[rgba(0,0,0,0.55)] rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-xxi-yellow" />
                      <h5 className="font-display font-black text-sm text-white uppercase leading-tight">
                        {plan.name}
                      </h5>
                    </div>
                    <p className="font-sans text-[10.5px] text-zinc-400 leading-normal">{plan.tagline}</p>
                    <div className="flex items-baseline gap-1 pt-1">
                      <span className="font-display font-black text-2xl text-white">R$ {plan.price}</span>
                      <span className="font-mono text-[10px] text-zinc-500">/{plan.period}</span>
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="space-y-2">
                    <span className="font-mono text-[8px] text-xxi-yellow uppercase tracking-widest font-bold">
                      O que está incluso
                    </span>
                    <ul className="space-y-1.5">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="font-sans text-[10.5px] text-zinc-300 leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Total recorrente */}
                  <div className="border-t border-[rgba(255,255,255,0.05)] pt-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Hoje</span>
                    <span className="font-display font-black text-xl text-white">R$ {plan.price},00</span>
                  </div>

                  {/* CTA assinar */}
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={!canFinish}
                    className="relative overflow-hidden w-full text-sm uppercase py-3.5 rounded-xl border-2 border-[rgba(0,0,0,0.55)] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] group/pay"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.4)] to-transparent -translate-x-full group-hover/pay:animate-shimmer" />
                    <ShieldCheck className="w-4 h-4" />
                    {isDinheiro ? 'Reservar assinatura' : `Assinar por R$ ${plan.price},00`}
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
                <Loader2 className="w-10 h-10 text-xxi-yellow animate-spin" />
                <div>
                  <p className="font-display font-black text-sm text-white uppercase tracking-wide">
                    {isDinheiro ? 'Reservando assinatura' : 'Ativando assinatura'}
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
                  className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.15)] border-2 border-[rgba(16,185,129,0.5)] grid place-items-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                  <CheckCircle2 className="w-9 h-9" />
                </motion.div>
                <div>
                  <h4 className="xxi-title text-xl uppercase tracking-wide" data-text={isDinheiro ? 'Assinatura reservada!' : 'Bem-vindo ao Clube!'}>
                    {isDinheiro ? 'Assinatura reservada!' : 'Bem-vindo ao Clube!'}
                  </h4>
                  <p className="font-sans text-[11px] text-zinc-400 leading-normal mt-2 max-w-xs mx-auto">
                    Seu <strong className="text-zinc-200">{plan.name}</strong>{' '}
                    {isDinheiro
                      ? 'foi reservado. Ative no balcão na sua próxima visita.'
                      : 'está ativo. Aproveite seus benefícios já na próxima visita.'}
                  </p>
                </div>
                <div className="w-full max-w-xs bg-[#0e0e11] border-2 border-black rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Nº da assinatura</span>
                  <span className="font-mono text-sm text-xxi-yellow font-bold tracking-widest">{subId}</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full max-w-xs text-sm uppercase py-3.5 rounded-xl border-2 border-[rgba(0,0,0,0.55)] bg-xxi-yellow hover:bg-xxi-yellow transition-all cursor-pointer active:scale-[0.98]"
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
