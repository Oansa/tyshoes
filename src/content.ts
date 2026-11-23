// ─────────────────────────────────────────────
// Content — all copy lives here, easy to edit
// ─────────────────────────────────────────────

export const BRAND = {
  name: 'TY SHOES',
  tagline: 'Performance Footwear',
  wordmark: 'TY',
};

export const NAV = {
  links: [
    { label: 'Collection', href: '#collection' },
    { label: 'The Standard', href: '#standard' },
    { label: 'Visit', href: '#footer' },
  ],
  cta: { label: 'Visit the store', href: '#footer' },
};

export const HERO = {
  eyebrow: 'TY Shoes — Performance Footwear',
  headline: 'Built for the terrain.\nMade for you.',
  supporting: 'Every trail. Every surface. Every stride.',
  cta1: { label: 'Explore the collection', href: '#collection' },
  cta2: { label: 'Visit the store', href: '#footer' },
  cards: [
    {
      id: 'grip',
      headline: 'Grip that bites.',
      body: 'Lugs engineered for volcanic rock, gravel and wet roots.',
      align: 'left' as const,
    },
    {
      id: 'lighter',
      headline: 'Lighter by design.',
      body: 'The knit upper and TPU plate cut weight without cutting support.',
      align: 'right' as const,
    },
    {
      id: 'tested',
      headline: 'Tested on rough ground.',
      body: 'From sea-level pavement to high-altitude switchbacks.',
      align: 'left' as const,
    },
  ],
};

export const STANDARD = {
  id: 'standard',
  eyebrow: 'Why TY',
  headline: 'The TY Standard',
  body: 'We build for real runners on real terrain. No compromises on fit, feel or durability — just shoes that perform when it matters.',
  marqueeItems: ['TRAIL', 'ROAD', 'TRACK', 'EVERYDAY'],
  stats: [
    { value: 'TODO', label: 'km tested', suffix: '+' },
    { value: 'TODO', label: 'terrains covered', suffix: '' },
    { value: 'TODO', label: 'athlete partners', suffix: '' },
  ],
};

export const COLLECTION = {
  id: 'collection',
  eyebrow: 'The Collection',
  headline: 'Find the pair that\nmoves like you.',
  intro: 'Every pair shown here is available in store. Come try them on.',
  cards: [
    {
      id: 'engineered',
      trigger: 0.1, // scroll progress within collection
      headline: 'Engineered layer by layer.',
      features: ['React foam midsole', 'Carbon-fibre plate', 'Adaptive knit upper'],
      chip: 'In store now',
      cta: 'Reserve a pair',
      accent: 'ember' as const,
    },
    {
      id: 'volt',
      trigger: 0.45,
      headline: 'Volt Series.',
      features: ['Volt-green colorway', 'High-visibility upper', 'Responsive ride'],
      chip: 'In store now',
      cta: 'Reserve a pair',
      accent: 'volt' as const,
    },
    {
      id: 'blaze',
      trigger: 0.78,
      headline: 'Blaze Series.',
      features: ['Ember-orange colorway', 'Trail-ready outsole', 'Locked-in fit'],
      chip: 'In store now',
      cta: 'Reserve a pair',
      accent: 'ember' as const,
    },
  ],
  storePanel: {
    headline: 'Available in store',
    address: 'TODO — 123 Example Street, City, Country', // TODO
    hours: 'TODO — Mon–Sat 10:00–19:00, Sun 11:00–17:00', // TODO
    directionsCta: 'Get directions',
    directionsHref: '#', // TODO
    phone: 'TODO — +1 (000) 000-0000', // TODO
    phoneCta: 'Call us',
  },
};

export const FOOTER = {
  newsletter: {
    label: 'Stay in the loop',
    placeholder: 'Your email address',
    cta: 'Subscribe',
  },
  columns: [
    {
      heading: 'Shop',
      links: [
        { label: 'All footwear', href: '#collection' },
        { label: 'Volt Series', href: '#collection' },
        { label: 'Blaze Series', href: '#collection' },
        { label: 'TODO — New arrivals', href: '#' }, // TODO
      ],
    },
    {
      heading: 'Visit',
      links: [
        { label: 'Store location', href: '#footer' },
        { label: 'Opening hours', href: '#footer' },
        { label: 'Get directions', href: '#' }, // TODO
      ],
    },
    {
      heading: 'Support',
      links: [
        { label: 'TODO — Sizing guide', href: '#' }, // TODO
        { label: 'TODO — Returns', href: '#' }, // TODO
        { label: 'TODO — Contact', href: '#' }, // TODO
      ],
    },
  ],
  storeHours: 'TODO — Mon–Sat 10:00–19:00', // TODO
  copyright: `© ${new Date().getFullYear()} TY Shoes. All rights reserved.`,
};
