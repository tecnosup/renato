"use client";
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone, ArrowUpRight } from 'lucide-react';

/**
 * Mapa do endereço da Século XXI (Cruzeiro-SP).
 *
 * Decisão de design (pedido do cliente): o mapa NÃO é interativo dentro da
 * landing — o usuário não arrasta/zoom. Um overlay transparente cobre o iframe
 * (pointer-events liberados só nele) e, ao clicar, abre o Google Maps em nova
 * aba já apontando para a barbearia. Sem API key, sem custo.
 */

// Dados reais da unidade (Google). Trocar aqui se a barbearia mudar de endereço.
const ENDERECO = {
  nome: 'Barbearia Século XXI',
  rua: 'R. Dr. José Rodrigues Alves Sobrinho, 351',
  bairro: 'Vila Paulo Romeu',
  cidade: 'Cruzeiro - SP',
  cep: '12710-410',
  telefone: '(12) 99655-5081',
  telefoneRaw: '5512996555081',
};

// Query usada tanto no embed quanto no link "abrir no Google".
const MAPS_QUERY = encodeURIComponent(
  `${ENDERECO.nome}, ${ENDERECO.rua}, ${ENDERECO.bairro}, ${ENDERECO.cidade}, ${ENDERECO.cep}`
);

// Embed gratuito (sem key) via /maps?output=embed. Mapa real, travado pelo overlay.
const EMBED_SRC = `https://www.google.com/maps?q=${MAPS_QUERY}&z=16&output=embed`;
// Link que abre o app/site do Google Maps com o pin certo.
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;

export default function LocationMap() {
  return (
    <section
      className="w-full bg-transparent py-12 sm:py-20 md:py-24 px-4 md:px-8 border-t border-white/5 relative z-10 scroll-mt-20 md:scroll-mt-24"
      id="localizacao"
    >
      {/* Glow ambiente dourado de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c8ccd4]/5 rounded-full blur-[140px] pointer-events-none hidden md:block" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header da seção */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-10 select-none"
        >
          <span className="font-sans text-[8px] text-[#c8ccd4] tracking-[0.25em] uppercase flex items-center gap-2 font-bold mb-3">
            <MapPin className="w-3 h-3" />
            SÉCULO XXI • ONDE NOS ENCONTRAR
          </span>
          <h2 className="font-display font-light text-3xl md:text-5xl text-white uppercase tracking-wide">
            Visite o <span className="text-[#c8ccd4] italic font-serif font-light">Nosso Templo</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Mapa (travado, clica e abre o Google) */}
          <motion.a
            href={MAPS_LINK}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            aria-label={`Abrir ${ENDERECO.nome} no Google Maps`}
            className="lg:col-span-8 group relative block h-[300px] md:h-[440px] rounded-3xl overflow-hidden border border-white/10 hover:border-[#c8ccd4]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-500"
          >
            {/* iframe do mapa real */}
            <iframe
              src={EMBED_SRC}
              title={`Mapa — ${ENDERECO.nome}`}
              className="absolute inset-0 w-full h-full grayscale-[0.3] contrast-110 brightness-90 group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
            />

            {/* Overlay travador: bloqueia interação no mapa e captura o clique */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/20 transition-all duration-500" />

            {/* Selo "clique para abrir" */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-black/80 md:backdrop-blur-sm border border-[#c8ccd4]/25 text-[#c8ccd4] px-3.5 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-bold group-hover:border-[#c8ccd4]/60 group-hover:bg-[#c8ccd4] group-hover:text-zinc-950 transition-all duration-300 select-none">
              <Navigation className="w-3.5 h-3.5" />
              Abrir no Google Maps
              <ArrowUpRight className="w-3 h-3" />
            </div>

            {/* Pin flutuante central decorativo */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/70 md:backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-mono text-[8.5px] text-white uppercase tracking-widest font-bold">{ENDERECO.cidade}</span>
            </div>
          </motion.a>

          {/* Cartão de contato/endereço ao lado */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-4 glass-card-strong rounded-3xl p-7 md:p-8 flex flex-col justify-between text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#c8ccd4]/10 border border-[#c8ccd4]/25 flex items-center justify-center text-[#c8ccd4] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#c8ccd4]/70 uppercase tracking-widest font-bold block mb-1.5">Endereço</span>
                  <p className="font-sans text-sm text-white font-semibold leading-snug">{ENDERECO.rua}</p>
                  <p className="font-sans text-[12px] text-zinc-400 leading-snug">{ENDERECO.bairro}</p>
                  <p className="font-sans text-[12px] text-zinc-400 leading-snug">{ENDERECO.cidade} • {ENDERECO.cep}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-white/5 pt-5">
                <div className="w-9 h-9 rounded-full bg-[#c8ccd4]/10 border border-[#c8ccd4]/25 flex items-center justify-center text-[#c8ccd4] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#c8ccd4]/70 uppercase tracking-widest font-bold block mb-1.5">Telefone</span>
                  <a href={`tel:+${ENDERECO.telefoneRaw}`} className="font-sans text-sm text-white font-semibold hover:text-[#c8ccd4] transition-colors">
                    {ENDERECO.telefone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-white/5 pt-5">
                <div className="w-9 h-9 rounded-full bg-[#c8ccd4]/10 border border-[#c8ccd4]/25 flex items-center justify-center text-[#c8ccd4] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#c8ccd4]/70 uppercase tracking-widest font-bold block mb-1.5">Funcionamento</span>
                  <p className="font-sans text-[13px] text-white font-medium leading-snug">Segunda a Sábado</p>
                  <p className="font-sans text-[11px] text-zinc-400">08h30 - 21h • Domingo fechado</p>
                </div>
              </div>
            </div>

            {/* CTA traçar rota */}
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-7 relative overflow-hidden h-12 bg-linear-to-r from-[#eef1f5] to-[#c8ccd4] text-slate-950 font-sans text-[10.5px] font-black tracking-[0.15em] uppercase rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-300 shadow-[0_0_20px_rgba(200, 204, 212,0.25)] active:scale-[0.98] group/rota"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/rota:animate-shimmer" />
              <Navigation className="w-3.5 h-3.5" />
              Traçar Rota até Nós
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
