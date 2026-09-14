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
    <img
      src="/logooooo.png"
      alt="Daymark"
      width={d}
      height={d}
      className={`flex-shrink-0 rounded-md object-contain select-none ${className}`}
      style={{ width: `${d}px`, height: `${d}px` }}
    />
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
