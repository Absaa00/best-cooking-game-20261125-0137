// SizzleWok — Dapur Berapi: the kitchen state machine. Pure logic, no drawing:
// orders on the board, the dish being assembled on the prep plate, the wok,
// the finished plate waiting on the pass, the shift timer, coins and combo.

import {
  BOARD_SLOTS,
  COOK_SECONDS,
  INGREDIENTS,
  ORDER_PATIENCE_MAX,
  ORDER_PATIENCE_MIN,
  PREP_SLOTS,
  RECIPES,
  SHIFT_SECONDS,
} from './config.js';
import { mulberry32, pickFrom, shuffleCopy } from './random.js';

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id);
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = a.slice().sort();
  const sortedB = b.slice().sort();
  return sortedA.every((value, i) => value === sortedB[i]);
}

export function createKitchen(seed = 20261125) {
  const rng = mulberry32(seed);
  const kitchen = {
    seed,
    rng,
    screen: 'title',
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    lost: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    prep: [],
    wok: { items: [], progress: 0, cooking: false },
    serve: { items: null, recipeId: null },
    message: '',
    messageUntil: 0,
    elapsed: 0,
    paused: false,
    overReason: '',
  };
  for (let i = 0; i < BOARD_SLOTS; i += 1) spawnOrder(kitchen);
  return kitchen;
}

export function spawnOrder(kitchen) {
  const onBoard = new Set(kitchen.orders.map((order) => order.recipeId));
  const free = RECIPES.filter((recipe) => !onBoard.has(recipe.id));
  const pool = free.length > 0 ? free : RECIPES;
  const recipe = pickFrom(kitchen.rng, pool);
  const patience = ORDER_PATIENCE_MIN + kitchen.rng() * (ORDER_PATIENCE_MAX - ORDER_PATIENCE_MIN);
  kitchen.orders.push({ recipeId: recipe.id, patience, patienceMax: patience, id: kitchen.elapsed + Math.random() });
}

export function startShift(kitchen) {
  kitchen.screen = 'play';
  kitchen.message = 'Shift dimulai! Rakit pesanan, masak di wok, sajikan!';
  kitchen.messageUntil = kitchen.elapsed + 4;
}

export function addIngredient(kitchen, id) {
  if (kitchen.screen !== 'play' || kitchen.paused) return false;
  if (kitchen.prep.length >= PREP_SLOTS) {
    flashMessage(kitchen, 'Piring rakitan penuh — masak dulu!');
    return false;
  }
  kitchen.prep.push(id);
  return true;
}

export function clearPrep(kitchen) {
  if (kitchen.screen !== 'play' || kitchen.paused || kitchen.frozen) return;
  kitchen.prep = [];
}

export function startCooking(kitchen) {
  if (kitchen.screen !== 'play' || kitchen.paused) return false;
  if (kitchen.wok.cooking) {
    flashMessage(kitchen, 'Wok sudah dipakai!');
    return false;
  }
  if (kitchen.prep.length === 0) {
    flashMessage(kitchen, 'Rakit dulu: klik bahan di counter!');
    return false;
  }
  kitchen.wok.items = kitchen.prep.slice();
  kitchen.wok.progress = 0;
  kitchen.wok.cooking = true;
  kitchen.prep = [];
  return true;
}

export function serveOrder(kitchen, orderIndex) {
  if (kitchen.screen !== 'play' || kitchen.paused) return false;
  const order = kitchen.orders[orderIndex];
  if (!order || !kitchen.serve.items) {
    flashMessage(kitchen, 'Belum ada hidangan siap di pass!');
    return false;
  }
  const recipe = recipeById(order.recipeId);
  if (!sameSet(kitchen.serve.items, recipe.needs)) {
    kitchen.coins = Math.max(0, kitchen.coins - 5);
    kitchen.combo = 0;
    flashMessage(kitchen, `Salah hidangan! ${recipe.name} bukan ini. -5 koin`);
    return false;
  }
  const tip = Math.round((order.patience / order.patienceMax) * 8);
  const earned = recipe.pay + tip;
  kitchen.coins += earned;
  kitchen.served += 1;
  kitchen.combo += 1;
  kitchen.bestCombo = Math.max(kitchen.bestCombo, kitchen.combo);
  kitchen.orders.splice(orderIndex, 1);
  spawnOrder(kitchen);
  kitchen.serve.items = null;
  kitchen.serve.recipeId = null;
  flashMessage(kitchen, `Tersaji! +${earned} koin (${recipe.name})`);
  return true;
}

export function flashMessage(kitchen, text) {
  kitchen.message = text;
  kitchen.messageUntil = kitchen.elapsed + 3;
}

export function matchingOrderIndex(kitchen) {
  if (!kitchen.serve.items) return -1;
  return kitchen.orders.findIndex((order) => sameSet(kitchen.serve.items, recipeById(order.recipeId).needs));
}

export function updateKitchen(kitchen, dt) {
  if (kitchen.screen !== 'play' || kitchen.paused || kitchen.frozen) return;
  kitchen.elapsed += dt;
  kitchen.timeLeft = Math.max(0, kitchen.timeLeft - dt);
  if (kitchen.timeLeft <= 0) {
    kitchen.screen = 'over';
    kitchen.overReason = `Shift selesai — ${kitchen.served} hidangan, ${kitchen.coins} koin!`;
    return;
  }
  for (const order of kitchen.orders) order.patience -= dt;
  const expired = kitchen.orders.filter((order) => order.patience <= 0);
  if (expired.length > 0) {
    kitchen.lost += expired.length;
    kitchen.combo = 0;
    kitchen.orders = kitchen.orders.filter((order) => order.patience > 0);
    while (kitchen.orders.length < BOARD_SLOTS) spawnOrder(kitchen);
    flashMessage(kitchen, 'Pelanggan pergi — pesanan hangus!');
  }
  if (kitchen.wok.cooking) {
    kitchen.wok.progress += dt / COOK_SECONDS;
    if (kitchen.wok.progress >= 1) {
      kitchen.wok.progress = 1;
      kitchen.wok.cooking = false;
      kitchen.serve.items = kitchen.wok.items.slice();
      kitchen.serve.recipeId = null;
      kitchen.wok.items = [];
      flashMessage(kitchen, 'Matang! Hidangan siap di pass — klik tiket pesanan untuk menyajikan.');
    }
  }
}

export function restartKitchen(kitchen) {
  const fresh = createKitchen(kitchen.seed + 1);
  Object.assign(kitchen, fresh, { screen: 'play' });
}
