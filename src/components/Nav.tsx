/**
 * Nav.tsx — floating glass pill nav, hides on scroll down, shows on scroll up
 */
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { SHOW_NAV } from '../config';
import { BRAND, NAV } from '../content';
import { scrollTo } from '../lib/smoothScroll';
import './Nav.css';

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const hidden = useRef(false);

  useEffect(() => {
    if (!SHOW_NAV) return;

    const handleScroll = () => {
      const y = window.scrollY;
      const diff = y - lastY.current;
      lastY.current = y;

      if (diff > 4 && y > 80 && !hidden.current) {
        hidden.current = true;
        gsap.to(navRef.current, { y: -100, duration: 0.35, ease: 'power2.in' });
      } else if (diff < -4 && hidden.current) {
        hidden.current = false;
        gsap.to(navRef.current, { y: 0, duration: 0.4, ease: 'power3.out' });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!SHOW_NAV) return null;

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) scrollTo(target as HTMLElement, -80);
  };

  return (
    <>
      <header ref={navRef} className="nav glass" role="banner">
        <a href="#" className="nav__wordmark wordmark" aria-label={BRAND.name}>
          {BRAND.name}
        </a>

        {/* Desktop links */}
        <nav className="nav__links" aria-label="Main navigation">
          {NAV.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="nav__link"
              onClick={(e) => handleNav(e, l.href)}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href={NAV.cta.href}
          className="glass-btn glass-btn--primary nav__cta"
          onClick={(e) => handleNav(e as unknown as React.MouseEvent<HTMLAnchorElement>, NAV.cta.href)}
        >
          {NAV.cta.label}
        </a>

        {/* Mobile menu toggle */}
        <button
          className="nav__burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="nav-sheet glass glass--dark" role="dialog" aria-modal="true" aria-label="Navigation menu">
          {NAV.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="nav-sheet__link serif"
              onClick={(e) => handleNav(e, l.href)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={NAV.cta.href}
            className="glass-btn glass-btn--primary"
            onClick={(e) => handleNav(e as unknown as React.MouseEvent<HTMLAnchorElement>, NAV.cta.href)}
          >
            {NAV.cta.label}
          </a>
        </div>
      )}
    </>
  );
}
