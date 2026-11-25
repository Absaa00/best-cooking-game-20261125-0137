// SizzleWok — Dapur Berapi: staged states for the screenshots. A screenshot
// is a real render of the game's own code: ?shot=<name> freezes a hand-picked
// kitchen state (orders, prep plate, wok, pass, timer) so the shot always
// shows the same moment. Nothing here is drawn outside the game itself.

import { recipeById } from './kitchen.js';

function setOrder(kitchen, slot, recipeId, patience, patienceMax) {
  kitchen.orders[slot] = { recipeId, patience, patienceMax, id: `shot-${slot}` };
}

export function applyShot(kitchen, name) {
  kitchen.screen = 'play';
  kitchen.paused = false;
  kitchen.frozen = true;
  kitchen.message = '';
  kitchen.elapsed = 0;
  if (name === 'kitchen') {
    // Cover: full kitchen, board with three tickets, ingredients on the
    // counter, one dish mid-assembly, timer running, pass empty.
    kitchen.timeLeft = 152;
    kitchen.coins = 46;
    kitchen.served = 2;
    kitchen.combo = 2;
    setOrder(kitchen, 0, 'nasi-goreng-ayam', 38, 55);
    setOrder(kitchen, 1, 'ayam-saus-cabai', 24, 50);
    setOrder(kitchen, 2, 'telur-dadar-pedas', 47, 58);
    kitchen.prep = ['nasi', 'ayam', 'telur'];
    kitchen.wok = { items: [], progress: 0, cooking: false };
    kitchen.serve = { items: null, recipeId: null };
    kitchen.message = 'Rakit Nasi Goreng Ayam — tambah Cabai, lalu MASAK!';
    kitchen.messageUntil = 9999;
  } else if (name === 'prep') {
    // Dish mid-assembly: a full prep plate, wok idle, board waiting.
    kitchen.timeLeft = 131;
    kitchen.coins = 74;
    kitchen.served = 3;
    kitchen.combo = 3;
    setOrder(kitchen, 0, 'nasi-goreng-sayur', 31, 48);
    setOrder(kitchen, 1, 'nasi-goreng-ayam', 44, 55);
    setOrder(kitchen, 2, 'ayam-saus-cabai', 18, 44);
    kitchen.prep = ['nasi', 'sayur', 'telur', 'saus'];
    kitchen.wok = { items: [], progress: 0, cooking: false };
    kitchen.serve = { items: null, recipeId: null };
    kitchen.message = 'Racikan lengkap — tekan MASAK (Spasi)!';
    kitchen.messageUntil = 9999;
  } else if (name === 'cook') {
    // Wok mid-cook: steam, progress bar, a fresh order arriving.
    kitchen.timeLeft = 98;
    kitchen.coins = 96;
    kitchen.served = 4;
    kitchen.combo = 1;
    setOrder(kitchen, 0, 'ayam-saus-cabai', 29, 52);
    setOrder(kitchen, 1, 'nasi-ayam-saus', 41, 57);
    setOrder(kitchen, 2, 'nasi-goreng-sayur', 12, 46);
    kitchen.prep = [];
    kitchen.wok = { items: ['ayam', 'cabai', 'saus', 'sayur'], progress: 0.62, cooking: true };
    kitchen.serve = { items: null, recipeId: null };
    kitchen.message = 'Di wok: Ayam Saus Cabai — 62% matang…';
    kitchen.messageUntil = 9999;
  } else if (name === 'serve') {
    // Plate ready to serve: finished dish on the pass, bell ringing, the
    // matching ticket highlighted, coins and combo on the HUD.
    kitchen.timeLeft = 64;
    kitchen.coins = 128;
    kitchen.served = 6;
    kitchen.combo = 4;
    setOrder(kitchen, 0, 'nasi-goreng-ayam', 22, 55);
    setOrder(kitchen, 1, 'telur-dadar-pedas', 35, 50);
    setOrder(kitchen, 2, 'nasi-ayam-saus', 46, 60);
    kitchen.prep = ['nasi', 'ayam'];
    kitchen.wok = { items: [], progress: 0, cooking: false };
    kitchen.serve = { items: recipeById('nasi-goreng-ayam').needs.slice(), recipeId: 'nasi-goreng-ayam' };
    kitchen.message = 'Matang! Sajikan Nasi Goreng Ayam ke tiket #1 — 🔔 SAJIKAN!';
    kitchen.messageUntil = 9999;
  }
  return kitchen;
}

export const SHOT_NAMES = ['kitchen', 'prep', 'cook', 'serve'];
