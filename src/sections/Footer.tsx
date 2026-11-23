/**
 * Footer.tsx — static last-frame of vid2 blurred, with glass panel
 */
import { useRef, useState } from 'react';
import { BRAND, FOOTER } from '../content';
import { scrollTo } from '../lib/smoothScroll';
import './Footer.css';

export default function Footer() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleTop = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo(0 as unknown as HTMLElement);
  };

  return (
    <footer id="footer" className="footer" aria-label="Site footer">
      {/* Background: last webp frame blurred */}
      <div
        className="footer__bg"
        style={{ backgroundImage: 'url(/frames/seq2/0042.webp)' }}
        aria-hidden="true"
      >
        <div className="footer__overlay" />
      </div>

      {/* Glass panel */}
      <div className="footer__inner">
        <div className="glass glass--dark footer__panel">
          {/* Wordmark */}
          <div className="footer__wordmark-row">
            <span className="footer__big-wordmark serif">{BRAND.name}</span>
            <button
              className="glass-btn glass-btn--ghost footer__top-btn"
              onClick={handleTop}
              aria-label="Back to top"
            >
              ↑ Top
            </button>
          </div>

          {/* Newsletter */}
          <div className="footer__newsletter">
            <p className="footer__newsletter-label">{FOOTER.newsletter.label}</p>
            {submitted ? (
              <p className="footer__newsletter-thanks">Thanks for subscribing!</p>
            ) : (
              <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  placeholder={FOOTER.newsletter.placeholder}
                  className="footer__newsletter-input glass"
                  aria-label="Email address"
                />
                <button type="submit" className="glass-btn glass-btn--primary">
                  {FOOTER.newsletter.cta}
                </button>
              </form>
            )}
          </div>

          {/* Link columns + store hours */}
          <div className="footer__columns">
            {FOOTER.columns.map((col) => (
              <div key={col.heading} className="footer__col">
                <h4 className="footer__col-heading">{col.heading}</h4>
                <ul className="footer__col-links">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="footer__link">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="footer__col">
              <h4 className="footer__col-heading">Hours</h4>
              <p className="footer__hours">{FOOTER.storeHours}</p>

              {/* Social icons */}
              <div className="footer__socials" aria-label="Social media">
                <a href="#" className="footer__social-link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                <a href="#" className="footer__social-link" aria-label="Twitter / X">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                  </svg>
                </a>
                <a href="#" className="footer__social-link" aria-label="TikTok">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="footer__copyright">{FOOTER.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
