"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Palette, LayoutGrid, Download, Bell, Play } from "lucide-react";
import {
  isNotificationSoundEnabled, setNotificationSoundEnabled, playNotificationDing,
  getNotificationSoundId, setNotificationSoundId, NOTIFICATION_SOUNDS, type SoundId,
} from "@/lib/sound";

const configItems = [
  {
    label: "Imagem de fundo",
    desc: "Personalize o fundo do painel",
    href: "/admin/configuracoes/fundo",
    icon: ImageIcon,
    color: "bg-sky-600",
  },
  {
    label: "Tema",
    desc: "Diurno, noturno ou liquid glass",
    href: "/admin/configuracoes/tema",
    icon: Palette,
    color: "bg-violet-600",
  },
  {
    label: "Atalhos da navbar",
    desc: "Escolha os botões da barra inferior",
    href: "/admin/configuracoes/atalhos",
    icon: LayoutGrid,
    color: "bg-emerald-600",
  },
  {
    label: "Importar do AppBarber",
    desc: "Traga seus dados do sistema antigo",
    href: "/admin/configuracoes/importar-appbarber",
    icon: Download,
    color: "bg-amber-600",
  },
];

function SoundToggle() {
  // Preferências por dispositivo (localStorage). Iniciam nulas até montar
  // para não dar mismatch de hidratação.
  const [on, setOn] = useState<boolean | null>(null);
  const [soundId, setSoundId] = useState<SoundId | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOn(isNotificationSoundEnabled());
    setSoundId(getNotificationSoundId());
  }, []);

  const ativo = on ?? true;

  const toggle = () => {
    const next = !ativo;
    setOn(next);
    setNotificationSoundEnabled(next);
    if (next) {
      playNotificationDing(soundId ?? undefined); // prévia ao ligar
      // Rola até o final da página depois da animação de expansão.
      setTimeout(() => {
        const scroller = bottomRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
        if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
        else bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 380);
    }
  };

  const escolher = (id: SoundId) => {
    setSoundId(id);
    setNotificationSoundId(id);
    playNotificationDing(id); // toca prévia da opção escolhida
  };

  return (
    <div className="space-y-1">
      {/* Liga/desliga */}
      <div className="admin-glass-card-hover flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold admin-text-primary">Som das notificações</p>
          <p className="text-xs admin-text-secondary mt-0.5">Toque ao chegar um novo agendamento</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={ativo ? "Desativar som" : "Ativar som"}
          className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${ativo ? "bg-gold" : "admin-surface-subtle border border-white/10"}`}
        >
          <span className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-sm transition-[left] duration-200 ${ativo ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>

      {/* Escolha do som — expande/recolhe suave (altura via grid-rows + fade) */}
      <div
        className="grid transition-[grid-template-rows] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: ativo ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className={`px-3 pt-2 pb-1 space-y-1.5 transition-all duration-300 ${ativo ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
          >
            <p className="text-[11px] font-semibold admin-text-secondary uppercase tracking-widest px-1">Toque</p>
            {NOTIFICATION_SOUNDS.map(({ id, label, desc }, i) => {
              const sel = id === soundId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => escolher(id)}
                  style={{ transitionDelay: ativo ? `${i * 35}ms` : "0ms" }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all duration-300 ${
                    ativo ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
                  } ${
                    sel ? "bg-gold/10 border-gold/40" : "admin-surface-subtle border-transparent hover:border-white/15"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${sel ? "bg-gold text-slate-950" : "admin-surface-subtle admin-text-secondary"}`}>
                    <Play className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-medium transition-colors ${sel ? "text-gold" : "admin-text-primary"}`}>{label}</p>
                    <p className="text-[11px] admin-text-secondary truncate">{desc}</p>
                  </div>
                  {sel && <span className="w-2 h-2 rounded-full bg-gold shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* Âncora para o scroll automático ao expandir a lista */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}

export default function ConfiguracoesPage() {
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button
          onClick={() => router.back()}
          className="text-slate-100 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-100">Configurações</h1>
      </div>

      {/* Itens */}
      <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card p-1">
        {configItems.map(({ label, desc, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="admin-glass-card-hover admin-glass-card-active flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold admin-text-primary">{label}</p>
              <p className="text-xs admin-text-secondary mt-0.5">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 admin-text-primary shrink-0" />
          </Link>
        ))}
        <SoundToggle />
      </div>
    </div>
  );
}
