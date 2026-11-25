// SizzleWok — Dapur Berapi: the hand-in program (Node 22, standard library
// only). It copies this repository's game/ and screenshots/ into the output
// directory and writes dossier.json there with the vendored make.fun library,
// exactly the bytes the scorer rebuilds the dossier from. The program runs
// twice in the grader and both runs must write the same bytes, so it copies
// and writes deterministically and touches nothing else.
//
// Local run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps, mirrored here so a bad entry fails loudly at home
// instead of silently at the gate: at most 4 screenshots, each at most
// 256 KiB; game/ at most 993 files and directories and 48 MiB in all.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function countEntries(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    total += 1;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) total += countEntries(full);
  }
  return total;
}

function fail(message) {
  throw new Error(`sizzlewok main.ts: ${message}`);
}

const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');
if (!existsSync(gameDir)) fail('game/ is missing from the repository');
if (!existsSync(join(gameDir, 'index.html'))) fail('game/index.html is missing');
if (!existsSync(shotsDir)) fail('screenshots/ is missing from the repository');

const shotNames = readdirSync(shotsDir).filter((name) => !name.startsWith('.')).sort();
if (shotNames.length < 3 || shotNames.length > 4) {
  fail(`expected 3 or 4 screenshots, found ${shotNames.length}`);
}
for (const name of shotNames) {
  const size = statSync(join(shotsDir, name)).size;
  if (size > DOSSIER_CAPS.screenshots.max_bytes) fail(`screenshot ${name} is ${size} bytes, over the 256 KiB cap`);
}
if (countEntries(gameDir) > DOSSIER_CAPS.game_max_files) fail('game/ holds more than 993 files and directories');

mkdirSync(outDir, { recursive: true });
cpSync(gameDir, join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });
writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, DOSSIER_CAPS));
const dossierBytes = statSync(join(outDir, 'dossier.json')).size;

console.log(`sizzlewok: wrote ${shotNames.length} screenshots and dossier.json (${dossierBytes} bytes) to ${outDir}`);
