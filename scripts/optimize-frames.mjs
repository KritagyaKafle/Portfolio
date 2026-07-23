import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync } from 'fs';
import { join } from 'path';

async function deduplicateAndConvert(srcDir, destDir, targetFrames = 60, lastSourceFrame = Infinity) {
  mkdirSync(destDir, { recursive: true });

  // Step 1: List all frames sorted
  const files = readdirSync(srcDir)
    .filter(f => {
      if (!f.endsWith('.jpg') && !f.endsWith('.jpeg')) return false;
      const match = f.match(/(\d+)\.(?:jpg|jpeg)$/i);
      return match && Number(match[1]) <= lastSourceFrame;
    })
    .sort();

  if (files.length === 0) {
    console.error(`No JPG files found in ${srcDir}`);
    return 0;
  }

  // Step 2: Deduplicate by file size (skip consecutive identical sizes)
  const unique = [];
  let prevSize = -1;
  for (const f of files) {
    const size = statSync(join(srcDir, f)).size;
    if (size !== prevSize) {
      unique.push(f);
    }
    prevSize = size;
  }

  console.log(`${srcDir}: ${files.length} total → ${unique.length} unique`);

  // Step 3: Sample exactly targetFrames evenly. Including the final source
  // frame is safe now because Hero 1 is explicitly cut before its face-shot
  // continuation begins.
  const selected = Array.from({ length: Math.min(targetFrames, unique.length) }, (_, index) => {
    const sourceIndex = Math.round(index * (unique.length - 1) / (Math.min(targetFrames, unique.length) - 1 || 1));
    return unique[sourceIndex];
  });

  console.log(`Selected ${selected.length} frames`);

  // Step 4: Convert to WebP
  let i = 0;
  for (const selectedFile of selected) {
    const inputPath = join(srcDir, selectedFile);
    const outputPath = join(destDir, `frame-${String(i).padStart(3, '0')}.webp`);
    await sharp(inputPath)
      .resize(1920, null)
      .webp({ quality: 80 })
      .toFile(outputPath);
    i++;
  }

  console.log(`✓ ${destDir}: ${selected.length} WebP frames written`);
  return selected.length;
}

async function main() {
  console.log('Starting Frame Optimization Pipeline...');
  // Hero 1 becomes a different close-up shot after frame 150. Keep only the
  // laptop scene and its dark bridge; Hero 2 owns the close-up sequence.
  const h1Count = await deduplicateAndConvert('Hero_1', 'public/frames/hero-1', 60, 150);
  const h2Count = await deduplicateAndConvert('Hero_2', 'public/frames/hero-2', 60, 240);
  console.log(`\nDone. Hero_1: ${h1Count} frames, Hero_2: ${h2Count} frames`);
}

main().catch(err => {
  console.error("Frame optimization failed:", err);
  process.exit(1);
});
