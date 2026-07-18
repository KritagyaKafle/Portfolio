import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCinematicMaster() {
  const canvas = document.getElementById('master-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const totalFrames = 122; 
  const currentFrame = { value: 0 };
  const images: HTMLImageElement[] = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame();
  }
  window.addEventListener('resize', () => requestAnimationFrame(resize));
  resize();

  function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvasW: number, canvasH: number) {
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

  function renderFrame() {
    if (images.length === 0) return;
    const idx = Math.round(currentFrame.value);
    const img = images[idx];
    if (img && img.complete) {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      drawCover(ctx!, img, canvas.width, canvas.height);
    }
  }

  const getImagePath = (i: number) => {
    if (i < 61) return `/frames/hero-1/frame-${String(i).padStart(3, '0')}.webp`;
    else return `/frames/hero-2/frame-${String(i - 61).padStart(3, '0')}.webp`;
  };

  async function preloadFrames() {
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => {
        const img = new Image();
        img.src = getImagePath(i);
        img.onload = () => {
          images[i] = img;
          if (i === 0) renderFrame();
          resolve(img);
        };
      });
    }
    for (let i = 20; i < totalFrames; i++) {
      const img = new Image();
      img.src = getImagePath(i);
      img.onload = () => { images[i] = img; };
    }
  }
  preloadFrames();

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
      ease: 'back.out(1.7)',
      transformOrigin: '50% 50% -50px'
    }
  );
  gsap.fromTo('.title-subtitle', 
    { opacity: 0, y: 30, scale: 0.8 }, 
    { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.8, ease: 'back.out(1.2)' }
  );



  // Main Scroll Timeline
  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.cinematic-master',
      pin: true, 
      start: 'top top',
      end: '+=700%', // Creates 700vh of scroll duration
      scrub: 0.5,
    }
  });

  // 1. Frame Sequence Scrub (ends at 80% scroll)
  scrollTl.to(currentFrame, {
    value: totalFrames - 1, 
    ease: 'none',
    snap: { value: 1 },
    onUpdate: renderFrame,
    duration: 0.8 
  }, 0);

  // 2. Title Layer Fades Out - 3D moving back, smaller, and rotating
  scrollTl.to('.title-layer', {
    z: -1200,          // moving back
    scale: 0.2,        // turning smaller
    rotationY: -180,   // go round (3D flip to match a turn)
    rotationZ: -10,    // slight tilt
    opacity: 0,
    ease: 'power1.inOut',
    duration: 0.4
  }, 0);

  // 3. Lower Headshot Opacity heavily during Hero_2 (frames 61+)
  scrollTl.to(canvas, {
    opacity: 0.35, 
    duration: 0.2,
    ease: 'power2.inOut'
  }, 0.35); // Happens as Hero_1 goes black and Hero_2 starts

  // 4. SEQUENTIAL POPUPS for Skills based on scroll progress & light position

  // 4a. Left Side (Graphics) pops UP as the light hits the left side of face
  scrollTl.to('.graphics-card', {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.1,
    stagger: 0.015,
    ease: 'back.out(1.5)'
  }, 0.45);

  // Left Side (Graphics) pops DOWN (disappears) as light moves away from left
  scrollTl.to('.graphics-card', {
    opacity: 0,
    scale: 0.8,
    y: -20,
    duration: 0.1,
    stagger: 0.01,
    ease: 'power2.in'
  }, 0.58);

  // 4b. Right Side (Development) pops UP as the light shifts to the right side
  scrollTl.to('.dev-card', {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.1,
    stagger: 0.015,
    ease: 'back.out(1.5)'
  }, 0.65);

  // Right Side (Development) pops DOWN (disappears) as the sequence ends
  scrollTl.to('.dev-card', {
    opacity: 0,
    scale: 0.8,
    y: -20,
    duration: 0.1,
    stagger: 0.01,
    ease: 'power2.in'
  }, 0.80);

  // 5. Fade out Canvas & Fade in Bridge Layer
  scrollTl.to('.canvas-wrapper', {
    opacity: 0,
    duration: 0.1,
    ease: 'power2.inOut'
  }, 0.85);

  scrollTl.to('.bridge-layer', {
    opacity: 1,
    y: -30,
    duration: 0.1,
    ease: 'power2.out'
  }, 0.9);
}
