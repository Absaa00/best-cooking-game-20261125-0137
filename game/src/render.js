// SizzleWok — Dapur Berapi: every pixel of the kitchen, drawn on one canvas.
// Order board, ingredient bins, prep plate, wok, serving pass, HUD and the
// title / game-over screens all live here; kitchen.js owns the numbers.

import { CANVAS_H, CANVAS_W, COLORS, INGREDIENTS, LAYOUT, PREP_SLOTS } from './config.js';
import { ingredientById, matchingOrderIndex, recipeById } from './kitchen.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// One ingredient drawn as a little vector dish, used in bins, tickets, plates.
export function drawIngredientIcon(ctx, id, cx, cy, s) {
  const ing = ingredientById(id);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, s * 0.06);
  if (id === 'nasi') {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -s * 0.08, s * 0.42, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.05, s * 0.46, s * 0.3, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#e8dcc0';
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.arc(i * s * 0.14, -s * 0.22 - Math.abs(i) * s * 0.02, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#c94f2e';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.12, s * 0.5, s * 0.22, 0, 0, Math.PI);
    ctx.stroke();
  } else if (id === 'ayam') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.34, s * 0.42, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3e2c8';
    ctx.beginPath();
    ctx.arc(s * 0.34, s * 0.3, s * 0.14, 0, Math.PI * 2);
    ctx.arc(s * 0.44, s * 0.16, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f3e2c8';
    ctx.lineWidth = s * 0.1;
    ctx.beginPath();
    ctx.moveTo(s * 0.18, s * 0.22);
    ctx.lineTo(s * 0.4, s * 0.3);
    ctx.stroke();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.48, s * 0.36, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a93d';
    ctx.beginPath();
    ctx.arc(-s * 0.06, -s * 0.05, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cabai') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, -s * 0.1);
    ctx.quadraticCurveTo(0, -s * 0.55, s * 0.42, s * 0.05);
    ctx.quadraticCurveTo(s * 0.3, s * 0.42, -s * 0.1, s * 0.34);
    ctx.quadraticCurveTo(-s * 0.5, s * 0.2, -s * 0.42, -s * 0.1);
    ctx.fill();
    ctx.strokeStyle = '#2f6b46';
    ctx.lineWidth = s * 0.09;
    ctx.beginPath();
    ctx.moveTo(s * 0.36, -s * 0.02);
    ctx.quadraticCurveTo(s * 0.52, -s * 0.22, s * 0.42, -s * 0.36);
    ctx.stroke();
  } else if (id === 'sayur') {
    ctx.fillStyle = ing.color;
    for (const [dx, dy, rot] of [[-0.2, 0.05, -0.5], [0.15, -0.08, 0.4], [0, 0.18, 0.1]]) {
      ctx.save();
      ctx.translate(dx * s, dy * s);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.22, s * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#2f6b46';
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.4);
    ctx.lineTo(0, s * 0.1);
    ctx.stroke();
  } else if (id === 'saus') {
    ctx.fillStyle = '#e8e2d4';
    rr(ctx, -s * 0.2, -s * 0.42, s * 0.4, s * 0.84, s * 0.08);
    ctx.fill();
    ctx.fillStyle = ing.color;
    rr(ctx, -s * 0.2, -s * 0.05, s * 0.4, s * 0.47, s * 0.06);
    ctx.fill();
    ctx.fillStyle = '#d7263d';
    rr(ctx, -s * 0.2, -s * 0.42, s * 0.4, s * 0.18, s * 0.05);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${Math.round(s * 0.15)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('SAUS', 0, s * 0.18);
  }
  ctx.restore();
}

function drawWall(ctx, t) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.wallTile;
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 16; x += 1) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * 80 + (y % 2) * 40, y * 40, 80, 40);
    }
  }
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 160, CANVAS_W, 6);
  // Window with a street view, between the board and the wok.
  ctx.fillStyle = '#8ecae6';
  rr(ctx, 560, 140, 220, 110, 10);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(740, 168, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#57a773';
  ctx.fillRect(560, 226, 220, 24);
  ctx.fillStyle = '#7b4b2a';
  ctx.fillRect(600, 206, 34, 20);
  ctx.fillRect(700, 210, 44, 16);
  ctx.strokeStyle = '#8a5a2e';
  ctx.lineWidth = 6;
  rr(ctx, 560, 140, 220, 110, 10);
  ctx.stroke();
  // Hanging pans and shelf, above the wok.
  ctx.fillStyle = COLORS.counterWood;
  ctx.fillRect(880, 150, 320, 14);
  ctx.fillStyle = '#3b2f2f';
  ctx.beginPath();
  ctx.arc(920, 198, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1000, 198, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1080, 198, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c0c8d0';
  ctx.beginPath();
  ctx.arc(920, 198, 15, 0, Math.PI * 2);
  ctx.arc(1000, 198, 15, 0, Math.PI * 2);
  ctx.arc(1080, 198, 15, 0, Math.PI * 2);
  ctx.fill();
  // Floor.
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 760, CANVAS_W, 40);
  ctx.fillStyle = COLORS.floorLine;
  for (let x = 0; x < CANVAS_W; x += 90) ctx.fillRect(x, 760, 4, 40);
  void t;
}

function drawHud(ctx, kitchen) {
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(0, 0, CANVAS_W, 64);
  text(ctx, '🍳 SIZZLEWOK — DAPUR BERAPI', 24, 34, 26, '#ffd166', '800');
  const mins = Math.floor(kitchen.timeLeft / 60);
  const secs = Math.floor(kitchen.timeLeft % 60);
  const timerText = `${mins}:${String(secs).padStart(2, '0')}`;
  const urgent = kitchen.timeLeft < 30;
  ctx.fillStyle = urgent ? COLORS.accent : '#fff';
  rr(ctx, 560, 10, 150, 44, 10);
  ctx.fill();
  text(ctx, `⏱ ${timerText}`, 635, 33, 26, urgent ? '#fff' : COLORS.ink, '800', 'center');
  text(ctx, `🪙 ${kitchen.coins} koin`, 760, 33, 24, '#fff', '800');
  text(ctx, `✅ ${kitchen.served} tersaji`, 920, 33, 20, '#b8e6c8');
  text(ctx, kitchen.combo > 1 ? `🔥 KOMBO x${kitchen.combo}` : 'KOMBO —', 1080, 33, 20, kitchen.combo > 1 ? '#ffb703' : '#9a8a76');
  if (kitchen.message && kitchen.elapsed < kitchen.messageUntil) {
    ctx.fillStyle = 'rgba(43,33,24,0.92)';
    rr(ctx, 340, 70, 600, 34, 10);
    ctx.fill();
    text(ctx, kitchen.message, 640, 88, 17, '#ffe8a3', '700', 'center');
  }
}

function drawOrderBoard(ctx, kitchen) {
  const b = LAYOUT.board;
  ctx.fillStyle = COLORS.board;
  rr(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  text(ctx, '📋 ORDER BOARD', b.x + 16, b.y + 22, 20, '#ffd166', '800');
  kitchen.orders.forEach((order, i) => {
    const recipe = recipeById(order.recipeId);
    const y = b.y + 40 + i * (LAYOUT.ticketH + LAYOUT.ticketGap);
    const isMatch = matchingOrderIndex(kitchen) === i;
    ctx.fillStyle = isMatch ? '#fff3c4' : COLORS.ticket;
    rr(ctx, b.x + 10, y, b.w - 20, LAYOUT.ticketH, 10);
    ctx.fill();
    ctx.strokeStyle = isMatch ? COLORS.gold : COLORS.ticketEdge;
    ctx.lineWidth = isMatch ? 4 : 2;
    rr(ctx, b.x + 10, y, b.w - 20, LAYOUT.ticketH, 10);
    ctx.stroke();
    text(ctx, recipe.name, b.x + 22, y + 20, 18, COLORS.ink, '800');
    text(ctx, `${recipe.pay} koin`, b.x + b.w - 22, y + 20, 16, '#8a6d1d', '800', 'right');
    recipe.needs.forEach((need, j) => {
      drawIngredientIcon(ctx, need, b.x + 36 + j * 44, y + 56, 30);
    });
    const frac = Math.max(0, order.patience / order.patienceMax);
    ctx.fillStyle = '#e5dcc8';
    rr(ctx, b.x + 22, y + 82, b.w - 44, 10, 5);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? COLORS.green : frac > 0.25 ? '#e9a13b' : COLORS.accent;
    rr(ctx, b.x + 22, y + 82, (b.w - 44) * frac, 10, 5);
    ctx.fill();
    text(ctx, `${Math.ceil(order.patience)} dtk`, b.x + b.w - 24, y + 60, 13, COLORS.muted, '700', 'right');
  });
}

function drawBins(ctx, kitchen) {
  const bins = LAYOUT.bins;
  text(ctx, 'COUNTER BAHAN — klik atau tekan 1–6', bins.x + 4, bins.y - 12, 18, COLORS.ink, '800');
  INGREDIENTS.forEach((ing, i) => {
    const x = bins.x + i * (LAYOUT.binW + LAYOUT.binGap);
    const y = bins.y;
    ctx.fillStyle = COLORS.counterTop;
    rr(ctx, x, y, LAYOUT.binW, bins.h, 12);
    ctx.fill();
    ctx.fillStyle = '#fff8e7';
    rr(ctx, x + 8, y + 10, LAYOUT.binW - 16, 96, 10);
    ctx.fill();
    drawIngredientIcon(ctx, ing.id, x + LAYOUT.binW / 2, y + 58, 62);
    text(ctx, ing.name, x + LAYOUT.binW / 2, y + 126, 17, COLORS.ink, '800', 'center');
    ctx.fillStyle = COLORS.hud;
    rr(ctx, x + LAYOUT.binW / 2 - 16, y + 144, 32, 26, 8);
    ctx.fill();
    text(ctx, ing.key, x + LAYOUT.binW / 2, y + 158, 17, '#ffd166', '800', 'center');
    void kitchen;
  });
}

function drawPlate(ctx, cx, cy, items, label) {
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 92, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c9a8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 92, 30, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#eef3f6';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 66, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  items.forEach((id, i) => {
    const off = (i - (items.length - 1) / 2) * 44;
    drawIngredientIcon(ctx, id, cx + off, cy - 26 - (i % 2) * 10, 44);
  });
  text(ctx, label, cx, cy + 52, 16, COLORS.ink, '800', 'center');
}

function drawPrep(ctx, kitchen) {
  const p = LAYOUT.prep;
  ctx.fillStyle = COLORS.counterWood;
  rr(ctx, p.x, p.y, p.w, p.h, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.counterTop;
  ctx.fillRect(p.x, p.y, p.w, 26);
  text(ctx, 'PIRING RAKITAN — susun hidangan di sini', p.x + 16, p.y + 46, 17, '#fff', '800');
  if (kitchen.prep.length === 0) {
    text(ctx, 'Kosong — klik bahan di counter', p.x + p.w / 2, p.y + 120, 17, '#ffe8c2', '600', 'center');
  } else {
    drawPlate(ctx, p.x + p.w / 2, p.y + 118, kitchen.prep, `${kitchen.prep.length}/${PREP_SLOTS} bahan`);
  }
  for (let i = 0; i < PREP_SLOTS; i += 1) {
    ctx.fillStyle = i < kitchen.prep.length ? COLORS.gold : 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(p.x + 30 + i * 26, p.y + 186, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  const btn = LAYOUT.cookButton;
  const ready = kitchen.prep.length > 0 && !kitchen.wok.cooking;
  ctx.fillStyle = ready ? COLORS.accent : '#9a8a76';
  rr(ctx, btn.x, btn.y, btn.w, btn.h, 12);
  ctx.fill();
  text(ctx, '🔥 MASAK (Spasi)', btn.x + btn.w / 2, btn.y + btn.h / 2 + 1, 17, '#fff', '800', 'center');
}

function drawWok(ctx, kitchen, t) {
  const w = LAYOUT.wok;
  ctx.fillStyle = COLORS.counterWood;
  rr(ctx, w.x, w.y, w.w, w.h, 12);
  ctx.fill();
  ctx.fillStyle = '#3b2f2f';
  rr(ctx, w.x + 12, w.y + 12, w.w - 24, 46, 8);
  ctx.fill();
  text(ctx, '🔥 KOMPOR — WOK', w.x + 24, w.y + 36, 17, '#ffd166', '800');
  const cx = w.x + w.w / 2;
  const cy = w.y + 128;
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 118, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a4a52';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 112, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b6b76';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 96, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  if (kitchen.wok.cooking) {
    ctx.fillStyle = '#e2725b';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, 78, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    kitchen.wok.items.forEach((id, i) => {
      drawIngredientIcon(ctx, id, cx - 44 + i * 30, cy - 18, 30);
    });
    for (let i = 0; i < 3; i += 1) {
      const phase = (t * 0.9 + i * 0.33) % 1;
      ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - phase)})`;
      ctx.beginPath();
      ctx.arc(cx - 30 + i * 30 + Math.sin(t * 2 + i) * 6, cy - 30 - phase * 46, 8 + phase * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    const frac = kitchen.wok.progress;
    ctx.fillStyle = '#e5dcc8';
    rr(ctx, w.x + 24, w.y + 176, w.w - 48, 14, 7);
    ctx.fill();
    ctx.fillStyle = frac > 0.66 ? COLORS.green : '#e9a13b';
    rr(ctx, w.x + 24, w.y + 176, (w.w - 48) * frac, 14, 7);
    ctx.fill();
    text(ctx, `Memasak… ${Math.round(frac * 100)}%`, cx, w.y + 202, 14, '#ffe8c2', '700', 'center');
  } else if (kitchen.serve.items) {
    text(ctx, 'Wok kosong — hidangan di pass', cx, w.y + 190, 15, '#ffe8c2', '600', 'center');
  } else {
    text(ctx, 'Wok siap — tekan MASAK', cx, w.y + 190, 15, '#ffe8c2', '600', 'center');
  }
}

function drawServe(ctx, kitchen, t) {
  const s = LAYOUT.serve;
  ctx.fillStyle = '#2e9e5b';
  rr(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.fillStyle = '#227a45';
  ctx.fillRect(s.x, s.y, s.w, 26);
  text(ctx, '🍽️ PASS — SIAP SAJIKAN', s.x + 16, s.y + 40, 17, '#fff', '800');
  if (kitchen.serve.items) {
    drawPlate(ctx, s.x + 110, s.y + 100, kitchen.serve.items, 'SIAP DISAJIKAN!');
    const match = matchingOrderIndex(kitchen);
    const pulse = 0.75 + 0.25 * Math.sin(t * 5);
    ctx.fillStyle = `rgba(244,180,0,${pulse})`;
    ctx.beginPath();
    ctx.arc(s.x + 275, s.y + 72, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2b2118';
    ctx.beginPath();
    ctx.arc(s.x + 275, s.y + 64, 15, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(s.x + 267, s.y + 64, 16, 8);
    text(ctx, match >= 0 ? `KLIK TIKET #${match + 1}` : 'TIDAK COCOK!', s.x + 275, s.y + 112, 14, '#fff', '800', 'center');
    const btn = LAYOUT.serveButton;
    ctx.fillStyle = match >= 0 ? COLORS.gold : '#9a8a76';
    rr(ctx, btn.x, btn.y, btn.w, btn.h, 12);
    ctx.fill();
    text(ctx, '🔔 SAJIKAN (S)', btn.x + btn.w / 2, btn.y + btn.h / 2 + 1, 16, COLORS.ink, '800', 'center');
  } else {
    text(ctx, 'Belum ada hidangan matang', s.x + s.w / 2, s.y + 100, 16, '#d8f3e3', '600', 'center');
  }
}

function drawTitle(ctx, kitchen) {
  ctx.fillStyle = 'rgba(43,33,24,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff8e7';
  rr(ctx, 290, 170, 700, 430, 20);
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 5;
  rr(ctx, 290, 170, 700, 430, 20);
  ctx.stroke();
  text(ctx, '🍳 SIZZLEWOK', 640, 240, 54, COLORS.accent, '800', 'center');
  text(ctx, 'DAPUR BERAPI', 640, 296, 30, COLORS.ink, '800', 'center');
  text(ctx, 'Warung kilat: rakit pesanan, goreng di wok, sajikan sebelum pelanggan pergi!', 640, 344, 18, COLORS.muted, '600', 'center');
  text(ctx, '1–6  pilih bahan      Spasi  masak      S  sajikan      P  jeda', 640, 392, 18, COLORS.ink, '700', 'center');
  text(ctx, 'Klik tiket pesanan untuk menyajikan hidangan yang cocok.', 640, 422, 17, COLORS.muted, '600', 'center');
  ctx.fillStyle = COLORS.accent;
  rr(ctx, 490, 460, 300, 60, 14);
  ctx.fill();
  text(ctx, '▶ MULAI SHIFT', 640, 491, 24, '#fff', '800', 'center');
  text(ctx, 'Shift 3 menit — sajikan sebanyak mungkin!', 640, 556, 16, COLORS.muted, '600', 'center');
  void kitchen;
}

function drawGameOver(ctx, kitchen) {
  ctx.fillStyle = 'rgba(43,33,24,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff8e7';
  rr(ctx, 340, 200, 600, 360, 20);
  ctx.fill();
  text(ctx, '⏰ SHIFT SELESAI', 640, 268, 40, COLORS.accent, '800', 'center');
  text(ctx, kitchen.overReason, 640, 330, 20, COLORS.ink, '700', 'center');
  text(ctx, `Hidangan hangus: ${kitchen.lost}   Kombo terbaik: x${kitchen.bestCombo}`, 640, 372, 18, COLORS.muted, '600', 'center');
  ctx.fillStyle = COLORS.green;
  rr(ctx, 490, 420, 300, 56, 14);
  ctx.fill();
  text(ctx, '↻ MAIN LAGI (R)', 640, 449, 22, '#fff', '800', 'center');
}

export function renderKitchen(ctx, kitchen, t) {
  drawWall(ctx, t);
  drawOrderBoard(ctx, kitchen);
  drawPrep(ctx, kitchen);
  drawWok(ctx, kitchen, t);
  drawServe(ctx, kitchen, t);
  drawBins(ctx, kitchen);
  drawHud(ctx, kitchen);
  if (kitchen.paused && kitchen.screen === 'play' && !kitchen.frozen) {
    ctx.fillStyle = 'rgba(43,33,24,0.6)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    text(ctx, '⏸ JEDA — tekan P untuk lanjut', 640, 400, 34, '#fff', '800', 'center');
  }
  if (kitchen.screen === 'title') drawTitle(ctx, kitchen);
  if (kitchen.screen === 'over') drawGameOver(ctx, kitchen);
}

// Clickable rectangles, in the same coordinates render.js draws.
export function hotspotRects() {
  const bins = INGREDIENTS.map((ing, i) => ({
    kind: 'bin',
    id: ing.id,
    rect: {
      x: LAYOUT.bins.x + i * (LAYOUT.binW + LAYOUT.binGap),
      y: LAYOUT.bins.y,
      w: LAYOUT.binW,
      h: LAYOUT.bins.h,
    },
  }));
  const tickets = [0, 1, 2].map((i) => ({
    kind: 'ticket',
    id: i,
    rect: {
      x: LAYOUT.board.x + 10,
      y: LAYOUT.board.y + 40 + i * (LAYOUT.ticketH + LAYOUT.ticketGap),
      w: LAYOUT.board.w - 20,
      h: LAYOUT.ticketH,
    },
  }));
  return [
    ...bins,
    ...tickets,
    { kind: 'cook', id: 'cook', rect: LAYOUT.cookButton },
    { kind: 'serve', id: 'serve', rect: LAYOUT.serveButton },
    { kind: 'start', id: 'start', rect: { x: 490, y: 460, w: 300, h: 60 } },
    { kind: 'restart', id: 'restart', rect: { x: 490, y: 420, w: 300, h: 56 } },
  ];
}
