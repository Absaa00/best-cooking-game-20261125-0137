# SizzleWok — Dapur Berapi

[![make.fun bounty](https://img.shields.io/badge/make.fun-best--cooking--game-ff6b35)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A complete original cooking game for the [make.fun "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137) — $250 shared by the top 10 entries.

## The game

You run a warung kilat (fast food stall) for one 3-minute shift. Tickets land on the **order board** with a patience bar; pick ingredients from the **counter** (keys 1–6 or click) to assemble the dish on the **prep plate**, fire it in the **wok** (Space), and serve the finished plate from the **pass** (click the matching ticket, or S) before the customer walks away. Serve fast for tips, chain serves for a combo.

- 6 ingredients, 6 recipes (Nasi Goreng Ayam, Ayam Saus Cabai, …)
- Shift timer, coins, combo, order patience, wrong-dish penalty
- Synthesized WebAudio sfx (chop, sizzle, ding, coins) — no audio files
- Keyboard + mouse, desktop browser, zero network requests

## Play it

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

or open `game/index.html` from any static server.

## Layout

- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `game/` — the playable game, static files only (`index.html` + `src/*.js`)
  - `src/config.js` — ingredients, recipes, layout, palette
  - `src/kitchen.js` — state machine: orders, prep plate, wok, pass, timer
  - `src/render.js` — all canvas drawing
  - `src/input.js` — mouse + keyboard
  - `src/audio.js` — synthesized sound effects
  - `src/shots.js` — staged states for the screenshots (`?shot=kitchen|prep|cook|serve`)
  - `src/random.js` — seeded RNG
  - `src/main.js` — bootstrap + game loop
- `screenshots/` — 4 real renders of the game's own code
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
