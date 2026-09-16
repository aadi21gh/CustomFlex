import React from 'react';
import { Link } from 'react-router-dom';

/**
 * TokyoMakerStamp — The Exact Crexza Tokyo Maker Stamp
 * Uses the exact pixel-perfect circular stamp asset.
 */
export const TokyoMakerStamp = ({ className = 'w-9 h-9', light = false }) => {
  return (
    <img
      src="/crexza-logo.png"
      alt="CREXZA"
      className={`${className} shrink-0 object-contain rounded-full select-none pointer-events-none drop-shadow-sm`}
    />
  );
};

/**
 * Backwards compatibility aliases
 */
export const CShapeSmileIcon = (props) => <TokyoMakerStamp {...props} />;
export const CrescentEmblem = (props) => <TokyoMakerStamp {...props} />;

/**
 * SmileyMark — The Exact Stamp Badge
 */
export const SmileyMark = ({ size = 'md', variant = 'terracotta', className = '' }) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8' },
    md: { box: 'w-10 h-10' },
    lg: { box: 'w-12 h-12' },
    xl: { box: 'w-16 h-16' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative group/logo inline-flex items-center justify-center select-none ${className}`}>
      <div
        className={`${current.box} flex items-center justify-center transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:rotate-3 active:scale-95`}
        title="CREXZA"
      >
        <TokyoMakerStamp className="w-full h-full" />
      </div>
    </div>
  );
};

/**
 * BrandLogo — The Official Exact Tokyo Maker Stamp + CREXZA Wordmark
 */
export const BrandLogo = ({
  size = 'md',
  showText = true,
  to = '/',
  className = '',
  light = false,
}) => {
  const sizes = {
    sm: { stamp: 'w-7 h-7', text: 'text-lg', gap: 'gap-2' },
    md: { stamp: 'w-9 h-9', text: 'text-2xl', gap: 'gap-2.5' },
    lg: { stamp: 'w-11 h-11', text: 'text-3xl', gap: 'gap-3' },
    xl: { stamp: 'w-14 h-14', text: 'text-4xl', gap: 'gap-3.5' },
  };

  const current = sizes[size] || sizes.md;
  const textColor = light ? 'text-[#FAF7F0]' : 'text-[#1F1510]';

  const content = (
    <div className={`inline-flex items-center ${current.gap} group/brand select-none cursor-pointer ${className}`}>
      {/* 1. Exact Stamp Emblem */}
      <div className="transition-transform duration-300 ease-out group-hover/brand:scale-105 group-hover/brand:rotate-3">
        <TokyoMakerStamp className={current.stamp} light={light} />
      </div>

      {/* 2. ONLY the bold 'CREXZA' Wordmark */}
      {showText && (
        <span
          className={`${current.text} ${textColor} font-black tracking-[-0.02em] uppercase leading-none transition-colors duration-200 group-hover/brand:text-[#C75932]`}
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900 }}
        >
          CREXZA
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

export default BrandLogo;
