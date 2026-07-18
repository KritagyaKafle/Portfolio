---
name: astro-setup
description: >-
  Use this skill when initializing the Astro project, creating layouts,
  components, pages, or configuring astro.config.mjs. Covers Astro-specific
  patterns: frontmatter, client:load directives, static asset handling,
  and TypeScript strict mode.
---

# Astro Project Setup Skill

## Project Init

```bash
npx -y create-astro@latest ./ --template minimal --no-install --typescript strict
npm install
npm install gsap
```

**Critical**: Run `create-astro --help` first to verify flags.

## Astro Patterns Used in This Project

### Component Structure
Every `.astro` file uses frontmatter (`---`) for server-side logic, HTML below:
```astro
---
// Server-side: imports, props, data
interface Props { title: string; }
const { title } = Astro.props;
---
<section>{title}</section>
<style>/* scoped by default */</style>
```

### Client Scripts (GSAP)
GSAP runs client-side. Use `<script>` tags in components — Astro bundles them automatically:
```astro
<script>
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);
  // animation code here
</script>
```

### Static Assets
- Files in `public/` served at root: `public/frames/hero-1/frame-000.webp` → `/frames/hero-1/frame-000.webp`
- Files in `src/assets/` processed by Astro image pipeline (not used for frame sequences)

### Fonts
Loaded via `<link>` in BaseLayout.astro head — Google Fonts preconnect pattern:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
```

### No SSR
This is a fully static site. No `output: 'server'` in config. Default `output: 'static'`.

## Verification
```bash
npx astro check   # TypeScript validation
npx astro build   # Build succeeds
npx astro dev     # Dev server starts
```
