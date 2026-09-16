import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CrexzaWordmark — Full bespoke vector logo wordmark
 * Precision crescent 'C' with twin terracotta dots, flowing serif-modern typography,
 * dynamic 'x' accent, and signature 4-point sparkle star.
 */
export const CrexzaWordmark = ({ className = 'h-8 w-auto', light = false }) => {
  const primaryColor = light ? '#FAF7F0' : '#3E2C22';
  const accentColor = light ? '#F08A6E' : '#C76D4A';

  return (
    <svg
      viewBox="0 0 320 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ===== 1. CRESCENT 'C' ===== */}
      <g>
        {/* Main Lunar Crescent Arc */}
        <path
          d="M 52 14 C 44 8 34 5.5 24 7 C 11.5 8.8 2 19 2 32 C 2 46.5 13 58 27.5 58 C 38 58 47 52 51.5 43 C 45.5 47.5 37 49.5 29 47.5 C 18 44.8 10 35.5 10 24.5 C 10 18.5 12.8 13.2 17.5 9.8 C 28.5 8.8 41 11.5 52 14 Z"
          fill={primaryColor}
        />
        {/* Lower Tail Accent */}
        <path
          d="M 12 48 C 16 54 22 57.5 29 58.5 C 23.5 57 18 53.5 12 48 Z"
          fill={primaryColor}
        />
        {/* Precision Twin Brand Dots (Terracotta) */}
        <circle cx="38" cy="24" r="4.2" fill={accentColor} />
        <circle cx="38" cy="42" r="4.2" fill={accentColor} />
      </g>

      {/* ===== 2. LETTER 'r' ===== */}
      <g>
        {/* Vertical Stem with subtle serif foot */}
        <path
          d="M 64 26 L 73 26 L 73 54 L 64 54 Z"
          fill={primaryColor}
        />
        {/* Arching Shoulder */}
        <path
          d="M 72 34 C 74 28 81 25.5 88 26.5 C 89.5 26.8 91 27.5 92 28.5 L 89 34.5 C 87.5 33.5 85.5 33 83.5 33 C 78.5 33 73.5 37.5 73.5 44 L 73.5 54 L 64.5 54 L 64.5 26 L 72.5 26 Z"
          fill={primaryColor}
        />
      </g>

      {/* ===== 3. LETTER 'e' ===== */}
      <g>
        {/* Outer loop and bowl */}
        <path
          d="M 115 39 C 115 29.5 107.5 25.5 98.5 25.5 C 88.5 25.5 80.5 33 80.5 42 C 80.5 51 88 56.5 98 56.5 C 105.5 56.5 111.5 53 114.5 48.5 L 108 44 C 106 46.5 102.5 48.5 98 48.5 C 92.5 48.5 88.8 45 88.5 40.5 L 114.8 40.5 C 114.9 40 115 39.5 115 39 Z M 88.5 35 C 89.2 31.5 93 29.5 97.8 29.5 C 102.5 29.5 106 31.5 106.8 35 L 88.5 35 Z"
          fill={primaryColor}
        />
      </g>

      {/* ===== 4. LETTER 'x' ===== */}
      <g>
        {/* Main sweeping left diagonal with bottom flourish */}
        <path
          d="M 120 26 L 132 26 L 149 46.5 C 156 54.5 166 56.5 174 55.5 C 171 53 167 51 163 47.5 L 144 26 L 132 26 Z"
          fill={primaryColor}
        />
        <path
          d="M 124 26 L 140 45 L 147 54 L 137 54 L 131 46.5 L 118 26 Z"
          fill={primaryColor}
        />
        {/* Terracotta Cross Accent Wing */}
        <path
          d="M 148 33.5 C 153 28.5 159 26 166 26 L 157 36 C 153 37.5 150 35.5 148 33.5 Z"
          fill={accentColor}
        />
        <path
          d="M 140 42 L 130 54 L 121 54 L 134 38.5 Z"
          fill={accentColor}
        />
      </g>

      {/* ===== 5. LETTER 'z' ===== */}
      <g>
        <path
          d="M 170 26 L 198 26 L 198 32 L 179.5 48 L 199 48 L 199 54 L 168 54 L 168 48.5 L 187 32 L 170 32 Z"
          fill={primaryColor}
        />
      </g>

      {/* ===== 6. LETTER 'a' ===== */}
      <g>
        {/* Bowl & Stem */}
        <path
          d="M 228 35 C 228 29 222.5 25.5 214.5 25.5 C 207 25.5 201 29 198.5 33.5 L 204.5 37 C 206.5 34.5 209.5 32.5 213.5 32.5 C 217.5 32.5 220 34.2 220 37.5 L 220 39 C 205.5 39.5 197 43.5 197 50 C 197 54.8 201 56.5 206.5 56.5 C 213 56.5 218 52.8 220 48 L 220.5 54 L 228.5 54 L 228.5 35 Z M 220 44 C 218.5 47.5 214 50 209.5 50 C 206.5 50 204.5 48.5 204.5 46 C 204.5 42.5 209 41 220 40.5 L 220 44 Z"
          fill={primaryColor}
        />
        {/* Stylized flared terminal foot */}
        <path
          d="M 228.5 49 C 230.5 52.5 233.5 54 237 54 L 235 55.5 C 231 55.5 228.5 53 227.5 50 Z"
          fill={primaryColor}
        />
      </g>

      {/* ===== 7. SIGNATURE 4-POINT SPARKLE STAR ===== */}
      <path
        d="M 235 12 C 236 17.5 239.5 21 245 22 C 239.5 23 236 26.5 235 32 C 234 26.5 230.5 23 225 22 C 230.5 21 234 17.5 235 12 Z"
        fill={accentColor}
      />
    </svg>
  );
};

/**
 * CShapeSmileIcon — Refined Crexza Crescent Monogram (Icon only)
 */
export const CShapeSmileIcon = ({ className = 'w-full h-full text-white' }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Architectural Crescent C */}
    <path
      d="M30 8 C25.5 3.5 18 2 11 4.5 C4 7 0 14 0 22 C0 31 7.5 38 16.5 38 C24 38 30 33.5 32.5 26.5 C27.5 29.5 21 30.5 15.5 28.5 C9 26 4.5 20 4.5 13.5 C4.5 9.5 6.5 6 10 4 C17 3.5 24.5 6 30 8 Z"
      fill="currentColor"
    />
    {/* Precision twin brand dots */}
    <circle cx="23" cy="15" r="2.8" fill="#C76D4A" />
    <circle cx="23" cy="27" r="2.8" fill="#C76D4A" />
    {/* 4-point sparkle star on top apex */}
    <path
      d="M32 0 C32.5 3.5 34.5 5.5 38 6 C34.5 6.5 32.5 8.5 32 12 C31.5 8.5 29.5 6.5 26 6 C29.5 5.5 31.5 3.5 32 0 Z"
      fill="#C76D4A"
    />
  </svg>
);

/**
 * SmileyMark — Refined Luxury Brand Mark for Crexza
 */
export const SmileyMark = ({ size = 'md', variant = 'light', className = '' }) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7 rounded-lg', svg: 'w-4.5 h-4.5' },
    md: { box: 'w-9 h-9 rounded-xl', svg: 'w-6 h-6' },
    lg: { box: 'w-11 h-11 rounded-xl', svg: 'w-7.5 h-7.5' },
    xl: { box: 'w-14 h-14 rounded-2xl', svg: 'w-9.5 h-9.5' },
  };

  const current = sizeMap[size] || sizeMap.md;

  const variantStyles = {
    terracotta: 'bg-[#C76D4A] text-white shadow-sm shadow-[#C76D4A]/25 border border-[#B55938]/30 group-hover/logo:bg-[#B55938]',
    dark: 'bg-[#241C18] text-[#FAF7F0] shadow-sm shadow-black/20 border border-[#3E2E22] group-hover/logo:bg-[#1A1410]',
    light: 'bg-[#FAF7F0] text-[#3E2C22] shadow-sm shadow-black/5 border border-stone-200 group-hover/logo:border-[#C76D4A]/30',
  };

  const activeStyle = variantStyles[variant] || variantStyles.light;

  return (
    <div className="relative group/logo inline-flex items-center justify-center select-none">
      <div
        className={`${current.box} ${activeStyle} relative z-10 flex items-center justify-center transition-all duration-200 group-hover/logo:scale-[1.04] active:scale-95 ${className}`}
        title="Crexza"
      >
        <div className={`${current.svg} flex items-center justify-center`}>
          <CShapeSmileIcon className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export const BrandLogo = ({
  size = 'md',
  showText = true,
  to = '/',
  className = '',
  light = false,
  wordmarkOnly = false,
}) => {
  const heightMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12',
  };

  const heightClass = heightMap[size] || 'h-8';

  const content = wordmarkOnly || showText ? (
    <div className={`inline-flex items-center group cursor-pointer transition-transform duration-200 group-hover/logo:scale-[1.02] ${className}`}>
      <CrexzaWordmark className={`${heightClass} w-auto`} light={light} />
    </div>
  ) : (
    <div className={`inline-flex items-center group cursor-pointer ${className}`}>
      <SmileyMark size={size} variant={light ? 'dark' : 'light'} />
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};

export default BrandLogo;
