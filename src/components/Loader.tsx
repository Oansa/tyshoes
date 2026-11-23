/**
 * Loader.tsx — Glass loading screen shown while hero frames load
 */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Loader.css';
import { BRAND } from '../content';

interface Props {
  progress: number; // 0–1
  onDismiss: () => void;
  threshold: number; // dismiss when progress >= threshold
}

export default function Loader({ progress, onDismiss, threshold }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const dismissed = useRef(false);

  useEffect(() => {
    if (progress >= threshold && !dismissed.current) {
      dismissed.current = true;
      gsap.to(ref.current, {
        opacity: 0,
        duration: 0.5,
        delay: 0.2,
        onComplete: onDismiss,
      });
    }
  }, [progress, threshold, onDismiss]);

  const pct = Math.round(Math.min(progress / threshold, 1) * 100);

  return (
    <div ref={ref} className="loader" role="status" aria-live="polite">
      <div className="loader__inner glass glass--dark">
        <span className="loader__wordmark wordmark">{BRAND.name}</span>
        <div className="loader__bar-track">
          <div className="loader__bar" style={{ width: `${pct}%` }} />
        </div>
        <span className="loader__pct">{pct}%</span>
      </div>
    </div>
  );
}
