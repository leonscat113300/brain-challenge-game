"use client";

import { useGameStore } from "./store";

/* ------------------------------------------------------------------ */
/* Cartoon sound engine — 100% synthesized with Web Audio (offline).  */
/* ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** call once on the first user gesture */
export function initAudio() {
  ac();
}

function sfxOn() {
  return useGameStore.getState().soundOn;
}
function musicOn() {
  return useGameStore.getState().musicOn;
}

interface ToneOpts {
  type?: OscillatorType;
  vol?: number;
  when?: number; // seconds from now
  attack?: number;
  freqEnd?: number;
}

function tone(freq: number, dur: number, opts: ToneOpts = {}) {
  const c = ac();
  if (!c || !sfxOn()) return;
  const t0 = c.currentTime + (opts.when ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(30, opts.freqEnd), t0 + dur);
  const vol = opts.vol ?? 0.18;
  const atk = opts.attack ?? 0.008;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur: number, opts: { vol?: number; when?: number; filter?: number; filterEnd?: number } = {}) {
  const c = ac();
  if (!c || !sfxOn()) return;
  const t0 = c.currentTime + (opts.when ?? 0);
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(opts.filter ?? 800, t0);
  if (opts.filterEnd) f.frequency.exponentialRampToValueAtTime(opts.filterEnd, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(opts.vol ?? 0.15, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

/* ----------------------------- SFX bank ---------------------------- */

export const sfx = {
  click() {
    tone(660, 0.07, { type: "sine", freqEnd: 480, vol: 0.15 });
  },
  pop() {
    tone(340, 0.1, { type: "triangle", freqEnd: 90, vol: 0.28 });
  },
  boing() {
    const c = ac();
    if (!c || !sfxOn()) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    const lfo = c.createOscillator();
    const lfoG = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(240, t0);
    osc.frequency.exponentialRampToValueAtTime(80, t0 + 0.38);
    lfo.frequency.value = 18;
    lfoG.gain.setValueAtTime(40, t0);
    lfoG.gain.exponentialRampToValueAtTime(2, t0 + 0.38);
    lfo.connect(lfoG).connect(osc.frequency);
    g.gain.setValueAtTime(0.25, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    lfo.start(t0);
    osc.stop(t0 + 0.45);
    lfo.stop(t0 + 0.45);
  },
  chime() {
    tone(1047, 0.35, { vol: 0.16 });
    tone(1319, 0.35, { vol: 0.14, when: 0.09 });
    tone(1568, 0.5, { vol: 0.14, when: 0.18 });
  },
  coin() {
    tone(988, 0.08, { type: "square", vol: 0.12 });
    tone(1319, 0.22, { type: "square", vol: 0.12, when: 0.08 });
  },
  unlock() {
    noise(0.08, { vol: 0.1, filter: 1200 });
    tone(420, 0.14, { type: "triangle", freqEnd: 840, vol: 0.18, when: 0.06 });
  },
  sparkle() {
    for (let i = 0; i < 5; i++) {
      tone(1200 + Math.random() * 1400, 0.12, { vol: 0.09, when: i * 0.05 });
    }
  },
  fanfare() {
    const seq = [523, 659, 784, 1047];
    seq.forEach((f, i) => tone(f, 0.16, { type: "triangle", vol: 0.2, when: i * 0.12 }));
    tone(1047, 0.5, { type: "triangle", vol: 0.22, when: 0.5 });
    tone(1319, 0.5, { type: "sine", vol: 0.16, when: 0.5 });
    noise(0.3, { vol: 0.05, when: 0.5, filter: 3000 });
  },
  whoosh() {
    noise(0.3, { vol: 0.18, filter: 300, filterEnd: 2400 });
  },
  shake() {
    noise(0.09, { vol: 0.2, filter: 400 });
    noise(0.09, { vol: 0.16, filter: 500, when: 0.12 });
    noise(0.09, { vol: 0.18, filter: 450, when: 0.24 });
  },
  fail() {
    tone(320, 0.16, { type: "sawtooth", vol: 0.1, freqEnd: 250 });
    tone(210, 0.28, { type: "sawtooth", vol: 0.12, when: 0.14, freqEnd: 150 });
  },
  tick() {
    tone(1100, 0.04, { vol: 0.1 });
  },
  cheer() {
    const seq = [523, 659, 784, 1047, 1319];
    seq.forEach((f, i) => tone(f, 0.12, { type: "triangle", vol: 0.16, when: i * 0.07 }));
  },
  laugh() {
    tone(300, 0.1, { type: "sawtooth", vol: 0.1, freqEnd: 220 });
    tone(260, 0.12, { type: "sawtooth", vol: 0.1, when: 0.13, freqEnd: 180 });
    tone(220, 0.12, { type: "sawtooth", vol: 0.1, when: 0.27, freqEnd: 150 });
  },
};

/* ------------------- animal voices (Level 61+) --------------------- */
/* Distinct synthesized animal calls so sound-based puzzles work:      */
/* mouse squeak, duck quack, lion roar (low→high volume bars).         */

export const animalSfx = {
  mouse() {
    /* real mouse squeak: three ultra-high chirps, each a fast rising whistle
       with a faint second harmonic — "sqee-sqee-sqee" */
    for (let i = 0; i < 3; i++) {
      const w = i * 0.15;
      tone(2300, 0.1, { type: "sine", freqEnd: 3400, vol: 0.16, when: w });
      tone(3450, 0.07, { type: "sine", freqEnd: 4100, vol: 0.06, when: w + 0.02 });
      /* tiny breath tick at the end of each chirp */
      noise(0.03, { vol: 0.04, filter: 4200, when: w + 0.07 });
    }
  },
  duck() {
    /* real mallard quack: nasal honk — saw core with a strong pitch drop,
       a square overtone one octave up for the nasal "waek" and a breathy attack */
    for (let i = 0; i < 2; i++) {
      const w = i * 0.22;
      noise(0.045, { vol: 0.09, filter: 2000, when: w });
      tone(440, 0.18, { type: "sawtooth", freqEnd: 205, vol: 0.26, when: w + 0.02 });
      tone(1320, 0.15, { type: "square", freqEnd: 640, vol: 0.055, when: w + 0.02 });
      tone(660, 0.1, { type: "triangle", freqEnd: 380, vol: 0.07, when: w + 0.04 });
    }
  },
  lion() {
    /* real lion roar: long low saw with growl (amplitude LFO), sub rumble,
       harmonic layer and breath noise — about 1.2s of "rrrOOOarrr" */
    const c = ac();
    if (!c || !sfxOn()) return;
    const t0 = c.currentTime;
    const dur = 1.2;
    /* main growl: low sawtooth, pitch falls, amplitude modulated by an LFO */
    const osc = c.createOscillator();
    const g = c.createGain();
    const lfo = c.createOscillator();
    const lfoG = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(185, t0);
    osc.frequency.exponentialRampToValueAtTime(70, t0 + dur);
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(25, t0);
    lfo.frequency.exponentialRampToValueAtTime(13, t0 + dur);
    lfoG.gain.setValueAtTime(0.16, t0);
    lfoG.gain.exponentialRampToValueAtTime(0.03, t0 + dur);
    lfo.connect(lfoG).connect(g.gain);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.3, t0 + 0.09);
    g.gain.setValueAtTime(0.3, t0 + dur * 0.62);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    lfo.start(t0);
    osc.stop(t0 + dur + 0.05);
    lfo.stop(t0 + dur + 0.05);
    /* harmonic layer gives the throaty edge */
    tone(278, dur - 0.06, { type: "square", freqEnd: 105, vol: 0.09, attack: 0.1, when: 0.03 });
    /* sub rumble */
    tone(88, dur - 0.04, { type: "sine", freqEnd: 50, vol: 0.24, when: 0.05 });
    /* breath */
    noise(dur * 0.6, { vol: 0.1, filter: 340, filterEnd: 110, when: 0.06 });
  },
  cat() {
    /* playful "mi-au": rising then falling formant slide */
    tone(620, 0.16, { type: "triangle", freqEnd: 900, vol: 0.18 });
    tone(860, 0.3, { type: "triangle", freqEnd: 380, vol: 0.18, when: 0.15 });
    tone(1740, 0.18, { type: "sine", freqEnd: 1900, vol: 0.05, when: 0.02 });
  },
};

/** eerie warbling " Strange sound" from an unseen music toy (Level 96).
    Two slightly detuned oscillators create beating — genuinely uncanny. */
export function mysterySfx() {
  const c = ac();
  if (!c || !sfxOn()) return;
  const t0 = c.currentTime;
  const note = (f: number, detune: number, start: number, dur: number, vol: number) => {
    for (const off of [0, detune]) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(f + off, t0 + start);
      o.frequency.linearRampToValueAtTime((f + off) * 1.22, t0 + start + dur * 0.6);
      o.frequency.linearRampToValueAtTime((f + off) * 0.92, t0 + start + dur);
      g.gain.setValueAtTime(0, t0 + start);
      g.gain.linearRampToValueAtTime(vol, t0 + start + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
      o.connect(g).connect(c.destination);
      o.start(t0 + start);
      o.stop(t0 + start + dur + 0.05);
    }
  };
  /* little "la-la-leee" music-box phrase, detuned and wandering */
  note(494, 6, 0, 0.34, 0.085);
  note(659, 8, 0.36, 0.3, 0.08);
  note(523, 5, 0.68, 0.26, 0.08);
  note(784, 9, 0.96, 0.5, 0.09);
}

/* ------------------------- music loops ----------------------------- */

type LoopKind = "menu" | "game";

let loopTimer: ReturnType<typeof setInterval> | null = null;
let nextNote = 0;
let step = 0;
let kind: LoopKind = "menu";

// C major pentatonic marimba melody (menu)
const MENU_SEQ: Array<[number | 0, number]> = [
  [523, 1], [0, 1], [659, 1], [0, 1], [784, 1], [0, 1], [659, 1], [880, 1],
  [784, 1], [0, 1], [659, 1], [0, 1], [523, 1], [587, 1], [659, 1], [0, 1],
  [440, 1], [0, 1], [523, 1], [0, 1], [659, 1], [0, 1], [523, 1], [784, 1],
  [659, 1], [587, 1], [523, 1], [0, 1], [440, 1], [0, 1], [392, 1], [0, 1],
];
// calm curiosity arpeggio (gameplay)
const GAME_SEQ: Array<[number | 0, number]> = [
  [330, 1], [0, 1], [392, 1], [0, 1], [440, 1], [0, 1], [392, 1], [0, 1],
  [294, 1], [0, 1], [330, 1], [0, 1], [392, 1], [0, 1], [330, 1], [0, 1],
  [262, 1], [0, 1], [330, 1], [0, 1], [392, 1], [0, 1], [440, 1], [0, 1],
  [349, 1], [0, 1], [392, 1], [0, 1], [330, 1], [0, 1], [262, 1], [0, 1],
];

function pluck(freq: number, dur: number, vol: number) {
  const c = ac();
  if (!c || freq === 0) return;
  const t0 = c.currentTime;
  const o1 = c.createOscillator();
  const o2 = c.createOscillator();
  const g = c.createGain();
  o1.type = "sine";
  o2.type = "triangle";
  o1.frequency.value = freq;
  o2.frequency.value = freq * 2;
  const g2 = c.createGain();
  g2.gain.value = 0.35;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o1.connect(g);
  o2.connect(g2).connect(g);
  g.connect(c.destination);
  o1.start(t0);
  o2.start(t0);
  o1.stop(t0 + dur + 0.05);
  o2.stop(t0 + dur + 0.05);
}

export function startMusic(k: LoopKind) {
  const c = ac();
  if (!c) return;
  kind = k;
  if (loopTimer) return;
  nextNote = c.currentTime + 0.1;
  step = 0;
  loopTimer = setInterval(() => {
    const cc = ac();
    if (!cc) return;
    while (nextNote < cc.currentTime + 0.45) {
      const seq = kind === "menu" ? MENU_SEQ : GAME_SEQ;
      const dt = kind === "menu" ? 0.22 : 0.3;
      const [f] = seq[step % seq.length];
      if (musicOn() && f > 0) {
        pluck(f, kind === "menu" ? 0.5 : 0.9, kind === "menu" ? 0.055 : 0.04);
        if (step % 8 === 0) pluck(f / 2, kind === "menu" ? 0.7 : 1.1, 0.035);
      }
      nextNote += dt;
      step++;
    }
  }, 180);
}

export function stopMusic() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
}
