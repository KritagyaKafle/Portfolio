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
  const isMobile = window.innerWidth <= 768;
  const isCompactViewport = () => window.innerWidth <= 768;

  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;

  function resize() {
    canvas.width = Math.max(1, Math.round(window.innerWidth));
    canvas.height = Math.max(1, Math.round(window.innerHeight));
    ctx!.imageSmoothingEnabled = true;
    renderFrame();
  }

  let resizeFrame: number | undefined;
  window.addEventListener('resize', () => {
    // Avoid redrawing/flashing on mobile when address bar hides/shows (only height changes slightly)
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    if (newWidth === lastWidth && Math.abs(newHeight - lastHeight) < 120) return;
    lastWidth = newWidth;
    lastHeight = newHeight;

    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  }, { passive: true });
  resize();

  function drawFrame(ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvasW: number, canvasH: number) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasW / canvasH;
    const sceneColor = currentFrame.value < heroOneFrames ? '#EBEBE9' : '#0D0D0D';

    // Cover mode - fill 100% of canvas
    let drawW: number;
    let drawH: number;
    if (canvasRatio > imgRatio) {
      drawW = canvasW;
      drawH = drawW / imgRatio;
    } else {
      drawH = canvasH;
      drawW = drawH * imgRatio;
    }

    const offsetX = (canvasW - drawW) / 2;
    const offsetY = (canvasH - drawH) / 2;

    ctx.fillStyle = sceneColor;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  function renderFrame() {
    if (images.length === 0) return;
    const idx = Math.max(0, Math.min(totalFrames - 1, Math.round(currentFrame.value)));
    let img = images[idx];
    if (!img) {
      for (let distance = 1; distance < totalFrames; distance++) {
        img = images[idx - distance] || images[idx + distance];
        if (img) break;
      }
    }
    if (img?.complete && img.naturalWidth > 0) {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      drawFrame(ctx!, img, canvas.width, canvas.height);
    }
  }

  const getImagePath = (i: number) => {
    const mobilePrefix = isMobile ? '-mobile' : '';
    if (i < heroOneFrames) return `/frames/hero-1${mobilePrefix}/frame-${String(i).padStart(3, '0')}.webp`;
    return `/frames/hero-2${mobilePrefix}/frame-${String(i - heroOneFrames).padStart(3, '0')}.webp`;
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
    // Load initial 3 frames immediately for fast LCP
    preloadFrame(0, 'high');
    preloadFrame(1, 'high');
    preloadFrame(2, 'high');

    let fullQueueStarted = false;
    const startFullQueue = () => {
      if (fullQueueStarted) return;
      fullQueueStarted = true;
      const queue = Array.from({ length: totalFrames }, (_, i) => i).filter(i => i > 2);
      const batchSize = isMobile ? 2 : 4;
      const delayMs = isMobile ? 150 : 80;

      const loadBatch = (deadline?: IdleDeadline) => {
        let loaded = 0;
        while (queue.length && loaded < batchSize && (!deadline || deadline.timeRemaining() > 3)) {
          preloadFrame(queue.shift()!, 'low');
          loaded++;
        }
        if (queue.length) {
          return typeof window.requestIdleCallback === 'function'
            ? window.requestIdleCallback(loadBatch, { timeout: 1000 })
            : globalThis.setTimeout(() => loadBatch(), delayMs);
        }
      };

      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(loadBatch, { timeout: 1000 });
      } else {
        globalThis.setTimeout(() => loadBatch(), delayMs);
      }
    };

    // Defer heavy frame queue until after window load / first user scroll to prioritize FCP and LCP
    if (document.readyState === 'complete') {
      globalThis.setTimeout(startFullQueue, 200);
    } else {
      window.addEventListener('load', () => globalThis.setTimeout(startFullQueue, 200), { once: true });
      window.addEventListener('touchstart', startFullQueue, { once: true, passive: true });
      window.addEventListener('scroll', startFullQueue, { once: true, passive: true });
    }
  }
  preloadFrames();

  // Leave a stable, readable first scene for visitors who request less motion.
  if (prefersReducedMotion) return;

  // Initial Load Text Animation - Creative 3D Pop Up
  // Chars start visible (good for LCP), animate transform only
  gsap.fromTo('.title-primary .char', 
    { y: 40, rotateX: -70, z: -200 }, 
    { 
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
      end: isCompactViewport() ? '+=560%' : '+=700%',
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
