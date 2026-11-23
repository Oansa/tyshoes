/**
 * Standard.tsx — "The TY Standard" section with marquee, text reveal, stat cards
 */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassCard from '../components/GlassCard';
import { STANDARD } from '../content';
import './Standard.css';

gsap.registerPlugin(ScrollTrigger);

function splitLines(text: string): string[] {
  return text.split(' ').reduce<string[][]>((lines, word) => {
    const last = lines[lines.length - 1];
    if (!last || last.join(' ').length + word.length > 30) {
      lines.push([word]);
    } else {
      last.push(word);
    }
    return lines;
  }, []).map((l) => l.join(' '));
}

export default function Standard() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLSpanElement[]>([]);
  const statsRef = useRef<HTMLDivElement[]>([]);
  const velRef = useRef(0);
  const marqueeTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    // Marquee base animation
    const marqueeEl = marqueeRef.current;
    if (marqueeEl) {
      marqueeTween.current = gsap.to(marqueeEl, {
        x: '-50%',
        duration: 20,
        ease: 'none',
        repeat: -1,
      });

      // Scroll velocity modulation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          velRef.current = self.getVelocity() / 1000;
          const speed = 1 + Math.abs(velRef.current) * 0.5;
          marqueeTween.current?.timeScale(speed * (velRef.current < 0 ? -1 : 1));
        },
      });
    }

    // Line-by-line text reveal
    linesRef.current.forEach((line, i) => {
      if (!line) return;
      gsap.fromTo(
        line,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    // Stat cards stagger + count-up
    statsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.15,
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
      marqueeTween.current?.kill();
      ScrollTrigger.getAll().forEach((st) => {
        const el = st.vars.trigger as HTMLElement;
        if (el?.closest?.('#standard')) st.kill();
      });
    };
  }, []);

  const headlineLines = splitLines(STANDARD.headline);

  return (
    <section ref={sectionRef} id={STANDARD.id} className="standard">
      {/* Animated gradient mesh background */}
      <div className="standard__mesh" aria-hidden="true">
        <div className="standard__orb standard__orb--ember" />
        <div className="standard__orb standard__orb--amber" />
        <div className="standard__grain" />
      </div>

      <div className="standard__inner">
        {/* Marquee */}
        <div className="standard__marquee-track" aria-hidden="true">
          <div ref={marqueeRef} className="standard__marquee">
            {[...STANDARD.marqueeItems, ...STANDARD.marqueeItems].map((item, i) => (
              <span key={i} className="standard__marquee-item serif">
                {item} <em>/</em>&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="standard__content">
          <p className="eyebrow">{STANDARD.eyebrow}</p>

          <h2 className="standard__headline serif">
            {headlineLines.map((line, i) => (
              <span
                key={i}
                className="standard__headline-line"
                ref={(el) => { if (el) linesRef.current[i] = el; }}
              >
                {line}
              </span>
            ))}
          </h2>

          <p className="standard__body">{STANDARD.body}</p>
        </div>

        {/* Stat cards */}
        <div className="standard__stats">
          {STANDARD.stats.map((stat, i) => (
            <div
              key={stat.label}
              ref={(el) => { if (el) statsRef.current[i] = el; }}
            >
              <GlassCard className="stat-card">
                <p className="stat-card__value serif">
                  {stat.value}{stat.suffix}
                </p>
                <p className="stat-card__label">{stat.label}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
