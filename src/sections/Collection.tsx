/**
 * Collection.tsx — vid2 frame sequence with product cards
 */
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SequenceSection from '../components/SequenceSection';
import GlassCard from '../components/GlassCard';
import { COLLECTION_SCROLL_VH } from '../config';
import { COLLECTION } from '../content';
import type { SeqInfo, FrameEngine } from '../lib/frameEngine';
import './Collection.css';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  seqInfo: SeqInfo | null;
  onEngineReady: (e: FrameEngine) => void;
}

export default function Collection({ seqInfo, onEngineReady }: Props) {
  const [accentColor, setAccentColor] = useState('var(--color-ember)');
  const introRef = useRef<HTMLDivElement>(null);
  const storePanelRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!seqInfo) return;

    // Accent color cross-fade based on scroll
    const handleUpdate = (self: ScrollTrigger) => {
      const p = self.progress;
      if (p < 0.3) {
        setAccentColor('var(--color-ember)');
      } else if (p < 0.65) {
        setAccentColor('var(--color-volt)');
      } else {
        setAccentColor('var(--color-ember)');
      }
    };

    const st = ScrollTrigger.create({
      trigger: '#collection',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: handleUpdate,
    });

    // Intro text reveal
    if (introRef.current) {
      gsap.fromTo(
        introRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#collection',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }

    // Product cards
    cardRefs.current.forEach((card) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    // Store panel
    if (storePanelRef.current) {
      gsap.fromTo(
        storePanelRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: storePanelRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }

    return () => {
      st.kill();
      ScrollTrigger.getAll().forEach((t) => {
        const el = t.vars.trigger as HTMLElement;
        if (el?.closest?.('#collection')) t.kill();
      });
    };
  }, [seqInfo]);

  const store = COLLECTION.storePanel;

  return (
    <SequenceSection
      seqInfo={seqInfo}
      scrollVh={COLLECTION_SCROLL_VH}
      id="collection"
      onEngineReady={onEngineReady}
    >
      <style>{`#collection { --accent: ${accentColor}; }`}</style>

      {/* Intro viewport */}
      <div className="collection-intro-vp">
        <div ref={introRef} className="collection-intro">
          <p className="eyebrow">{COLLECTION.eyebrow}</p>
          <h2 className="collection-headline serif text-shadow">
            {COLLECTION.headline.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < COLLECTION.headline.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="collection-intro__sub text-shadow">{COLLECTION.intro}</p>
        </div>
      </div>

      {/* Product cards */}
      {COLLECTION.cards.map((card, i) => (
        <div
          key={card.id}
          className="collection-card-slot"
          ref={(el) => { if (el) cardRefs.current[i] = el; }}
        >
          <GlassCard
            headline={card.headline}
            features={card.features}
            chip={card.chip}
            chipVariant={card.accent === 'volt' ? 'volt' : 'ember'}
            cta={card.cta}
            className="collection-product-card"
          />
        </div>
      ))}

      {/* Store panel */}
      <div className="collection-store-vp">
        <div
          ref={storePanelRef}
          className="glass glass--dark collection-store-panel"
        >
          <h3 className="serif collection-store__headline">{store.headline}</h3>
          <p className="collection-store__info">{store.address}</p>
          <p className="collection-store__info">{store.hours}</p>
          <div className="collection-store__actions">
            <a href={store.directionsHref} className="glass-btn glass-btn--primary">
              {store.directionsCta}
            </a>
            <a href={`tel:${store.phone}`} className="glass-btn glass-btn--ghost">
              {store.phoneCta}
            </a>
          </div>
        </div>
      </div>
    </SequenceSection>
  );
}
