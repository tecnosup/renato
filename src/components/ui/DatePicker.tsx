"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["D","S","T","Q","Q","S","S"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Anima a troca de mês com slide + fade do lado certo
function CalSlide({ dir, children }: { dir: "left" | "right"; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = dir === "right" ? "16px" : "-16px";
    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = `translateX(${from})`;
    el.getBoundingClientRect(); // força reflow
    el.style.transition = "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease-out";
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
  }, [dir]);

  return <div ref={ref}>{children}</div>;
}

// Mini calendário liquid glass — alternativa ao <input type="date"> nativo
export function DatePicker({ value, onChange, onClose }: { value: string; onChange: (iso: string) => void; onClose: () => void }) {
  const inicial = value ? new Date(`${value}T12:00:00`) : new Date();
  const [mes, setMes] = useState(inicial.getMonth());
  const [ano, setAno] = useState(inicial.getFullYear());
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");

  const navMes = (dir: number) => {
    setSlideDir(dir > 0 ? "right" : "left");
    const d = new Date(ano, mes + dir, 1);
    setMes(d.getMonth());
    setAno(d.getFullYear());
  };

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  // Sempre 6 linhas (42 células), pra altura não variar entre meses com 4 ou 5 semanas
  const celulas: (number | null)[] = Array(primeiroDia).fill(null)
    .concat(Array.from({ length: diasNoMes }, (_, i) => i + 1))
    .concat(Array(42).fill(null))
    .slice(0, 42);

  const selecionar = (dia: number) => {
    onChange(`${ano}-${pad(mes + 1)}-${pad(dia)}`);
    onClose();
  };

  const hoje = new Date();
  const hojeIso = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;

  return (
    <div className="rounded-2xl bg-black/25 shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] p-2">
      <div className="flex items-center justify-between mb-1.5">
        <button onClick={() => navMes(-1)} className="text-slate-200 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-semibold text-slate-100">{MESES[mes]} {ano}</p>
        <button onClick={() => navMes(1)} className="text-slate-200 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {DIAS_SEMANA.map((d, i) => (
          <p key={i} className="text-center text-[10px] font-medium text-slate-400 h-6 leading-6">{d}</p>
        ))}
      </div>

      <CalSlide key={`${ano}-${mes}`} dir={slideDir}>
        <div className="grid grid-cols-7 gap-y-0.5">
          {celulas.map((dia, i) => {
            if (!dia) return <span key={i} />;
            const iso = `${ano}-${pad(mes + 1)}-${pad(dia)}`;
            const isSel = iso === value;
            const isHoje = iso === hojeIso;
            return (
              <button
                key={i}
                onClick={() => selecionar(dia)}
                className={`flex items-center justify-center h-7 rounded-lg text-xs transition-colors ${
                  isSel
                    ? "bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 font-bold"
                    : isHoje
                      ? "text-gold font-bold ring-1 ring-inset ring-gold/50 hover:bg-white/10"
                      : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {dia}
              </button>
            );
          })}
        </div>
      </CalSlide>
    </div>
  );
}
