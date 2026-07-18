# Workflow — Execution Pipeline

Step-by-step build order. Each phase triggers specific skills, has dependencies, and a verification gate before proceeding.

---

## Pipeline Overview

```
Phase 1 ─────┬──→ Phase 2 ──┐
              │               ├──→ Phase 4 ──→ Phase 5 ──┐
              └──→ Phase 3 ──┘                            ├──→ Phase 7 ──→ Phase 8
                   Phase 3 ───────→ Phase 6 ──────────────┘
```

**Parallelizable**: Phases 2+3 can run simultaneously after Phase 1.

---

## Phase 1: Project Scaffolding

| | |
|---|---|
| **Skills called** | `astro-setup` |
| **Depends on** | Nothing (first phase) |
| **Produces** | Working Astro project with directory structure |

### Execute
1. Read [astro-setup SKILL.md](.agents/skills/astro-setup/SKILL.md)
2. Run `npx -y create-astro@latest --help` (verify flags)
3. Run `npx -y create-astro@latest ./ --template minimal --no-install --typescript strict`
4. Run `npm install`
5. Run `npm install gsap sharp`
6. Create directories: `src/{layouts,components,scripts,styles,assets/icons}`, `public/{frames/hero-1,frames/hero-2,textures}`, `scripts/`

### Gate ✓
```bash
npx astro dev  # starts without errors
ls src/layouts src/components src/scripts src/styles  # all exist
```

---

## Phase 2: Frame Optimization Pipeline

| | |
|---|---|
| **Skills called** | `frame-optimization` |
| **Depends on** | Phase 1 (npm + sharp installed, public/frames/ dirs exist) |
| **Produces** | ~60 WebP frames in `public/frames/hero-1/` and `public/frames/hero-2/` |

### Execute
1. Read [frame-optimization SKILL.md](.agents/skills/frame-optimization/SKILL.md)
2. Create `scripts/optimize-frames.mjs` — Node.js script using `sharp`
   - Deduplicates: skips frames with identical file size to predecessor
   - Samples: ~60 evenly-spaced unique frames per sequence
   - Converts: JPEG → WebP at quality 80, width 1920
3. Run `node scripts/optimize-frames.mjs`

### Gate ✓
```bash
ls public/frames/hero-1/ | wc -l   # ~60
ls public/frames/hero-2/ | wc -l   # ~60
du -sh public/frames/               # ≤ 7MB total
# Visually confirm: open frame-000.webp and frame-059.webp from each
```

---

## Phase 3: Design Foundation

| | |
|---|---|
| **Skills called** | `design-system`, `astro-setup` |
| **Depends on** | Phase 1 (Astro project exists, directories created) |
| **Produces** | `global.css`, `grain.svg`, `BaseLayout.astro` |

### Execute
1. Read [design-system SKILL.md](.agents/skills/design-system/SKILL.md)
2. Read [astro-setup SKILL.md](.agents/skills/astro-setup/SKILL.md) (for layout pattern)
3. Create `public/textures/grain.svg` — `feTurbulence` noise tile 220×220
4. Create `src/styles/global.css` — all design tokens, reset, grain overlay, `prefers-reduced-motion`
5. Create `src/layouts/BaseLayout.astro` — HTML shell, font links, grain overlay div, slot

### Gate ✓
```bash
npx astro dev
# Browser: page loads with warm grey (#E8E8E6) background
# Grain texture visible (subtle overlay)
# Inspect: DM Sans and Inter loaded from Google Fonts
```

---

## Phase 4: Title Card + Hero Sequence

| | |
|---|---|
| **Skills called** | `title-card-animation`, `gsap-scroll-animation`, `astro-setup` |
| **Depends on** | Phase 2 (frames ready) + Phase 3 (styles + layout ready) |
| **Produces** | `TitleCard.astro`, `HeroSequence.astro`, `title-card.ts`, `frame-sequence.ts` |

### Execute
1. Read [title-card-animation SKILL.md](.agents/skills/title-card-animation/SKILL.md)
2. Read [gsap-scroll-animation SKILL.md](.agents/skills/gsap-scroll-animation/SKILL.md)
3. Create `src/components/TitleCard.astro` — section markup, SVG container, split-letter text, ghost layer
4. Create `src/scripts/title-card.ts` — GSAP timeline: 5-beat sequence, peacock burst, kinetic type
5. Create `src/components/HeroSequence.astro` — canvas, hero text overlay, 500vh scroll area
6. Create `src/scripts/frame-sequence.ts` — canvas engine: preload, drawImage, ScrollTrigger pin+scrub
7. Create temporary `src/pages/index.astro` with just TitleCard + HeroSequence for testing

### Gate ✓
```bash
npx astro dev
# Title card: plays 5-beat sequence on load (or skips if reduced-motion)
# Scroll: Hero_1 frames scrub smoothly on canvas
# Text overlays: split-letter system visible with ghost layer
# Dark-bridge: last Hero_1 frames go near-black
# Mobile (375px): canvas resizes, text readable
```

---

## Phase 5: Skills Scene (Scenes 3-4)

| | |
|---|---|
| **Skills called** | `gsap-scroll-animation`, `design-system` |
| **Depends on** | Phase 4 (canvas engine exists, Hero_2 frames ready) |
| **Produces** | `SkillCards.astro`, `skill-cards.ts`, 18 SVG icons |

### Execute
1. Read [gsap-scroll-animation SKILL.md](.agents/skills/gsap-scroll-animation/SKILL.md) (stagger + light tracking)
2. Read [design-system SKILL.md](.agents/skills/design-system/SKILL.md) (card styles)
3. Create 18 SVG icon files in `src/assets/icons/`
4. Create `src/components/SkillCards.astro` — canvas, card clusters (8 design + 10 dev)
5. Create `src/scripts/skill-cards.ts` — Hero_2 canvas, light position scrub, card opacity/brightness

### Gate ✓
```bash
npx astro dev
# Scroll past Hero into Skills section
# Hero_2 frames play on canvas (dark bg, face lighting)
# Cards appear with stagger, drift subtly
# Light moves L→R: design cards dim, dev cards brighten
# Card styling matches design-system spec
```

---

## Phase 6: Post-Cinematic Sections

| | |
|---|---|
| **Skills called** | `gsap-scroll-animation`, `design-system` |
| **Depends on** | Phase 3 (styles ready) — can run partially parallel with Phase 5 |
| **Produces** | `TransitionBridge.astro`, `Projects.astro`, `About.astro`, `Contact.astro`, `Footer.astro`, `scroll-animations.ts` |

### Execute
1. Read [design-system SKILL.md](.agents/skills/design-system/SKILL.md) (tokens, card styles)
2. Create `src/components/TransitionBridge.astro` — dark→light gradient, "See what I've built."
3. Create `src/components/Projects.astro` — 2-col grid, 4 placeholder cards
4. Create `src/components/About.astro` — 2-col layout, placeholder text + Hero_2 final frame
5. Create `src/components/Contact.astro` — centered, email link, social icon slots
6. Create `src/components/Footer.astro` — minimal copyright
7. Create `src/scripts/scroll-animations.ts` — fade-in-up for all sections

### Gate ✓
```bash
npx astro dev
# All sections render below skills scene
# TransitionBridge: dark→light gradient visible
# Projects: 4 cards in grid, hover scale works
# About: 2-column on desktop, stacked on mobile
# Contact: email link clickable
# Footer: copyright visible
# All sections fade-in on scroll entry
```

---

## Phase 7: Final Assembly

| | |
|---|---|
| **Skills called** | `astro-setup` |
| **Depends on** | Phase 5 + Phase 6 (all components ready) |
| **Produces** | Final `src/pages/index.astro` |

### Execute
1. Read [astro-setup SKILL.md](.agents/skills/astro-setup/SKILL.md) (page composition)
2. Update `src/pages/index.astro` — compose all 8 components in order:
   ```
   TitleCard → HeroSequence → SkillCards → TransitionBridge → Projects → About → Contact → Footer
   ```
3. Add SEO: `<title>`, `<meta description>`, `<h1>` hierarchy
4. Create `public/favicon.svg` (minimal)

### Gate ✓
```bash
npx astro dev
# Full scroll: Title → Hero → Skills → Bridge → Projects → About → Contact → Footer
# No nav bar (intentional)
# Scene transitions feel natural (dark-bridge, gradient bridge)
# Single continuous cinematic flow
```

---

## Phase 8: Polish & Final Verification

| | |
|---|---|
| **Skills called** | All |
| **Depends on** | Phase 7 (everything assembled) |
| **Produces** | Verified, production-ready build |

### Execute
1. Run full verification suite:

```bash
npx astro check          # TypeScript — zero errors
npx astro build          # Production build — succeeds
npx astro preview        # Preview prod build
```

2. Manual checks (see checklist below)
3. Fix any issues found

### Final Checklist

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | Title card plays correctly | Load page, watch sequence |
| 2 | Peacock burst flashes and fades | Watch beat 3 — color should not persist |
| 3 | Kinetic type: split-letter + ghost | Inspect DOM: each char = own element, ghost layer visible |
| 4 | Grain texture on all scenes | Visible subtle texture, stronger on dark |
| 5 | Frame scrub is smooth | Slow-scroll through Scenes 1-2, no jumps |
| 6 | Dark-bridge transition | Hero_1 last frames go black → Hero_2 starts dark |
| 7 | Light L→R in skills | Scroll skills scene, watch card brightness follow light |
| 8 | Skill cards stagger + drift | Cards appear one-by-one, subtle float animation |
| 9 | Reduced motion works | DevTools → Rendering → `prefers-reduced-motion: reduce` |
| 10 | Mobile 375px layout | Responsive stacking, readable text, canvas works |
| 11 | Lighthouse 90+ | Run audit in Chrome DevTools |
| 12 | Post-cinematic sections | All render, all scroll-animate |

### Gate ✓
All 12 checks pass → **project is complete**.

---

## Quick Reference: Skill Calls by Phase

| Phase | Skills Read Before Coding |
|-------|---------------------------|
| 1 | `astro-setup` |
| 2 | `frame-optimization` |
| 3 | `design-system` → `astro-setup` |
| 4 | `title-card-animation` → `gsap-scroll-animation` → `astro-setup` |
| 5 | `gsap-scroll-animation` → `design-system` |
| 6 | `design-system` → `gsap-scroll-animation` |
| 7 | `astro-setup` |
| 8 | All (for verification reference) |
