/**
 * SequenceSection.tsx
 * Tall container + sticky canvas + scrolling overlay content.
 * Frame advancement is driven by scroll progress via GSAP ScrollTrigger.
 */
import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FrameEngine, SeqInfo, drawFrame, getDPR } from '../lib/frameEngine';
import { FRAME_LERP, FOCAL_X, FOCAL_Y, CROP_BOTTOM, MOBILE_BREAKPOINT } from '../config';
import { prefersReducedMotion } from '../lib/smoothScroll';
import './SequenceSection.css';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  seqInfo: SeqInfo | null;
  scrollVh: number;
  id?: string;
  children?: ReactNode;
  onProgress?: (progress: number) => void;
  /** Called with engine ref so parent can request window preloads */
  onEngineReady?: (engine: FrameEngine) => void;
  fadeOutBottom?: boolean;
}

export default function SequenceSection({
  seqInfo,
  scrollVh,
  id,
  children,
  onProgress,
  onEngineReady,
  fadeOutBottom = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FrameEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetIndexRef = useRef(0);
  const displayedIndexRef = useRef(0);
  const directionRef = useRef(0);
  const lastDrawnRef = useRef(-1);
  const progressRef = useRef(0);
  const reducedMotion = prefersReducedMotion();

  // Size canvas to viewport
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = getDPR();
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    // Redraw current frame
    lastDrawnRef.current = -1;
    drawCurrentFrame();
  }, []); // eslint-disable-line

  const drawCurrentFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const idx = Math.round(displayedIndexRef.current);
    if (idx === lastDrawnRef.current) return;
    lastDrawnRef.current = idx;

    const result = engine.getNearestBitmap(idx);
    if (!result) return;

    const { bitmap } = result;
    const isPortrait = window.innerWidth < MOBILE_BREAKPOINT && window.innerHeight > window.innerWidth * 1.3;
    const topColor = seqInfo?.topColors[result.index];
    const bottomColor = seqInfo?.bottomColors[result.index];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFrame(
      ctx,
      bitmap,
      canvas.width,
      canvas.height,
      FOCAL_X,
      FOCAL_Y,
      CROP_BOTTOM,
      isPortrait,
      topColor,
      bottomColor,
    );
  }, [seqInfo]);

  // Animation loop
  const tick = useCallback(() => {
    const target = targetIndexRef.current;
    const displayed = displayedIndexRef.current;
    const diff = target - displayed;

    if (Math.abs(diff) < 0.01) {
      displayedIndexRef.current = target;
      drawCurrentFrame();
      rafRef.current = null;
      return;
    }

    const lerp = reducedMotion ? 1 : FRAME_LERP;
    displayedIndexRef.current = displayed + diff * lerp;
    drawCurrentFrame();
    rafRef.current = requestAnimationFrame(tick);
  }, [drawCurrentFrame, reducedMotion]);

  const startTick = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    if (!seqInfo) return;

    const engine = new FrameEngine(seqInfo);
    engineRef.current = engine;
    onEngineReady?.(engine);

    // Size canvas
    resizeCanvas();

    // Load frame 0 immediately
    engine.requestWindow(0, 1);

    // ScrollTrigger
    const container = containerRef.current;
    if (!container) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: false,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;
        const newIdx = Math.round(p * (seqInfo.count - 1));
        const prevIdx = Math.round(targetIndexRef.current);
        directionRef.current = newIdx >= prevIdx ? 1 : -1;
        targetIndexRef.current = newIdx;
        onProgress?.(p);
        engine.requestWindow(newIdx, directionRef.current);
        startTick();
      },
    });

    // Resize + orientation
    const handleResize = () => { resizeCanvas(); };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      st.kill();
      engine.destroy();
      engineRef.current = null;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [seqInfo, onProgress, onEngineReady, resizeCanvas, startTick]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="seq-section"
      style={{ height: `${scrollVh}dvh` }}
    >
      {/* Sticky canvas wrapper — behind content */}
      <div className="seq-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="seq-canvas"
          aria-hidden="true"
        />
        {fadeOutBottom && <div className="seq-fade-bottom" />}
      </div>

      {/* Content scrolls normally above */}
      <div className="seq-content">
        {children}
      </div>
    </div>
  );
}
