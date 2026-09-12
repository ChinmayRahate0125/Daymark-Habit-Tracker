import React from 'react';

/**
 * Daymark Brand Mark
 *
 * A geometric D mark: vertical spine + semicircular arc + a single
 * horizontal tick at the apex (3 o'clock). The tick is "the mark" in
 * Daymark — precise, architectural, quietly meaningful.
 *
 * Stroke-based, purely geometric. Color is driven by --brand-mark-fg
 * so it adapts cleanly to dark/light theme without touching UI accents.
 */
export function BrandMark({ size = 'md', className = '' }) {
  const sizeMap = {
    xs:  14,
    sm:  18,
    md:  22,
    lg:  32,
    xl:  44,
    '2xl': 56,
  };
  const d = sizeMap[size] ?? (typeof size === 'number' ? size : 22);

  return (
    <svg
      width={d}
      height={d}
      viewBox="0 0 22 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
      aria-label="Daymark"
      role="img"
    >
      {/*
        Vertical spine — left edge of the D.
        From (5, 3) to (5, 23). Length = 20.
      */}
      <line
        x1="5" y1="3"
        x2="5" y2="23"
        stroke="var(--brand-mark-fg)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/*
        Semicircular arc — right bow of the D.
        Chord: (5,3) → (5,23), length = 20, radius = 10.
        A perfect semicircle; rightmost point is at (15, 13).
      */}
      <path
        d="M 5 3 A 10 10 0 0 1 5 23"
        stroke="var(--brand-mark-fg)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/*
        The Daymark tick — a single horizontal mark at the apex of the arc.
        Starts at the rightmost point (15, 13) and extends outward.
        This is what makes the mark ownable: the literal "mark" in Daymark.
      */}
      <line
        x1="15" y1="13"
        x2="19.5" y2="13"
        stroke="var(--brand-mark-fg)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Daymark Wordmark
 * "Daymark" in Outfit Semibold, tightly tracked.
 * Color follows --brand-wordmark, never the UI accent.
 */
export function BrandWordmark({ className = '', size = 'md' }) {
  const sizeMap = {
    sm:  'text-[13px]',
    md:  'text-[14.5px]',
    lg:  'text-[18px]',
    xl:  'text-[22px]',
  };
  const sz = sizeMap[size] ?? 'text-[14.5px]';

  return (
    <span
      className={`font-brand font-semibold tracking-[-0.035em] leading-none select-none ${sz} ${className}`}
      style={{ color: 'var(--brand-wordmark)' }}
    >
      Daymark
    </span>
  );
}

/**
 * Full Daymark Brand Lockup
 * Mark + wordmark, horizontally aligned.
 */
export default function BrandLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  wordmarkClassName = '',
}) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <BrandMark size={size} />
      {showWordmark && <BrandWordmark size={size} className={wordmarkClassName} />}
    </div>
  );
}
