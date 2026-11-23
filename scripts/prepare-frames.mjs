/**
 * scripts/prepare-frames.mjs
 *
 * Converts frames1/ and frames2/ PNG sequences into WebP,
 * drops duplicate consecutive frames, writes manifest.json.
 *
 * Usage:  npm run prepare:frames
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Config ──────────────────────────────────────────────
const WEBP_QUALITY = 82;
const SM_WIDTH = 854;
const CROP_BOTTOM_FRAC = 0.08;   // keep in sync with src/config.ts CROP_BOTTOM
const SEQUENCES = [
  { src: 'frames1', dest: 'public/frames/seq1', seqKey: 'seq1' },
  { src: 'frames2', dest: 'public/frames/seq2', seqKey: 'seq2' },
];
const MANIFEST_PATH = path.join(ROOT, 'public/frames/manifest.json');
// ────────────────────────────────────────────────────────

/** Natural-sort comparator */
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/** Average hex color of a horizontal strip */
async function avgStripColor(image, y, h, w) {
  const { data } = await image
    .clone()
    .extract({ left: 0, top: y, width: w, height: h })
    .resize(1, 1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const r = data[0], g = data[1], b = data[2];
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

/** Are two images pixel-identical (after resize to tiny thumbnail)?
 *  Only flags TRUE duplicates (30fps→24fps cadence: every 5th frame repeats).
 *  Threshold is very tight: avg difference < 1/255 per channel.
 */
async function areDuplicates(pathA, pathB) {
  const size = { width: 64, height: 36 };
  const [a, b] = await Promise.all([
    sharp(pathA).resize(size).raw().toBuffer(),
    sharp(pathB).resize(size).raw().toBuffer(),
  ]);
  let diffSum = 0;
  for (let i = 0; i < a.length; i++) diffSum += Math.abs(a[i] - b[i]);
  // Allow max avg channel diff of 1 out of 255 — catches only byte-identical frames
  const maxAllowed = size.width * size.height * 3 * 1;
  return diffSum <= maxAllowed;
}

async function processSequence({ src, dest, seqKey }) {
  const srcDir = path.join(ROOT, src);
  const destDir = path.join(ROOT, dest);
  const destDirSm = path.join(destDir, 'sm');

  // List and sort source files
  const files = fs
    .readdirSync(srcDir)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort(naturalSort);

  if (files.length === 0) {
    console.error(`[${seqKey}] No frames found in ${srcDir}`);
    return null;
  }

  // ── Drop consecutive duplicates ──────────────────────
  console.log(`\n[${seqKey}] Deduplicating ${files.length} frames…`);
  const unique = [files[0]];
  let dropped = 0;
  for (let i = 1; i < files.length; i++) {
    const isDup = await areDuplicates(
      path.join(srcDir, files[i - 1]),
      path.join(srcDir, files[i]),
    );
    if (isDup) {
      dropped++;
    } else {
      unique.push(files[i]);
    }
  }
  console.log(`[${seqKey}] Dropped ${dropped} duplicate frames. Keeping ${unique.length}.`);

  // ── Measure source size ──────────────────────────────
  const srcSizeBytes = files.reduce((sum, f) => {
    return sum + fs.statSync(path.join(srcDir, f)).size;
  }, 0);

  // ── Prepare output dirs ──────────────────────────────
  fs.mkdirSync(destDir, { recursive: true });
  fs.mkdirSync(destDirSm, { recursive: true });

  // ── Convert frames ───────────────────────────────────
  const { width: origW, height: origH } = await sharp(path.join(srcDir, unique[0])).metadata();
  const cropH = Math.round(origH * (1 - CROP_BOTTOM_FRAC));

  const topColors = [];
  const bottomColors = [];
  let destSizeBytes = 0;

  for (let i = 0; i < unique.length; i++) {
    const num = String(i + 1).padStart(4, '0');
    const srcPath = path.join(srcDir, unique[i]);
    const destPath = path.join(destDir, `${num}.webp`);
    const destSmPath = path.join(destDirSm, `${num}.webp`);

    const img = sharp(srcPath);

    // Sample edge colors (from full-size, before crop)
    const stripH = Math.max(1, Math.round(origH * 0.03));
    const [top, bot] = await Promise.all([
      avgStripColor(img, 0, stripH, origW),
      avgStripColor(img, origH - stripH, stripH, origW),
    ]);
    topColors.push(top);
    bottomColors.push(bot);

    // Full size
    await img
      .extract({ left: 0, top: 0, width: origW, height: cropH })
      .webp({ quality: WEBP_QUALITY })
      .toFile(destPath);

    // Small variant
    await sharp(srcPath)
      .extract({ left: 0, top: 0, width: origW, height: cropH })
      .resize({ width: SM_WIDTH })
      .webp({ quality: WEBP_QUALITY })
      .toFile(destSmPath);

    destSizeBytes += fs.statSync(destPath).size + fs.statSync(destSmPath).size;

    if ((i + 1) % 10 === 0 || i === unique.length - 1) {
      process.stdout.write(`\r[${seqKey}] ${i + 1}/${unique.length} converted…`);
    }
  }
  console.log('');

  const reduction = ((1 - destSizeBytes / srcSizeBytes) * 100).toFixed(1);
  console.log(`[${seqKey}] Size: ${(srcSizeBytes / 1e6).toFixed(1)} MB → ${(destSizeBytes / 1e6).toFixed(1)} MB (${reduction}% reduction)`);

  return {
    seqKey,
    info: {
      count: unique.length,
      width: origW,
      height: cropH,
      folder: `/frames/${path.basename(dest)}`,
      folderSm: `/frames/${path.basename(dest)}/sm`,
      topColors,
      bottomColors,
    },
  };
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  TY Shoes — Frame Preparation Script  ');
  console.log('═══════════════════════════════════════');

  const manifest = {};
  for (const seq of SEQUENCES) {
    const result = await processSequence(seq);
    if (result) manifest[result.seqKey] = result.info;
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest written to ${MANIFEST_PATH}`);
  console.log('═══════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('Error during frame preparation:', err);
  process.exit(1);
});
