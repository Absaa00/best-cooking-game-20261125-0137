// SizzleWok — Dapur Berapi: bootstrap and game loop. One canvas, one
// requestAnimationFrame loop, delta time in seconds. ?shot=<name> stages a
// frozen kitchen state for screenshots; ?seed=<n> picks the order shuffle.

import { CANVAS_H, CANVAS_W } from './config.js';
import { createKitchen, updateKitchen } from './kitchen.js';
import { handleClick, handleKey } from './input.js';
import { renderKitchen } from './render.js';
import { applyShot } from './shots.js';
import { ensureAudio } from './audio.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const seedParam = Number(params.get('seed'));
const seed = Number.isFinite(seedParam) && seedParam > 0 ? Math.floor(seedParam) : 20261125;
const kitchen = createKitchen(seed);
const shot = params.get('shot');
if (shot) applyShot(kitchen, shot);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  updateKitchen(kitchen, dt);
  renderKitchen(ctx, kitchen, now / 1000);
  const line = kitchen.screen === 'play'
    ? `Waktu ${Math.ceil(kitchen.timeLeft)} detik, ${kitchen.coins} koin, ${kitchen.served} hidangan tersaji`
    : kitchen.screen === 'over'
      ? kitchen.overReason
      : 'SizzleWok Dapur Berapi — tekan Mulai Shift untuk bermain';
  if (status.textContent !== line) status.textContent = line;
  requestAnimationFrame(frame);
}

canvas.addEventListener('pointerdown', (event) => {
  ensureAudio();
  handleClick(kitchen, event.clientX, event.clientY, canvas);
});
window.addEventListener('keydown', (event) => {
  ensureAudio();
  handleKey(kitchen, event);
});

// Debug handle for play-testing: window.__game.kitchen is the live state.
window.__game = { kitchen };
requestAnimationFrame(frame);
