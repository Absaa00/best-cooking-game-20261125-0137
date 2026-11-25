// SizzleWok — Dapur Berapi: every tunable number of the game in one place.
// Canvas is a fixed 1280x800 kitchen; layout rectangles here are shared by
// render.js (drawing) and input.js (click hit-testing) so the two never drift.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// A shift lasts three minutes; the timer in the HUD counts it down.
export const SHIFT_SECONDS = 180;
// How long a ticket waits before the customer walks away, in seconds.
export const ORDER_PATIENCE_MIN = 42;
export const ORDER_PATIENCE_MAX = 60;
// Seconds a dish needs in the wok before it is ready to serve.
export const COOK_SECONDS = 6;
// Max ingredients stacked on the prep plate at once.
export const PREP_SLOTS = 4;
// Orders pinned to the board at once.
export const BOARD_SLOTS = 3;

export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', color: '#f7f0dc', rim: '#d9c9a3', price: 2 },
  { id: 'ayam', name: 'Ayam', key: '2', color: '#e2725b', rim: '#a34a35', price: 4 },
  { id: 'telur', name: 'Telur', key: '3', color: '#ffd166', rim: '#d9a441', price: 3 },
  { id: 'cabai', name: 'Cabai', key: '4', color: '#d7263d', rim: '#8f1a2b', price: 2 },
  { id: 'sayur', name: 'Sayur', key: '5', color: '#57a773', rim: '#2f6b46', price: 2 },
  { id: 'saus', name: 'Saus', key: '6', color: '#7b4b2a', rim: '#4e2e18', price: 3 },
];

// Recipes: name, the exact ingredient set a ticket asks for, base pay in coins.
export const RECIPES = [
  { id: 'nasi-goreng-ayam', name: 'Nasi Goreng Ayam', needs: ['nasi', 'ayam', 'telur', 'cabai'], pay: 22 },
  { id: 'nasi-goreng-sayur', name: 'Nasi Goreng Sayur', needs: ['nasi', 'sayur', 'telur', 'saus'], pay: 18 },
  { id: 'ayam-saus-cabai', name: 'Ayam Saus Cabai', needs: ['ayam', 'cabai', 'saus', 'sayur'], pay: 24 },
  { id: 'telur-dadar-pedas', name: 'Telur Dadar Pedas', needs: ['telur', 'cabai', 'sayur'], pay: 16 },
  { id: 'nasi-ayam-saus', name: 'Nasi Ayam Saus', needs: ['nasi', 'ayam', 'saus'], pay: 18 },
  { id: 'sayur-telur-nasi', name: 'Sayur Telur Nasi', needs: ['sayur', 'telur', 'nasi', 'cabai'], pay: 20 },
];

// Fixed layout rectangles (x, y, w, h) on the 1280x800 canvas.
export const LAYOUT = {
  board: { x: 24, y: 84, w: 300, h: 330 },
  ticketH: 100,
  ticketGap: 10,
  wok: { x: 900, y: 300, w: 340, h: 210 },
  prep: { x: 380, y: 300, w: 470, h: 210 },
  serve: { x: 900, y: 540, w: 340, h: 180 },
  bins: { x: 24, y: 560, w: 800, h: 190 },
  binW: 124,
  binGap: 8,
  cookButton: { x: 560, y: 516, w: 160, h: 40 },
  serveButton: { x: 1095, y: 668, w: 130, h: 36 },
};

// Warm kitchen palette.
export const COLORS = {
  wall: '#f6e3c5',
  wallTile: '#f2d7ae',
  floor: '#b0713c',
  floorLine: '#96592e',
  counterWood: '#8a5a2e',
  counterTop: '#c98d4b',
  board: '#3b2f2f',
  boardPaper: '#fff8e7',
  ticket: '#fffdf4',
  ticketEdge: '#d8c9a8',
  hud: '#2b2118',
  ink: '#2b2118',
  muted: '#7a6a58',
  accent: '#d7263d',
  gold: '#f4b400',
  green: '#2e9e5b',
};
