"use client";

/**
 * Letreiro de palavras (faixa "ARTE • ESTILO • …") em board 3D inclinado.
 *
 * Marquee CSS automático em TODAS as telas — leve e responsivo: sem scroll-spring
 * do framer-motion, sem listener de resize. As duas faixas correm em sentidos
 * opostos (keyframes globais `marqueeLeft`/`marqueeRight`, neutralizados por
 * prefers-reduced-motion). Cada faixa duplica o conteúdo uma vez para o loop
 * fechar sem emenda (-50% = um ciclo). Tamanho fluido via clamp().
 */
const ROW_1 = ["ARTE", "ESTILO", "CORTESIA", "EXCELÊNCIA", "PROPORÇÃO", "DESIGN"];
const ROW_2 = ["NAVALHA", "TOALHA PURA", "VISAGISMO", "CUIDADO", "DEDICAÇÃO", "CLASSE"];

export default function ThreeDText() {
  return (
    <div
      className="w-full bg-[#0b0b0d] bg-tijolo py-16 md:py-24 overflow-hidden relative select-none"
      style={{ perspective: "1200px" }}
      id="3d-text-section"
    >
      {/* Fades de transição (topo + base) — dissolvem os limites sem linha dura */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 sm:h-32 z-[1] pointer-events-none bg-gradient-to-b from-[#0a0a0c] to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 sm:h-32 z-[1] pointer-events-none bg-gradient-to-t from-[#0a0a0c] to-transparent" />

      {/* Board 3D inclinado (estático — só compõe, não anima) */}
      <div
        className="flex flex-col gap-8 md:gap-14"
        style={{
          transform: "rotateY(-8deg) rotateX(8deg) rotateZ(-1deg)",
          transformStyle: "preserve-3d",
        }}
        id="3d-text-perspective-container"
      >
        <div
          className="animate-marquee-left whitespace-nowrap flex gap-6 btn-game leading-none w-max text-[clamp(2.25rem,7vw,75px)]"
          id="text-vortex-row-1"
        >
          {/* Conteúdo duplicado p/ loop sem emenda */}
          {[...ROW_1, ...ROW_1].map((w, i) => (
            <span key={i}>{w}&nbsp;•&nbsp;</span>
          ))}
        </div>

        {/* Linha divisória entre as duas faixas */}
        <div className="w-full px-6 md:px-10 select-none">
          <div className="h-[2px] w-full bg-[#c8ccd4]/25" />
        </div>

        <div
          className="animate-marquee-right whitespace-nowrap flex gap-6 btn-game leading-none w-max text-[clamp(2.25rem,7vw,75px)]"
          id="text-vortex-row-2"
        >
          {[...ROW_2, ...ROW_2].map((w, i) => (
            <span key={i}>{w}&nbsp;•&nbsp;</span>
          ))}
        </div>
      </div>
    </div>
  );
}
