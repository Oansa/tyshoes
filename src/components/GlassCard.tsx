/**
 * GlassCard.tsx — reusable glass card with optional title, body, chip, cta
 */
import { ReactNode } from 'react';
import './GlassCard.css';

interface Props {
  headline?: string;
  body?: string;
  chip?: string;
  chipVariant?: 'ember' | 'volt';
  cta?: string;
  ctaHref?: string;
  features?: string[];
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}

export default function GlassCard({
  headline,
  body,
  chip,
  chipVariant = 'ember',
  cta,
  ctaHref = '#',
  features,
  className = '',
  children,
  style,
}: Props) {
  return (
    <div className={`glass-card glass ${className}`} style={style}>
      {chip && (
        <span className={`chip ${chipVariant === 'volt' ? 'chip--volt' : ''}`}>
          {chip}
        </span>
      )}
      {headline && (
        <h3 className="glass-card__headline serif">{headline}</h3>
      )}
      {body && (
        <p className="glass-card__body">{body}</p>
      )}
      {features && features.length > 0 && (
        <ul className="glass-card__features">
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
      {children}
      {cta && (
        <a href={ctaHref} className="glass-btn glass-btn--ghost glass-card__cta">
          {cta}
        </a>
      )}
    </div>
  );
}
