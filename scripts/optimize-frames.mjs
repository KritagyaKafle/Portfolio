import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();

async function processSequence(srcDir, destDesktopDir, destMobileDir) {
  if (!fs.existsSync(destDesktopDir)) fs.mkdirSync(destDesktopDir, { recursive: true });
  if (!fs.existsSync(destMobileDir)) fs.mkdirSync(destMobileDir, { recursive: true });

  const files = fs.readdirSync(srcDir)
    .filter(f => f.endsWith('.jpg'))
    .sort();

  // Deduplicate consecutive identical-size files
  const uniqueFiles = [];
  let prevSize = -1;
  for (const file of files) {
    const filePath = path.join(srcDir, file);
    const size = fs.statSync(filePath).size;
    if (size !== prevSize) {
      uniqueFiles.push(filePath);
      prevSize = size;
    }
  }

  // Sample exactly 60 frames evenly
  const targetCount = 60;
  const sampled = [];
  for (let i = 0; i < targetCount; i++) {
    const idx = Math.floor((i / (targetCount - 1)) * (uniqueFiles.length - 1));
    sampled.push(uniqueFiles[idx]);
  }

  console.log(`Processing ${srcDir}: ${files.length} total -> ${uniqueFiles.length} unique -> ${sampled.length} sampled`);

  for (let i = 0; i < sampled.length; i++) {
    const input = sampled[i];
    const frameName = `frame-${String(i).padStart(3, '0')}.webp`;
    const outDesktop = path.join(destDesktopDir, frameName);
    const outMobile = path.join(destMobileDir, frameName);

    // Desktop: 1920x1080 WebP q72
    await sharp(input)
      .resize(1920, 1080, { fit: 'cover' })
      .webp({ quality: 72, effort: 6 })
      .toFile(outDesktop);

    // Mobile: 720x405 WebP q68
    await sharp(input)
      .resize(720, 405, { fit: 'cover' })
      .webp({ quality: 68, effort: 6 })
      .toFile(outMobile);
  }
}

async function main() {
  console.log('Starting frame optimization...');
  await processSequence(
    path.join(ROOT, 'Hero_1'),
    path.join(ROOT, 'public/frames/hero-1'),
    path.join(ROOT, 'public/frames/hero-1-mobile')
  );
  await processSequence(
    path.join(ROOT, 'Hero_2'),
    path.join(ROOT, 'public/frames/hero-2'),
    path.join(ROOT, 'public/frames/hero-2-mobile')
  );
  console.log('Frame optimization complete!');
}

main().catch(console.error);
