import { useCallback, useRef } from "react";

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!globalAudioCtx) {
    // Safari expose le-prefixed constructor ; on le déclare via une intersection
    // pour éviter un `any` sur la fenêtre.
    const w = window as Window & { webkitAudioContext?: typeof AudioContext };
    globalAudioCtx = new (window.AudioContext || w.webkitAudioContext)();
  }
  if (globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

// "B.B.B Pulse" — son signature court, cristallin, mémorable
function playPulse(ctx: AudioContext) {
  const t = ctx.currentTime;
  const master = ctx.createGain();
  master.connect(ctx.destination);
  master.gain.setValueAtTime(1, t);
  master.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

  // Note principale — cloche digitale aiguë (~G6 = 1568Hz)
  const osc1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(1568, t);
  g1.gain.setValueAtTime(1, t);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  osc1.connect(g1);
  g1.connect(master);
  osc1.start(t);
  osc1.stop(t + 1.2);

  // Harmonie brillante (~B6 = 1976Hz) pour effet "bulles de champagne"
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(1976, t);
  g2.gain.setValueAtTime(0.18, t);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  osc2.connect(g2);
  g2.connect(master);
  osc2.start(t);
  osc2.stop(t + 0.55);

  // Snap/click subtil pour l'attaque (fait penser à un "bouchon" ou "pétale")
  const snap = ctx.createOscillator();
  const gSnap = ctx.createGain();
  snap.type = "square";
  snap.frequency.setValueAtTime(120, t);
  snap.frequency.exponentialRampToValueAtTime(40, t + 0.06);
  gSnap.gain.setValueAtTime(0.12, t);
  gSnap.gain.exponentialRampToValueAtTime(1e-4, t + 0.06);
  snap.connect(gSnap);
  gSnap.connect(master);
  snap.start(t);
  snap.stop(t + 0.06);

  // Écho stéréo très court (delay ~90ms)
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.09;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 1.4; // feedback court
  const echoGain = ctx.createGain();
  echoGain.gain.value = 0.18;

  delayGain.connect(delay);
  delay.connect(delayGain);
  delay.connect(echoGain);
  echoGain.connect(master);

  const oscEcho = ctx.createOscillator();
  const gEcho = ctx.createGain();
  oscEcho.type = "sine";
  oscEcho.frequency.setValueAtTime(1568, t);
  gEcho.gain.setValueAtTime(0.22, t + 0.09);
  gEcho.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
  oscEcho.connect(gEcho);
  gEcho.connect(delay);
  oscEcho.start(t + 0.09);
  oscEcho.stop(t + 0.38);
}

export function useMessageSound() {
  const lastPlay = useRef(0);

  const play = useCallback(() => {
    const now = Date.now();
    if (now - lastPlay.current < 1200) return; // throttle 1.2s max
    try {
      const ctx = getAudioContext();
      playPulse(ctx);
      lastPlay.current = now;
    } catch {
      // Silencieux si Web Audio non dispo
    }
  }, []);

  return play;
}
