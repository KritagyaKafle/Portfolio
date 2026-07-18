---
name: gsap-scroll-animation
description: >-
  Use this skill when implementing GSAP ScrollTrigger animations, scroll-driven
  frame sequences, pinned sections, or any scroll-linked motion. Covers critical
  rules for scrub, easing, snap, and prefers-reduced-motion compliance.
---

# GSAP Scroll Animation Skill

## Setup (in every component that uses GSAP)
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

## Critical Rules

### 1. Scrub Easing
**GSAP `scrub` tweens MUST use `ease: 'none'`** — the scrub mechanism itself provides smoothing.
```js
gsap.to(target, {
  ease: 'none',        // ← MANDATORY for scrub tweens
  scrollTrigger: {
    scrub: 0.5,        // 0.5s lag for buttery feel
  }
});
```

### 2. Easing Rules
| Context | Easing | GSAP Value |
|---------|--------|------------|
| General scroll animations | Smooth, cinematic | `power2.out` or `power3.inOut` |
| Title Card ONLY | Hard, fast, confident | `power4.out` |
| Scrub-linked tweens | Linear | `'none'` |
| **NEVER use** | Bounce/overshoot | `bounce`, `elastic`, `back` |

### 3. Pinned Frame Sequence Pattern (Apple.com technique)
```js
const frameCount = 60;
const currentFrame = { value: 0 };

gsap.to(currentFrame, {
  value: frameCount - 1,
  ease: 'none',
  snap: { value: 1 },  // snap to integer frames
  scrollTrigger: {
    trigger: '.section',
    pin: true,
    scrub: 0.5,
    start: 'top top',
    end: '+=400%',      // 4x viewport scroll distance
  },
  onUpdate: () => {
    const idx = Math.round(currentFrame.value);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images[idx], 0, 0, canvas.width, canvas.height);
  }
});
```

### 4. prefers-reduced-motion
**ALWAYS check and respect:**
```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReduced) {
  // Skip animations, show end-state immediately
  // For frame sequences: show last frame, no scrub
  // For title card: show settled state, no burst
  return;
}
```

### 5. ScrollTrigger Cleanup
In Astro, scripts re-run on page load. Kill triggers on cleanup:
```js
// Not needed for single-page static sites, but good practice
ScrollTrigger.getAll().forEach(st => st.kill());
```

## Canvas Frame Sequence — Full Pattern
1. Preload all frames as `Image` objects
2. Set canvas dimensions to viewport (resize on window resize, debounced)
3. Use `drawImage` with cover-fit logic:
   ```js
   function drawCover(ctx, img, canvasW, canvasH) {
     const imgRatio = img.width / img.height;
     const canvasRatio = canvasW / canvasH;
     let sw, sh, sx, sy;
     if (canvasRatio > imgRatio) {
       sw = img.width; sh = img.width / canvasRatio;
       sx = 0; sy = (img.height - sh) / 2;
     } else {
       sh = img.height; sw = img.height * canvasRatio;
       sx = (img.width - sw) / 2; sy = 0;
     }
     ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
   }
   ```
4. Progressive loading: first 10 frames immediately, rest via `requestIdleCallback`

## Stagger Patterns
```js
// Skill cards entry
gsap.from('.skill-card', {
  opacity: 0, y: 20,
  stagger: 0.08,
  duration: 0.6,
  ease: 'power2.out',
  scrollTrigger: { trigger: '.skills-scene', start: 'top 80%' }
});

// Project cards
gsap.from('.project-card', {
  opacity: 0, y: 60,
  stagger: 0.15,
  scrollTrigger: { trigger: '.projects', start: 'top 85%' }
});
```
