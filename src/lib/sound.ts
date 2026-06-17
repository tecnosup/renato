/**
 * Sons de notificação sintetizados via Web Audio API — sem arquivos. O usuário
 * escolhe um na tela de Configurações; o admin toca o escolhido ao chegar
 * agendamento. Todos pensados para soar discretos e agradáveis.
 */

export type SoundId = "campainha" | "marimba" | "sino" | "pulso";

export const NOTIFICATION_SOUNDS: { id: SoundId; label: string; desc: string }[] = [
  { id: "campainha", label: "Campainha", desc: "Duplo toque descendente, suave" },
  { id: "marimba", label: "Marimba", desc: "Quente, tipo madeira" },
  { id: "sino", label: "Sino", desc: "Cristalino, um toque" },
  { id: "pulso", label: "Pulso", desc: "Dois toques curtos, discreto" },
];

const SOUND_ON_KEY = "admin-notification-sound";
const SOUND_ID_KEY = "admin-notification-sound-id";
const DEFAULT_SOUND: SoundId = "campainha";

/** O som das notificações está ligado? (default ligado.) */
export function isNotificationSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SOUND_ON_KEY) !== "off";
}

export function setNotificationSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_ON_KEY, enabled ? "on" : "off");
}

/** Qual som está escolhido. */
export function getNotificationSoundId(): SoundId {
  if (typeof window === "undefined") return DEFAULT_SOUND;
  const v = localStorage.getItem(SOUND_ID_KEY) as SoundId | null;
  return v && NOTIFICATION_SOUNDS.some((s) => s.id === v) ? v : DEFAULT_SOUND;
}

export function setNotificationSoundId(id: SoundId): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_ID_KEY, id);
}

// ─── Síntese ──────────────────────────────────────────────────────────────────

type Partial = readonly [mult: number, gainRatio: number];

/** Toca uma batida (fundamental + parciais) com ataque rápido e decaimento natural. */
function batida(
  ctx: AudioContext,
  freq: number,
  t0: number,
  dur: number,
  peak: number,
  partials: readonly Partial[]
) {
  for (const [mult, gr] of partials) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * mult;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak * gr, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
}

const PLAYERS: Record<SoundId, (ctx: AudioContext, base: number) => void> = {
  // Campainha: duplo descendente E5 → C5, com oitava sutil (corpo de sino).
  campainha: (ctx, base) => {
    batida(ctx, 659.25, base, 0.5, 0.3, [[1, 1], [2, 0.22]]);
    batida(ctx, 523.25, base + 0.16, 0.6, 0.3, [[1, 1], [2, 0.22]]);
  },
  // Marimba: decaimento rápido + 4º harmônico forte = timbre de madeira, quente.
  marimba: (ctx, base) => {
    batida(ctx, 523.25, base, 0.28, 0.34, [[1, 1], [4, 0.16]]);
    batida(ctx, 659.25, base + 0.13, 0.34, 0.34, [[1, 1], [4, 0.16]]);
  },
  // Sino: um toque cristalino (fundamental + quinta + oitava), decaimento médio.
  sino: (ctx, base) => {
    batida(ctx, 1046.5, base, 0.75, 0.24, [[1, 1], [1.5, 0.28], [2, 0.1]]);
  },
  // Pulso: dois toques iguais curtos e limpos — bem discreto.
  pulso: (ctx, base) => {
    batida(ctx, 880, base, 0.16, 0.26, [[1, 1]]);
    batida(ctx, 880, base + 0.14, 0.18, 0.26, [[1, 1]]);
  },
};

/** Toca o som de notificação (o escolhido, ou um específico para prévia). */
export function playNotificationDing(id?: SoundId) {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const player = PLAYERS[id ?? getNotificationSoundId()] ?? PLAYERS[DEFAULT_SOUND];
    player(ctx, ctx.currentTime + 0.01);
    setTimeout(() => ctx.close().catch(() => {}), 1500);
  } catch {
    /* áudio indisponível — ignora silenciosamente */
  }
}
