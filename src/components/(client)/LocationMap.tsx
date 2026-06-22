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
      className="w-full py-12 sm:py-20 md:py-24 px-4 md:px-8 relative z-10 scroll-mt-20 md:scroll-mt-24 overflow-hidden bg-[#0b0b0d] bg-tijolo"
      id="localizacao"
    >
      {/* Fade de transição da seção anterior — dissolve o limite sem linha dura */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 sm:h-40 z-0 pointer-events-none bg-gradient-to-b from-[#0a0a0c] to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header da seção — estilo HUD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-10 select-none"
        >
          <span className="font-mono text-[9px] text-[#c8ccd4] tracking-[0.3em] uppercase flex items-center gap-2 font-bold mb-3 bg-black/60 border-2 border-[#c8ccd4]/40 px-3 py-1.5 rounded">
            <MapPin className="w-3 h-3" />
            SÉCULO XXI • LOCALIZAÇÃO
          </span>
          <h2 className="text-3xl md:text-5xl uppercase tracking-wide">
            <span className="font-toon text-logo-3d" data-text="Venha nos Visitar">Venha nos Visitar</span>
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
            className="lg:col-span-8 group relative block h-[300px] md:h-[440px] rounded-xl overflow-hidden border-2 border-[#f0ebe4] shadow-[0_5px_0_rgba(0,0,0,0.9),0_12px_28px_rgba(0,0,0,0.55)] transition-all duration-500"
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

            {/* Selo "clique para abrir" — botão HUD */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-black border-2 border-[#f0ebe4] text-[#f0ebe4] px-3.5 py-2 rounded font-mono text-[9px] uppercase tracking-widest font-bold shadow-[0_3px_0_rgba(0,0,0,0.9)] group-hover:bg-[#c8ccd4] group-hover:border-[#c8ccd4] group-hover:text-black transition-all duration-300 select-none">
              <Navigation className="w-3.5 h-3.5" />
              Abrir no Google Maps
              <ArrowUpRight className="w-3 h-3" />
            </div>

            {/* Tag de localização — estilo waypoint de mini-mapa */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black border-2 border-[#c8ccd4] px-3 py-1.5 rounded select-none shadow-[0_3px_0_rgba(0,0,0,0.9)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-mono text-[8.5px] text-[#f0ebe4] uppercase tracking-widest font-bold">{ENDERECO.cidade}</span>
            </div>
          </motion.a>

          {/* Cartão de contato/endereço ao lado */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-4 bg-[#0e0e11] rounded-xl border-2 border-[#f0ebe4] shadow-[0_5px_0_rgba(0,0,0,0.9),0_12px_28px_rgba(0,0,0,0.5)] flex flex-col justify-between text-left overflow-hidden"
          >
            {/* Header do painel HUD */}
            <div className="bg-[#c8ccd4] px-5 py-2.5 flex items-center justify-between border-b-2 border-[#f0ebe4]">
              <span className="font-mono text-[10px] text-black uppercase tracking-[0.2em] font-black">NOSSO ENDEREÇO</span>
              <span className="w-2.5 h-2.5 rounded-full bg-black/70" />
            </div>

            <div className="space-y-5 p-6 md:p-7">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded bg-black border-2 border-[#c8ccd4] flex items-center justify-center text-[#c8ccd4] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#c8ccd4] uppercase tracking-widest font-bold block mb-1.5">Endereço</span>
                  <p className="font-sans text-sm text-white font-semibold leading-snug">{ENDERECO.rua}</p>
                  <p className="font-sans text-[12px] text-zinc-400 leading-snug">{ENDERECO.bairro}</p>
                  <p className="font-sans text-[12px] text-zinc-400 leading-snug">{ENDERECO.cidade} • {ENDERECO.cep}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t-2 border-dashed border-white/10 pt-5">
                <div className="w-9 h-9 rounded bg-black border-2 border-[#c8ccd4] flex items-center justify-center text-[#c8ccd4] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#c8ccd4] uppercase tracking-widest font-bold block mb-1.5">Telefone</span>
                  <a href={`tel:+${ENDERECO.telefoneRaw}`} className="font-sans text-sm text-white font-semibold hover:text-[#c8ccd4] transition-colors">
                    {ENDERECO.telefone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t-2 border-dashed border-white/10 pt-5">
                <div className="w-9 h-9 rounded bg-black border-2 border-[#c8ccd4] flex items-center justify-center text-[#c8ccd4] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#c8ccd4] uppercase tracking-widest font-bold block mb-1.5">Funcionamento</span>
                  <p className="font-sans text-[13px] text-white font-medium leading-snug">Segunda a Sábado</p>
                  <p className="font-sans text-[11px] text-zinc-400">08h30 - 21h • Domingo fechado</p>
                </div>
              </div>
            </div>

            {/* CTA traçar rota — botão HUD com gradiente da logo */}
            <div className="p-6 md:p-7 pt-0">
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                className="relative overflow-hidden h-12 w-full bg-[linear-gradient(135deg,#5a93de_0%,#2f5f8f_42%,#c41f16_70%,#e23a2e_100%)] btn-game text-sm uppercase rounded flex items-center justify-center gap-2 border-2 border-[#f0ebe4] shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:brightness-110 active:translate-y-0.5 active:shadow-[0_2px_0_rgba(0,0,0,0.9)] transition-all duration-150 group/rota"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/rota:animate-shimmer" />
                <Navigation className="w-3.5 h-3.5 text-[#f0ebe4]" />
                Traçar Rota até Nós
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
