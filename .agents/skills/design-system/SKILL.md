---
name: design-system
description: >-
  Use this skill when implementing the design token system, typography, grain
  texture overlay, color palette, and CSS architecture. Covers all visual design
  decisions for the portfolio including the cinematic grey palette with texture.
---

# Design System Skill

## Philosophy
**Grey with depth, not grey and flat.** Every surface has a different grey to create layering. The grain overlay turns flat fills into cinematic materials — concrete, brushed metal, unlit film stock. Without the grain, the palette would feel sterile. With it, it feels textured and alive.

---

## Color Tokens — Complete Palette

### Light Scenes (Hero silhouette, Projects, About, Contact)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#E8E8E6` | Page background — slightly warm, not pure grey |
| `--bg-elevated` | `#F2F2F0` | Raised surfaces (project card bg, About image container) |
| `--card-bg` | `#F0F0EE` | Skill card fill — sits above --bg |
| `--card-bg-hover` | `#FAFAF8` | Card hover state — lifts visually |
| `--border` | `#D4D4D1` | Card and section borders |
| `--border-subtle` | `#E0E0DD` | Lighter dividers, separators |
| `--text` | `#161616` | Primary text — near-black, not pure black |
| `--text-secondary` | `#5C5C5A` | Subtitles, captions, meta text |
| `--text-tertiary` | `#8A8A87` | Footer text, copyright, hints |

### Dark Scenes (Title Card, Skills Scene Scenes 3-4)
| Token | Value | Usage |
|-------|-------|-------|
| `--dark-bg` | `#0D0D0D` | Dark scene background — near-black |
| `--dark-surface` | `#1A1A1A` | Elevated dark surface (card on dark bg) |
| `--dark-border` | `#2A2A2A` | Card borders on dark bg |
| `--dark-text` | `#E8E8E6` | Primary text on dark — matches light bg for consistency |
| `--dark-text-secondary` | `#9A9A97` | Secondary text on dark |

### Special Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--glow` | `rgba(255,255,255,0.35)` | Warm white glow for light-source effects |
| `--glow-soft` | `rgba(255,255,255,0.12)` | Softer glow for card edges near light |
| `--shadow-light` | `rgba(0,0,0,0.04)` | Subtle shadow on light scenes |
| `--shadow-dark` | `rgba(0,0,0,0.25)` | Shadow on dark scenes |

### Grain Control
| Token | Value | Usage |
|-------|-------|-------|
| `--grain-opacity-light` | `0.035` | Noise overlay on light scenes |
| `--grain-opacity-dark` | `0.055` | Noise overlay on dark scenes |

---

## Peacock Accent — Exact Values (Title Card ONLY)

These colors exist ONLY during the burst flash (~0.4-0.6s). They must desaturate back to grey as the burst fades. **Never persist into the rest of the palette.**

| Token | Value | HSL | Usage |
|-------|-------|-----|-------|
| `--peacock-teal` | `#3D8B8B` | `hsl(180, 39%, 39%)` | Primary ray color — most rays use this |
| `--peacock-gold` | `#B8943D` | `hsl(43, 50%, 48%)` | Warm accent — alternating rays |
| `--peacock-violet` | `#7A5BA0` | `hsl(270, 28%, 49%)` | Cool accent — sparingly on 2-3 rays |

**Why low saturation**: The burst should feel like light refracting through a prism — a hint of spectral color, not a neon rave. The values above are deliberately muted (39-50% saturation) so they read as "iridescent warmth" rather than "colored shapes."

**Desaturation timeline**: Over the 0.4-0.6s burst duration, each ray's color animates from its peacock value to `#3A3A3A` (warm dark grey) as opacity drops to 0. The color shift and opacity fade happen simultaneously.

---

## Typography

| Role | Font | Weights | CSS Variable | Size Guide |
|------|------|---------|--------------|------------|
| Display (name, headings) | DM Sans | 500, 700 | `--font-display` | Title: `clamp(2.5rem, 6vw, 5rem)` |
| Body/UI | Inter | 400, 500 | `--font-body` | Body: `18px`, Cards: `14px` |

```css
--font-display: 'DM Sans', sans-serif;
--font-body: 'Inter', sans-serif;
```

### Title Card Typography Sizes
| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| "KRITAGYA KAFLE" | `clamp(2.5rem, 6vw, 5rem)` | 700 | `0.02em` |
| "Graphics Meets Development" | `clamp(0.75rem, 1.5vw, 1rem)` | 500 | `0.15em` |

### Body Typography
| Element | Size | Weight | Line-height |
|---------|------|--------|-------------|
| Section headings | `clamp(1.5rem, 3vw, 2.5rem)` | 700 | 1.2 |
| Body paragraphs | `18px` | 400 | 1.7 |
| Card labels | `14px` | 500 | 1.4 |
| Footer/meta | `14px` | 400 | 1.5 |

**Loading**: `<link>` preconnect + `display=swap` to prevent FOIT.

---

## Grain/Noise Texture

### Implementation: SVG feTurbulence tile
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.65"
      numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#grain)" opacity="1"/>
</svg>
```

### CSS
```css
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: var(--grain-opacity-light);
  background-image: url("/textures/grain.svg");
  background-size: 220px 220px;
}

body.on-dark-scene .grain-overlay {
  opacity: var(--grain-opacity-dark);
  /* Slow animated drift on dark scenes — subtle position shift */
  animation: grain-drift 8s ease-in-out infinite alternate;
}

@keyframes grain-drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-10px, -10px); }
}

@media (prefers-reduced-motion: reduce) {
  .grain-overlay { animation: none !important; }
}
```

**Why animated drift on dark**: On the dark title card / skills scene, static grain is more noticeable (higher opacity). A very slow drift (8s cycle, just 10px shift) makes the texture feel alive — like film grain that shifts per frame — without being distracting. Disabled for reduced-motion.

---

## Skill Cards — Light & Dark Variants

### Light Scene Cards (post-cinematic sections)
```css
.skill-card {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  opacity: 0.9;
  box-shadow: 0 2px 8px var(--shadow-light);
  backdrop-filter: blur(8px);
  transition: opacity 0.4s ease, box-shadow 0.4s ease;
}
```

### Dark Scene Cards (Skills Scene over Hero_2 canvas)
```css
.skill-card--dark {
  background: var(--dark-surface);
  border: 1px solid var(--dark-border);
  color: var(--dark-text);
  box-shadow: 0 2px 12px var(--shadow-dark);
}

.skill-card--dark svg {
  filter: brightness(1.2);  /* icons pop slightly on dark bg */
}
```

### Card Hover (both variants)
```css
.skill-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
```

### Card "Lit" State (when virtual light passes over it)
```css
.skill-card--lit {
  box-shadow: 0 0 20px var(--glow-soft), 0 2px 12px var(--shadow-dark);
  border-color: rgba(255, 255, 255, 0.15);
}
```

---

## Motion Easing CSS Variables
```css
--ease-smooth: cubic-bezier(0.22, 1, 0.36, 1);    /* general scroll animations */
--ease-hard: cubic-bezier(0.65, 0, 0.35, 1);       /* title card only */
--transition-fast: 0.2s var(--ease-smooth);          /* hover states */
--transition-medium: 0.4s var(--ease-smooth);        /* scroll entries */
```

---

## Responsive Breakpoints
```css
/* Desktop: default — no query */
/* Tablet */
@media (max-width: 768px) { ... }
/* Mobile — primary test target */
@media (max-width: 480px) { ... }
```

---

## Section Background Map

| Section | Background | Text Color | Grain |
|---------|-----------|------------|-------|
| Title Card | `--dark-bg` | `--dark-text` | `--grain-opacity-dark` + drift |
| Hero (Scenes 1-2) | Canvas (white bg frames) | `--text` | `--grain-opacity-light` |
| Skills (Scenes 3-4) | Canvas (dark bg frames) | `--dark-text` | `--grain-opacity-dark` + drift |
| Transition Bridge | Gradient `--dark-bg` → `--bg` | `--dark-text` → `--text` | Transitions |
| Projects | `--bg` | `--text` | `--grain-opacity-light` |
| About | `--bg` | `--text` | `--grain-opacity-light` |
| Contact | `--bg` | `--text` | `--grain-opacity-light` |
| Footer | `--bg` | `--text-tertiary` | `--grain-opacity-light` |

This map ensures every section has the right bg/text/grain combination. No guessing during implementation.
