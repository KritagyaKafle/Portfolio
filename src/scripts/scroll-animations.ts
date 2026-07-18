import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Transition Bridge
  gsap.from('.transition-bridge h2', {
    scrollTrigger: {
      trigger: '.transition-bridge',
      start: 'top 80%',
    },
    opacity: 0,
    y: 30,
    duration: 1,
    ease: 'power2.out'
  });

  // Projects Grid Stagger
  gsap.from('.project-card', {
    scrollTrigger: {
      trigger: '.projects-section',
      start: 'top 80%',
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power2.out'
  });

  // About Section
  const aboutTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top 75%',
    }
  });

  aboutTl.from('.about-text', {
    opacity: 0,
    x: -30,
    duration: 1,
    ease: 'power2.out'
  }).from('.about-image', {
    opacity: 0,
    x: 30,
    duration: 1,
    ease: 'power2.out'
  }, '-=0.8');

  // Contact Section
  gsap.from('.contact-section > .container > *', {
    scrollTrigger: {
      trigger: '.contact-section',
      start: 'top 85%',
    },
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power2.out'
  });
}
