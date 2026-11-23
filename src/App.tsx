/**
 * App.tsx — root component, wires up Lenis, manifest load, sections
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll, destroySmoothScroll } from './lib/smoothScroll';
import { LOADER_THRESHOLD, SEQ2_PRELOAD_TRIGGER } from './config';
import type { FrameManifest, SeqInfo, FrameEngine } from './lib/frameEngine';
import Nav from './components/Nav';
import Loader from './components/Loader';
import Hero from './sections/Hero';
import Standard from './sections/Standard';
import Collection from './sections/Collection';
import Footer from './sections/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [manifest, setManifest] = useState<FrameManifest | null>(null);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderDone, setLoaderDone] = useState(false);
  const heroProgress = useRef(0);
  const seq2Engine = useRef<FrameEngine | null>(null);
  const seq2PreloadTriggered = useRef(false);

  // Load manifest
  useEffect(() => {
    fetch('/frames/manifest.json')
      .then((r) => r.json())
      .then((data: FrameManifest) => setManifest(data))
      .catch((err) => {
        console.warn('Manifest not found — frames not prepared yet.', err);
        // Allow the site to function without frames (shows dark canvas)
        setLoaderDone(true);
      });
  }, []);

  // Init smooth scroll + GSAP
  useEffect(() => {
    const lenis = initSmoothScroll();
    ScrollTrigger.refresh();

    return () => {
      destroySmoothScroll();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      lenis?.destroy?.();
    };
  }, []);

  // Track hero progress for seq2 preload
  const handleHeroProgress = useCallback((p: number) => {
    heroProgress.current = p;
    if (p > SEQ2_PRELOAD_TRIGGER && !seq2PreloadTriggered.current && seq2Engine.current) {
      seq2PreloadTriggered.current = true;
      seq2Engine.current.requestWindow(0, 1);
    }
  }, []);

  // Loader progress from hero engine
  const handleHeroEngineReady = useCallback((engine: FrameEngine) => {
    // Poll progress
    const interval = setInterval(() => {
      const p = engine.getLoadedCount() / engine.getTotalCount();
      setLoaderProgress(p);
      if (p >= LOADER_THRESHOLD) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleCollectionEngineReady = useCallback((engine: FrameEngine) => {
    seq2Engine.current = engine;
    // Try idle preload if hero already past threshold
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
        engine.requestWindow(0, 1);
      });
    }
  }, []);

  const seq1: SeqInfo | null = manifest?.seq1 ?? null;
  const seq2: SeqInfo | null = manifest?.seq2 ?? null;

  return (
    <>
      {!loaderDone && (
        <Loader
          progress={loaderProgress}
          threshold={LOADER_THRESHOLD}
          onDismiss={() => setLoaderDone(true)}
        />
      )}

      <Nav />

      <main>
        <Hero
          seqInfo={seq1}
          onProgress={handleHeroProgress}
          onEngineReady={handleHeroEngineReady}
        />

        <Standard />

        <Collection
          seqInfo={seq2}
          onEngineReady={handleCollectionEngineReady}
        />
      </main>

      <Footer />
    </>
  );
}
