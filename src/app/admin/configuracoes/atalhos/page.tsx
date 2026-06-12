"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Lock, RotateCcw } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Modal } from "@/components/ui/Modal";
import { menuItems } from "@/lib/menu-items";
import {
  DEFAULT_NAV_SHORTCUTS,
  NAV_SHORTCUTS_CENTER_INDEX,
  NAV_SHORTCUTS_MENU_INDEX,
  NAV_SHORTCUTS_SLOTS,
  getMenuItemByHref,
  getNavShortcuts,
  setNavShortcuts,
} from "@/lib/nav-shortcuts";

const slotLabels = ["1º botão", "2º botão", "Botão central", "4º botão", "5º botão"];

export default function AtalhosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [shortcuts, setShortcuts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  useEffect(() => {
    if (!user) return;
    getNavShortcuts(user.uid).then((result) => {
      setShortcuts(result);
      setLoading(false);
    });
  }, [user]);

  const handleSelect = (href: string) => {
    if (activeSlot === null) return;
    const slot = activeSlot;

    setShortcuts((current) => {
      const next = [...current];

      // Se o item já está em outro slot, troca os dois de lugar para evitar duplicidade
      const duplicateIndex = next.findIndex((h, i) => h === href && i !== slot);
      if (duplicateIndex !== -1) {
        next[duplicateIndex] = next[slot];
      }

      next[slot] = href;
      return next;
    });
    setActiveSlot(null);
  };

  const handleReset = async () => {
    if (!user) return;
    setSaving(true);
    await setNavShortcuts(user.uid, [...DEFAULT_NAV_SHORTCUTS]);
    setSaving(false);
    router.back();
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await setNavShortcuts(user.uid, shortcuts);
    setSaving(false);
    router.back();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button
          onClick={() => (activeSlot !== null ? setActiveSlot(null) : router.back())}
          className="text-slate-100 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-100">
          {activeSlot !== null ? "Escolha o atalho" : "Atalhos da navbar"}
        </h1>
      </div>

      {loading ? (
        <p className="text-center text-sm text-slate-300 pt-6">Carregando...</p>
      ) : activeSlot !== null ? (
        /* Seletor de item para o slot ativo */
        <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card p-1">
          {menuItems.map(({ label, href, icon: Icon, color }) => {
            const selected = shortcuts[activeSlot] === href;
            return (
              <button
                key={href}
                onClick={() => handleSelect(href)}
                className="admin-glass-card-hover admin-glass-card-active flex items-center gap-4 w-full rounded-xl px-3 py-3.5 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="flex-1 text-left text-sm font-semibold admin-text-primary">{label}</p>
                {selected && <Check className="w-5 h-5 text-gold shrink-0" />}
              </button>
            );
          })}
        </div>
      ) : (
        <>
          {/* Slots */}
          <div className="transform-gpu mx-4 mb-3 rounded-2xl overflow-hidden admin-glass-card p-1">
            {Array.from({ length: NAV_SHORTCUTS_SLOTS }).map((_, index) => {
              const item = getMenuItemByHref(shortcuts[index]);
              const Icon = item?.icon;
              const isLocked = index === NAV_SHORTCUTS_MENU_INDEX;
              return (
                <button
                  key={index}
                  onClick={() => !isLocked && setActiveSlot(index)}
                  disabled={isLocked}
                  className={`flex items-center gap-4 w-full rounded-xl px-3 py-3.5 transition-colors ${
                    isLocked ? "opacity-70" : "admin-glass-card-hover admin-glass-card-active"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${item?.color ?? "bg-slate-600"} flex items-center justify-center shrink-0`}>
                    {Icon && <Icon className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[10px] font-semibold admin-text-secondary uppercase tracking-widest">
                      {slotLabels[index]}
                      {index === NAV_SHORTCUTS_CENTER_INDEX ? " · destaque" : ""}
                      {isLocked ? " · fixo" : ""}
                    </p>
                    <p className="text-sm font-semibold admin-text-primary">{item?.label ?? "Selecionar"}</p>
                  </div>
                  {isLocked && <Lock className="w-4 h-4 admin-text-secondary shrink-0" />}
                </button>
              );
            })}
          </div>

          <p className="px-4 text-xs text-slate-300/80 mb-4">
            Toque em um botão para escolher o que ele deve abrir na barra de navegação inferior.
            O botão central fica em destaque, elevado na barra.
          </p>

          {/* Salvar / Restaurar */}
          <div className="px-4 mb-12 space-y-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-semibold transition-colors"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={() => setConfirmandoReset(true)}
              disabled={saving}
              className="admin-glass-card admin-glass-card-hover transform-gpu w-full disabled:opacity-60 admin-text-primary py-3.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Restaurar padrão
            </button>
          </div>
        </>
      )}

      {confirmandoReset && (
        <Modal
          onClose={() => setConfirmandoReset(false)}
          panelClassName="admin-glass-modal sm:rounded-3xl rounded-t-3xl"
        >
          {(close) => (
            <div className="p-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full admin-glass-card flex items-center justify-center">
                <RotateCcw className="w-6 h-6 admin-text-primary" />
              </div>
              <div>
                <p className="text-base font-bold admin-text-primary">Restaurar padrão?</p>
                <p className="text-sm admin-text-secondary mt-1">
                  Os 5 botões da navbar vão voltar para a configuração original. Essa ação não pode ser desfeita após salvar.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full pt-1">
                <button onClick={close} className="flex-1 px-5 py-3 rounded-full text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-400/15 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleReset();
                    close();
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-full text-sm font-bold transition-colors"
                >
                  Sim, restaurar
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
