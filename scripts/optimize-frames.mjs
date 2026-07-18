import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync } from 'fs';
import { join } from 'path';

async function deduplicateAndConvert(srcDir, destDir, targetFrames = 60) {
  mkdirSync(destDir, { recursive: true });

  // Step 1: List all frames sorted
  const files = readdirSync(srcDir)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'))
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

  // Step 3: Sample ~targetFrames evenly from unique frames
  const step = Math.max(1, Math.floor(unique.length / targetFrames));
  const selected = [];
  for (let i = 0; i < unique.length && selected.length < targetFrames; i += step) {
    selected.push(unique[i]);
  }
  // Always include last unique frame
  if (selected[selected.length - 1] !== unique[unique.length - 1]) {
    selected.push(unique[unique.length - 1]);
  }

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
  const h1Count = await deduplicateAndConvert('Hero_1', 'public/frames/hero-1', 60);
  const h2Count = await deduplicateAndConvert('Hero_2', 'public/frames/hero-2', 60);
  console.log(`\nDone. Hero_1: ${h1Count} frames, Hero_2: ${h2Count} frames`);
}

main().catch(err => {
  console.error("Frame optimization failed:", err);
  process.exit(1);
});
