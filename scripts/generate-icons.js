import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'src/assets/icons');
fs.mkdirSync(outDir, { recursive: true });

// Minimalist placeholder SVGs for standard branding icons
// In a real production build, these would be precise paths from Simple Icons.
// These use simple geometry for now to act as clean placeholders.
const icons = {
  'photoshop.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect width="24" height="24" rx="4"/><path fill="#fff" d="M6 16V8h3c1.5 0 2.5.5 2.5 2s-1 2-2.5 2H7v4H6zm1-5h2c.8 0 1.2-.3 1.2-1s-.4-1-1.2-1H7v2zm8.5 5c-1.8 0-3-1-3-2.5h1.2c0 1 1 1.5 1.8 1.5s1.2-.3 1.2-.8-.6-.6-1.5-.8c-1.5-.3-2.8-.8-2.8-2.2 0-1.5 1.2-2.5 3-2.5s2.8.8 2.8 2.2h-1.2c0-.8-.8-1.2-1.6-1.2s-1.2.3-1.2.8.6.6 1.5.8c1.5.3 2.8.8 2.8 2.2 0 1.5-1.2 2.5-3 2.5z"/></svg>`,
  'figma.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 12c-1.6 0-3-1.3-3-3s1.4-3 3-3h3v6h-3zm0 0c-1.6 0-3 1.3-3 3s1.4 3 3 3v-6h-3zm0 6c-1.6 0-3 1.4-3 3s1.4 3 3 3 3-1.4 3-3v-3h-3zM15 6c1.6 0 3-1.3 3-3s-1.4-3-3-3h-3v6h3zm0 6c1.6 0 3-1.4 3-3s-1.4-3-3-3h-3v6h3z"/></svg>`,
  'illustrator.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect width="24" height="24" rx="4"/><path fill="#fff" d="M8 16L6 8h1.5l1.2 5.5h.1L10 8h1.5l-2 8H8zm5.5 0V8h1.5v8h-1.5z"/></svg>`,
  'after-effects.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect width="24" height="24" rx="4"/><path fill="#fff" d="M8 16L6 8h1.5l1.2 5.5h.1L10 8h1.5l-2 8H8zm5.5 0V8h3.5v1.2h-2v2h1.8v1.2H15v2h2V16h-3.5z"/></svg>`,
  'premiere-pro.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect width="24" height="24" rx="4"/><path fill="#fff" d="M8 16V8h2.5c1.5 0 2.5.5 2.5 2s-1 2-2.5 2H9.5v4H8zm1.5-5h1c.8 0 1.2-.3 1.2-1s-.4-1-1.2-1h-1v2zm6 5V8h2.5c1 0 1.8.5 1.8 1.5 0 .8-.5 1.2-1.2 1.4l1.5 3.1h-1.6l-1.2-2.8h-.3v2.8H15.5zm1.5-4h1c.5 0 .8-.2.8-.8s-.3-.8-.8-.8h-1v1.6z"/></svg>`,
  'brand-identity.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6l3 6H9l3-6z"/></svg>`,
  'ui-design.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="4" y1="9" x2="20" y2="9" stroke="currentColor" stroke-width="2"/></svg>`,
  'motion-graphics.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="8,5 19,12 8,19" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  'astro.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2L2 22h4l2-4h8l2 4h4L12 2zm-4 14l4-8 4 8H8z"/></svg>`,
  'react.svg': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`,
  'nextjs.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.5V8.5h1.5l3.8 5.5v-5.5h1.5v8.5h-1.5l-3.8-5.5v5.5H10.2z"/></svg>`,
  'typescript.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect width="24" height="24" rx="2"/><path fill="#fff" d="M13 13.5h-2.5V20H8.5v-6.5H6v-2h7v2zm8.5 6.5h-2.5V18c0-1.2-1-1.5-1.5-1.5s-1.5.3-1.5 1V20H14v-8h2.5v1.2c.5-.8 1.5-1.5 2.5-1.5 1.8 0 2.5 1 2.5 2.8V20z"/></svg>`,
  'tailwindcss.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 6c-3 0-5 2-6 5 1-2 3-2 4-1 1 1 1 3 3 4s4 1 5-1c1-1 1-3 0-4-1-1-2-1-3 0-1 1-2 2-3-3z"/></svg>`,
  'gsap.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6a6 6 0 1 0 6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  'framer-motion.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2L2 12l10 10V12h10z"/></svg>`,
  'nodejs.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2l9 5v10l-9 5-9-5V7z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12v10M12 12l9-5M12 12l-9-5" stroke="currentColor" stroke-width="2"/></svg>`,
  'git.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2L2 12l10 10 10-10L12 2zm-1 15a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm4-4a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>`,
  'rest-apis.svg': `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M4 8h16M4 16h16M8 4v16M16 4v16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};

for (const [name, content] of Object.entries(icons)) {
  fs.writeFileSync(path.join(outDir, name), content);
}
console.log('Created 18 SVG icons in src/assets/icons/');
