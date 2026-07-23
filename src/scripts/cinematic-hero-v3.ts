import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCinematicMaster() {
  const canvas = document.getElementById('master-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const heroOneFrames = 60;
  const heroTwoFrames = 60;
  const totalFrames = heroOneFrames + heroTwoFrames;
  const currentFrame = { value: 0 };
  const images: Array<HTMLImageElement | undefined> = [];
  const loading = new Set<number>();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCompactViewport = window.matchMedia('(max-width: 768px)').matches;

  function resize() {
    // Keep the backing store proportional to the CSS box. This avoids the
    // expensive multi-megapixel redraws that make the sequence stutter on
    // mobile while preserving the source aspect ratio.
    canvas.width = Math.max(1, Math.round(window.innerWidth));
    canvas.height = Math.max(1, Math.round(window.innerHeight));
    ctx!.imageSmoothingEnabled = true;
    renderFrame();
  }
  let resizeFrame: number | undefined;
  window.addEventListener('resize', () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  }, { passive: true });
  resize();

  function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvasW: number, canvasH: number) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasW / canvasH;
    let sw: number, sh: number, sx: number, sy: number;
    if (canvasRatio > imgRatio) {
      sw = img.naturalWidth; sh = img.naturalWidth / canvasRatio;
      sx = 0; sy = (img.naturalHeight - sh) / 2;
    } else {
      sh = img.naturalHeight; sw = img.naturalHeight * canvasRatio;
      sx = (img.naturalWidth - sw) / 2; sy = 0;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
  }

  function renderFrame() {
    if (images.length === 0) return;
    const idx = Math.max(0, Math.min(totalFrames - 1, Math.round(currentFrame.value)));
    // Never use an arbitrary future/last frame. That made the end of the
    // sequence appear to jump or look stretched while mobile was still
    // downloading the requested frame.
    let img = images[idx];
    if (!img) {
      for (let distance = 1; distance < totalFrames; distance++) {
        img = images[idx - distance] || images[idx + distance];
        if (img) break;
      }
    }
    if (img?.complete && img.naturalWidth > 0) {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      drawCover(ctx!, img, canvas.width, canvas.height);
    }
  }

  const getImagePath = (i: number) => {
    if (i < heroOneFrames) return `/frames/hero-1/frame-${String(i).padStart(3, '0')}.webp`;
    return `/frames/hero-2/frame-${String(i - heroOneFrames).padStart(3, '0')}.webp`;
  };

  function preloadFrame(index: number, priority: 'auto' | 'high' | 'low' = 'low') {
    if (index < 0 || index >= totalFrames || images[index] || loading.has(index)) return;
    loading.add(index);
    const img = new Image();
    img.decoding = 'async';
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = priority;
    img.src = getImagePath(index);
    img.onload = () => {
      images[index] = img;
      loading.delete(index);
      renderFrame();
    };
    img.onerror = () => loading.delete(index);
  }

  function preloadFrames() {
    // Prioritise what is visible first, the dark bridge between sequences, and
    // the final frame. The rest is loaded in small idle batches instead of
    // opening 120 image requests at once.
    for (let i = 0; i < 8; i++) preloadFrame(i, 'high');
    for (let i = heroOneFrames - 4; i <= heroOneFrames + 4; i++) preloadFrame(i, 'high');
    preloadFrame(totalFrames - 1, 'high');

    const queue = Array.from({ length: totalFrames }, (_, i) => i);
    const loadIdleBatch = (deadline?: IdleDeadline) => {
      let loaded = 0;
      while (queue.length && loaded < 4 && (!deadline || deadline.timeRemaining() > 4)) {
        preloadFrame(queue.shift()!);
        loaded++;
      }
      if (queue.length) {
        return typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback(loadIdleBatch)
          : globalThis.setTimeout(() => loadIdleBatch(), 80);
      }
    };
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(loadIdleBatch);
    else globalThis.setTimeout(() => loadIdleBatch(), 120);
  }
  preloadFrames();

  // Leave a stable, readable first scene for visitors who request less motion.
  if (prefersReducedMotion) return;

  // Initial Load Text Animation - Creative 3D Pop Up
  gsap.fromTo('.title-primary .char', 
    { opacity: 0, y: 50, rotateX: -90, z: -300 }, 
    { 
      opacity: 1, 
      y: 0, 
      rotateX: 0, 
      z: 0, 
      duration: 1.2, 
      stagger: 0.05, 
      ease: 'power4.out',
      transformOrigin: '50% 50% -50px'
    }
  );
  gsap.fromTo('.title-subtitle', 
    { opacity: 0, y: 30, scale: 0.8 }, 
    { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.8, ease: 'power3.out' }
  );



  // Main Scroll Timeline
  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.cinematic-master',
      pin: true, 
      start: 'top top',
      end: isCompactViewport ? '+=560%' : '+=700%',
      scrub: 0.5,
    }
  });

  // 1. Frame Sequence Scrub (ends at 80% scroll)
  scrollTl.to(currentFrame, {
    value: totalFrames - 1, 
    ease: 'none',
    snap: { value: 1 },
    onUpdate: () => {
      const frame = Math.round(currentFrame.value);
      preloadFrame(frame, 'high');
      preloadFrame(frame - 1);
      preloadFrame(frame + 1);
      renderFrame();
    },
    duration: 0.8 
  }, 0);

  // 2. Title Layer Fades Out - 3D moving back, smaller, and rotating
  scrollTl.to('.title-layer', {
    z: -1200,          // moving back
    scale: 0.2,        // turning smaller
    rotationY: -180,   // go round (3D flip to match a turn)
    rotationZ: -10,    // slight tilt
    opacity: 0,
    ease: 'none',
    duration: 0.4
  }, 0);

  // 3. Lower Headshot Opacity heavily during Hero_2 (frames 61+)
  scrollTl.to(canvas, {
    opacity: 0.35, 
    duration: 0.2,
    ease: 'none'
  }, 0.35); // Happens as Hero_1 goes black and Hero_2 starts

  // 4. SEQUENTIAL POPUPS for Skills based on scroll progress & light position

  // 4a. Left Side (Graphics) pops UP as the light hits the left side of face
  scrollTl.to('.graphics-card', {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.1,
    stagger: 0.015,
    ease: 'none'
  }, 0.45);

  // Left Side (Graphics) pops DOWN (disappears) as light moves away from left
  scrollTl.to('.graphics-card', {
    opacity: 0,
    scale: 0.8,
    y: -20,
    duration: 0.1,
    stagger: 0.01,
    ease: 'none'
  }, 0.58);

  // 4b. Right Side (Development) pops UP as the light shifts to the right side
  scrollTl.to('.dev-card', {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.1,
    stagger: 0.015,
    ease: 'none'
  }, 0.65);

  // Right Side (Development) pops DOWN (disappears) as the sequence ends
  scrollTl.to('.dev-card', {
    opacity: 0,
    scale: 0.8,
    y: -20,
    duration: 0.1,
    stagger: 0.01,
    ease: 'none'
  }, 0.80);

  // 5. Fade out Canvas & Fade in Bridge Layer
  scrollTl.to('.canvas-wrapper', {
    opacity: 0,
    duration: 0.1,
    ease: 'none'
  }, 0.85);

  scrollTl.to('.bridge-layer', {
    opacity: 1,
    y: -30,
    duration: 0.1,
    ease: 'none'
  }, 0.9);
}
