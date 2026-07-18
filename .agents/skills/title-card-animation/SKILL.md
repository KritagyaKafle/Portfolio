---
name: title-card-animation
description: >-
  Use this skill when implementing the cinematic title card opening sequence,
  including the held-dark beat, peacock burst, split-letter kinetic typography,
  and ghost-layer effects. Covers the Leo (2023) inspired reveal.
---

# Title Card Animation Skill

## Overview
The title card is a ~3-4s cinematic sequence that plays ONCE on page load (not scroll-driven). Inspired by the Leo (2023) title card energy — hard, confident, one gesture. It's the first thing the visitor sees and sets the tone for the entire portfolio.

---

## Sequence (5 Beats — GSAP Timeline)

### Beat 1: Held Dark (duration: 0.8s)
- Screen is `--dark-bg` (`#0D0D0D`)
- Only the grain texture is visible (`--grain-opacity-dark`)
- Nothing moves. This is a tension beat — the visitor waits.
- **Implementation**: just a `tl.to({}, { duration: 0.8 })` empty pause

### Beat 2: Light Sweep (duration: 0.6s)
- A hard-edged diagonal light bar sweeps across the screen from left to right
- **Implementation**: A `<div class="light-sweep">` with CSS:
  ```css
  .light-sweep {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 0%,
      rgba(255, 255, 255, 0.06) 45%,
      rgba(255, 255, 255, 0.12) 50%,
      rgba(255, 255, 255, 0.06) 55%,
      transparent 100%
    );
    transform: translateX(-120%);
  }
  ```
- GSAP animates `translateX(-120%)` → `translateX(120%)` over 0.6s with `power4.out`
- The sweep briefly illuminates the dark scene — like a searchlight passing over darkness
- **Not revealing a shape** — just light movement. The name doesn't exist yet.

### Beat 3: Peacock Burst (duration: 0.5s, stagger makes it ~0.7s total)

**SVG Ray Generation:**
- 16 rays radiating from a center point (viewport center)
- Each ray is an SVG `<line>` element:
  ```js
  // Generate in JS at runtime
  const rayCount = 16;
  const svg = document.querySelector('.burst-svg');
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * 360;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    // End point: extends to edge of viewport
    const rad = (angle * Math.PI) / 180;
    const len = Math.max(window.innerWidth, window.innerHeight);
    line.setAttribute('x2', cx + Math.cos(rad) * len);
    line.setAttribute('y2', cy + Math.sin(rad) * len);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
  }
  ```

**Ray Color Assignment:**
- Rays alternate between 3 peacock colors in a pattern:
  ```
  teal, gold, teal, violet, teal, gold, teal, violet...
  ```
- Exact values (from design-system skill):
  - Teal: `#3D8B8B` (majority — 8 of 16 rays)
  - Gold: `#B8943D` (4 of 16 rays)
  - Violet: `#7A5BA0` (4 of 16 rays)

**Ray Animation (per-ray, staggered):**
```js
tl.fromTo(rays, {
  scale: 0,
  opacity: 0.8,
  attr: { stroke: ray.peacockColor },  // assigned per ray
}, {
  scale: 1,
  opacity: 0,
  attr: { stroke: '#3A3A3A' },  // desaturates to warm dark grey
  duration: 0.5,
  stagger: 0.02,  // 0.02s between each ray
  ease: 'power4.out',
}, '+=0');
```

**Key**: The color AND opacity both animate. The burst starts as iridescent color and fades to grey, not just disappears. The color shift is what makes it feel like refracting light rather than a graphic effect.

### Beat 4: Title Text Snap-In (duration: ~0.8s total)

**DOM Structure:**
```html
<div class="title-text">
  <!-- Primary layer -->
  <div class="title-primary" aria-label="KRITAGYA KAFLE">
    <span class="char" style="display:inline-block">K</span>
    <span class="char" style="display:inline-block">R</span>
    <span class="char" style="display:inline-block">I</span>
    <!-- ... every character including space as a wider span -->
  </div>
  <!-- Ghost layer — decorative duplicate -->
  <div class="title-ghost" aria-hidden="true">
    <!-- same character spans, CSS-offset -->
  </div>
</div>
```

**Ghost Layer CSS (decided: `screen` blend mode, not `difference`):**
```css
.title-ghost {
  position: absolute;
  top: 3px;
  left: -2px;
  opacity: 0.15;
  mix-blend-mode: screen;
  color: var(--dark-text);
  pointer-events: none;
}
```
**Why `screen` over `difference`**: `screen` creates a soft luminous doubling effect on dark backgrounds — like a projector slightly out of focus. `difference` would invert colors and create harsh contrast artifacts. Screen = cinematic, difference = glitchy.

**Primary Text Animation:**
```js
tl.from('.title-primary .char', {
  opacity: 0,
  scale: 1.08,
  y: 12,
  duration: 0.5,
  stagger: 0.02,
  ease: 'power4.out',
}, '-=0.1');  // slight overlap with burst ending
```

**Ghost Layer Animation (0.1s behind primary):**
```js
tl.from('.title-ghost .char', {
  opacity: 0,
  x: -6,  // starts further offset, settles to CSS position
  duration: 0.6,
  stagger: 0.02,
  ease: 'power4.out',
}, '-=0.4');  // overlaps with primary
```

**Outline-During-Burst Effect:**
During beat 3 (burst), if any title text is already starting to appear, it renders as outline:
```css
.title-primary.outline-mode .char {
  -webkit-text-stroke: 1.5px var(--dark-text);
  color: transparent;
}
```
GSAP toggles this class: add at burst start, remove 0.3s after burst ends (as chars fill solid).

**Subtitle ("Graphics Meets Development"):**
```js
tl.from('.subtitle', {
  opacity: 0,
  y: 8,
  duration: 0.6,
  ease: 'power2.out',  // deliberately softer than name's power4
}, '+=0.3');  // 0.3s pause after name settles
```

Subtitle CSS:
```css
.subtitle {
  font-family: var(--font-display);
  font-size: clamp(0.75rem, 1.5vw, 1rem);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--dark-text-secondary);
}
```

### Beat 5: Settle (duration: 0.4s)
- Title card fades/dissolves gently as page transitions to Hero scene
- `body.classList.remove('on-dark-scene')` triggers grain opacity change
- Background transitions from `--dark-bg` to the Hero canvas (which starts with white-bg silhouette frames)
- **Implementation**: opacity fade on the title-card section itself, or a CSS transition on background

---

## Full Timeline Summary

```
Time:  0     0.8    1.4    1.9     2.7      3.1    3.5
       |------|------|------|--------|--------|------|
Beat:    1       2      3      4         4+sub    5
       dark   sweep  burst  name in  subtitle  settle
       hold                 +ghost
```

Total: ~3.5s from load to settled state.

---

## prefers-reduced-motion

```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReduced) {
  // Skip ALL animation. Show final state immediately:
  // - Title text visible, normal (not outline)
  // - Ghost layer at settled position
  // - Subtitle visible
  // - No burst, no sweep
  // - Remove on-dark-scene after a brief 0.5s to let user orient
  document.body.classList.remove('on-dark-scene');
  return;
}
```

---

## Typography Rules (shared with HeroSequence)

The split-letter + ghost-layer system carries into Hero section overlay text:
- Same DOM structure (per-char spans + ghost duplicate)
- Same `screen` blend mode on ghost
- BUT: Hero text uses scroll-driven parallax (letters shift 1-2px with scroll)
- Hero text EXIT: inverse of entrance — ghost layer separates back out (x offset increases), letters scale down slightly from 1 to 0.97 as they fade
- Don't use a plain opacity fade for the hero text exit — keep the kinetic language consistent

---

## Common Pitfalls (avoid these)

| Pitfall | Fix |
|---------|-----|
| Burst rays visible after animation ends | Ensure opacity reaches 0 AND remove SVG elements from DOM after burst |
| Ghost layer visible at rest (too opaque) | 0.15 opacity maximum, `screen` blend mode only |
| Letters feel like a typewriter | Stagger must be ≤0.02s — reads as "one gesture with texture," not "letter by letter" |
| Subtitle enters too fast | Keep the 0.3s gap after name — the pause creates hierarchy |
| Colors from burst bleed into next scene | Burst SVG container must be inside `.title-card` section, destroyed on settle |
