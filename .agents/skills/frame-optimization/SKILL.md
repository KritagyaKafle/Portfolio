---
name: frame-optimization
description: >-
  Use this skill when selecting, deduplicating, and converting frame sequences
  from Hero_1 and Hero_2 source directories. Covers intelligent frame selection,
  WebP conversion, and the seamless dark-bridge transition between sequences.
---

# Frame Optimization Skill

## Source Assets
- `Hero_1/`: 240 JPG frames, 1920×1080, ~7.6MB total
  - Sequence: silhouette at laptop (white bg) → orbits 180° → fades to near-black (~frame 154) → comes back up
- `Hero_2/`: 240 JPG frames, 1920×1080, ~9.3MB total
  - Sequence: close-up face, dark bg, studio light LEFT → light moves to RIGHT
- **"Veo" watermark** in bottom-right of Hero_2 frames — leave as-is per user decision

## Duplicate Frame Pattern
Both sequences have duplicate pairs at regular intervals (every 5th pair):
frames 012/013, 017/018, 022/023, 027/028, etc. — ~48 duplicates per sequence.

## Frame Selection Strategy
**Goal**: ~60 unique frames per sequence from ~192 unique source frames.

### Step 1: Deduplicate
Identify frames with identical file sizes to their neighbor. Keep the first, skip the second.
```bash
# Deduplicate script logic:
prev_size=0
for f in $(ls -1 Hero_1/ezgif-frame-*.jpg | sort); do
  size=$(stat -c%s "$f")
  if [ "$size" != "$prev_size" ]; then
    echo "$f"  # unique frame
  fi
  prev_size=$size
done
```

### Step 2: Sample ~60 from ~192 unique
After deduplication: 240 - 48 = ~192 unique frames.
Sample every 3rd unique frame → ~64 frames. Close enough to 60.

### Step 3: Convert to WebP
`cwebp` is NOT installed on this system. Alternatives:
1. **Install cwebp**: `sudo apt install webp` (requires sudo)
2. **Use sharp-cli via npm**: `npx sharp-cli` (no sudo needed)
3. **Use Node.js sharp**: Write a script with `sharp` npm package

**Recommended**: Use `sharp` via Node.js script (no system install needed):
```js
import sharp from 'sharp';
await sharp(inputPath)
  .resize(1920, null)  // maintain aspect ratio
  .webp({ quality: 80 })
  .toFile(outputPath);
```

### Output
- `public/frames/hero-1/frame-000.webp` through `frame-059.webp`
- `public/frames/hero-2/frame-000.webp` through `frame-059.webp`

## Seamless Transition
Hero_1 naturally fades to near-black around frame 154. Hero_2 starts in darkness.
The transition works through this shared dark-frame bridge — NOT identical frames.
The canvas simply draws the last Hero_1 frame (dark), then starts drawing Hero_2 frames (also dark).
No crossfade or special handling needed — the darkness is the bridge.

## Target File Sizes
- **Per frame**: ~40-60KB WebP (from ~30-40KB JPG — WebP may be similar or slightly smaller at q80)
- **Total per sequence**: ~2.5-3.5MB
- **Grand total**: ~5-7MB
