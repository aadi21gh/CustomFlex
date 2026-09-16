import React from 'react';
import { Link } from 'react-router-dom';

/**
 * TokyoMakerStamp — The Iconic Crexza Tokyo Maker Stamp
 * Circular double-ringed terracotta medallion with smiling 'C' face
 * and dual diamond-sparkle eyes.
 */
export const TokyoMakerStamp = ({ className = 'w-9 h-9', light = false }) => {
  const stampColor = light ? '#FAF7F0' : '#C75932';
  const innerBg = light ? '#241C18' : '#FAF7F0';
  const detailColor = light ? '#FAF7F0' : '#C75932';

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
    >
      {/* Outer Solid Terracotta Stamp Medallion */}
      <circle cx="50" cy="50" r="48" fill={stampColor} />

      {/* Inner Concentric Ring Accent */}
      <circle cx="50" cy="50" r="43" stroke={innerBg} strokeWidth="2.5" />

      {/* Stylized 'C' Inner Mask */}
      <path
        d="M 50 18 C 32 18 18 32 18 50 C 18 68 32 82 50 82 C 67 82 80 69 82 53 C 74 58 64 61 54 61 C 36 61 28 48 28 39 C 28 32 34 26 43 26 C 53 26 62 31 68 38 L 76 31 C 69 23 60 18 50 18 Z"
        fill={innerBg}
        opacity="0.15"
      />

      {/* Center Face Canvas */}
      <circle cx="50" cy="50" r="35" fill={innerBg} />

      {/* Stylized 'C' Arc Terminal at the Top Right */}
      <path
        d="M 45 23 C 58 23 70 30 75 41 C 77 45 74 49 69 48 C 65 47 62 44 60 41 C 56 34 49 30 42 31 C 39 31.5 37 34 38 37 C 39 39 42 40 45 40 L 45 36"
        stroke={detailColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Left Diamond-Sparkle Eye */}
      <path
        d="M 41 33 C 41.5 38 43 40 48 40.5 C 43 41 41.5 43 41 48 C 40.5 43 39 41 34 40.5 C 39 40 40.5 38 41 33 Z"
        fill={detailColor}
      />

      {/* Right Diamond-Sparkle Eye */}
      <path
        d="M 59 33 C 59.5 38 61 40 66 40.5 C 61 41 59.5 43 59 48 C 58.5 43 57 41 52 40.5 C 57 40 58.5 38 59 33 Z"
        fill={detailColor}
      />

      {/* Warm Smile Curve with Flared Dimples */}
      <path
        d="M 33 50 C 33 66 67 66 67 50"
        stroke={detailColor}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Left Dimple */}
      <path
        d="M 31 48 C 30.5 53 35 52 35 52"
        stroke={detailColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Right Dimple */}
      <path
        d="M 69 48 C 69.5 53 65 52 65 52"
        stroke={detailColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * CShapeSmileIcon / CrescentEmblem aliases for backwards compatibility
 */
export const CShapeSmileIcon = (props) => <TokyoMakerStamp {...props} />;
export const CrescentEmblem = (props) => <TokyoMakerStamp {...props} />;

/**
 * SmileyMark — The Tokyo Maker Stamp Badge
 */
export const SmileyMark = ({ size = 'md', variant = 'terracotta', className = '' }) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', svg: 'w-full h-full' },
    md: { box: 'w-10 h-10', svg: 'w-full h-full' },
    lg: { box: 'w-12 h-12', svg: 'w-full h-full' },
    xl: { box: 'w-16 h-16', svg: 'w-full h-full' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative group/logo inline-flex items-center justify-center select-none ${className}`}>
      <div
        className={`${current.box} flex items-center justify-center transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:rotate-3 active:scale-95`}
        title="CREXZA"
      >
        <TokyoMakerStamp className={current.svg} light={variant === 'dark'} />
      </div>
    </div>
  );
};

/**
 * BrandLogo — The Official Tokyo Maker Stamp & CREXZA Wordmark
 * Displays ONLY the circular stamp emblem and the bold collegiate 'CREXZA' wordmark.
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
      {/* 1. Tokyo Maker Stamp Emblem */}
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
