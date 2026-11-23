/**
 * Hero.tsx — vid1 frame sequence section with story cards
 */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SequenceSection from '../components/SequenceSection';
import GlassCard from '../components/GlassCard';
import { HERO_SCROLL_VH } from '../config';
import { HERO } from '../content';
import type { SeqInfo } from '../lib/frameEngine';
import type { FrameEngine } from '../lib/frameEngine';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  seqInfo: SeqInfo | null;
  onProgress: (p: number) => void;
  onEngineReady: (e: FrameEngine) => void;
}

export default function Hero({ seqInfo, onProgress, onEngineReady }: Props) {
  const heroContentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero text scrolls out as user scrolls
    if (heroContentRef.current) {
      gsap.to(heroContentRef.current, {
        y: -120,
        opacity: 0,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '12% top',
          scrub: true,
        },
      });
    }

    // Scroll cue pulse
    if (scrollCueRef.current) {
      gsap.to(scrollCueRef.current, {
        opacity: 0,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '5% top',
          scrub: true,
        },
      });
    }

    // Story cards stagger in
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const fromX = HERO.cards[i].align === 'left' ? -60 : 60;
      gsap.fromTo(
        card,
        { x: fromX, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger && (st.vars.trigger as HTMLElement).closest?.('#hero')) {
          st.kill();
        }
      });
    };
  }, [seqInfo]);

  return (
    <SequenceSection
      seqInfo={seqInfo}
      scrollVh={HERO_SCROLL_VH}
      id="hero"
      onProgress={onProgress}
      onEngineReady={onEngineReady}
      fadeOutBottom
    >
      {/* First viewport: headline */}
      <div className="hero-first-vp">
        <div ref={heroContentRef} className="hero-text">
          <p className="eyebrow text-shadow">{HERO.eyebrow}</p>
          <h1 className="hero-headline serif text-shadow">
            {HERO.headline.split('\n').map((line, i) => (
              <span key={i} className="hero-headline__line">
                {line}
                {i < HERO.headline.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="hero-supporting text-shadow">{HERO.supporting}</p>
          <div className="hero-ctas">
            <a href={HERO.cta1.href} className="glass-btn glass-btn--primary">
              {HERO.cta1.label}
            </a>
            <a href={HERO.cta2.href} className="glass-btn glass-btn--ghost">
              {HERO.cta2.label}
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div ref={scrollCueRef} className="scroll-cue" aria-hidden="true">
          <div className="scroll-cue__wheel" />
          <span className="scroll-cue__label">Scroll</span>
        </div>
      </div>

      {/* Story cards — staggered */}
      {HERO.cards.map((card, i) => (
        <div
          key={card.id}
          className={`hero-card-slot hero-card-slot--${card.align}`}
          ref={(el) => { if (el) cardsRef.current[i] = el; }}
        >
          <GlassCard
            headline={card.headline}
            body={card.body}
            className="hero-story-card"
          />
        </div>
      ))}
    </SequenceSection>
  );
}
