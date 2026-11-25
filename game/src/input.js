// SizzleWok — Dapur Berapi: mouse and keyboard input. Clicks are hit-tested
// against the rectangles render.js draws; keys 1-6 pick ingredients, Space
// cooks, S serves the matching order, P pauses, R restarts, M mutes.

import { INGREDIENTS } from './config.js';
import {
  addIngredient,
  clearPrep,
  matchingOrderIndex,
  restartKitchen,
  serveOrder,
  startCooking,
  startShift,
} from './kitchen.js';
import { hotspotRects } from './render.js';
import { sfx, toggleMute } from './audio.js';

function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function handleClick(kitchen, clientX, clientY, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  const spot = hotspotRects().find((hot) => inside(x, y, hot.rect));
  if (!spot) return;
  if (kitchen.screen === 'title') {
    if (spot.kind === 'start') {
      startShift(kitchen);
      sfx.click();
    }
    return;
  }
  if (kitchen.screen === 'over') {
    if (spot.kind === 'restart') {
      restartKitchen(kitchen);
      sfx.click();
    }
    return;
  }
  if (spot.kind === 'bin') {
    if (addIngredient(kitchen, spot.id)) sfx.chop();
  } else if (spot.kind === 'cook') {
    if (startCooking(kitchen)) sfx.sizzle();
  } else if (spot.kind === 'serve') {
    const idx = matchingOrderIndex(kitchen);
    if (idx >= 0 && serveOrder(kitchen, idx)) sfx.coin();
    else sfx.wrong();
  } else if (spot.kind === 'ticket') {
    if (serveOrder(kitchen, spot.id)) sfx.coin();
    else sfx.wrong();
  }
}

export function handleKey(kitchen, event) {
  const key = event.key.toLowerCase();
  if (key === 'm') {
    toggleMute();
    return;
  }
  if (kitchen.screen === 'title') {
    if (key === ' ' || key === 'enter') {
      startShift(kitchen);
      sfx.click();
    }
    return;
  }
  if (kitchen.screen === 'over') {
    if (key === 'r') {
      restartKitchen(kitchen);
      sfx.click();
    }
    return;
  }
  if (key === 'p') {
    kitchen.paused = !kitchen.paused;
    return;
  }
  if (kitchen.paused) return;
  if (key === ' ') {
    event.preventDefault();
    if (startCooking(kitchen)) sfx.sizzle();
    return;
  }
  if (key === 's') {
    const idx = matchingOrderIndex(kitchen);
    if (idx >= 0 && serveOrder(kitchen, idx)) sfx.coin();
    else sfx.wrong();
    return;
  }
  if (key === 'c' || key === 'backspace') {
    clearPrep(kitchen);
    sfx.click();
    return;
  }
  if (key === 'r') {
    restartKitchen(kitchen);
    sfx.click();
    return;
  }
  const ing = INGREDIENTS.find((item) => item.key === key);
  if (ing && addIngredient(kitchen, ing.id)) sfx.chop();
}
