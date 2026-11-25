// SizzleWok — Dapur Berapi: tiny synthesized sound effects. No audio files:
// every sound is an oscillator or filtered noise built with WebAudio on the fly.

let audioCtx = null;
let muted = false;

export function ensureAudio() {
  if (!audioCtx) {
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctor();
    } catch {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function blip(freq, dur, type = 'sine', gain = 0.12) {
  if (muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, ctx.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

function noiseBurst(dur, gain = 0.08) {
  if (muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1800;
  const amp = ctx.createGain();
  amp.gain.value = gain;
  src.connect(filter).connect(amp).connect(ctx.destination);
  src.start();
}

export const sfx = {
  chop() {
    noiseBurst(0.09, 0.1);
    blip(220, 0.08, 'triangle', 0.08);
  },
  sizzle() {
    noiseBurst(0.5, 0.05);
  },
  ding() {
    blip(880, 0.25, 'sine', 0.12);
    setTimeout(() => blip(1318, 0.3, 'sine', 0.1), 90);
  },
  coin() {
    blip(988, 0.12, 'square', 0.06);
    setTimeout(() => blip(1319, 0.18, 'square', 0.06), 80);
  },
  wrong() {
    blip(160, 0.25, 'sawtooth', 0.07);
  },
  click() {
    blip(520, 0.05, 'sine', 0.06);
  },
};
