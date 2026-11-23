/**
 * smoothScroll.ts
 * Sets up Lenis smooth scrolling synced with GSAP ScrollTrigger.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll(): Lenis {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 1.5,
  });

  // Sync Lenis with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  // Drive Lenis from GSAP ticker (lagSmoothing off)
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((time) => {
    lenis!.raf(time * 1000);
  });

  return lenis;
}

export function destroySmoothScroll() {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

export function getLenis() {
  return lenis;
}

/** Scroll to a selector or element */
export function scrollTo(target: string | HTMLElement, offset = 0) {
  if (!lenis) return;
  lenis.scrollTo(target, { offset });
}

/** prefers-reduced-motion check */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
