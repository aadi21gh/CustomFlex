import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CrescentEmblem — Ultra-High Contrast Crexza Crescent Icon Mark
 * High-definition architectural crescent 'C' with precision twin brand dots
 * and a glowing 4-point diamond star sparkle.
 */
export const CrescentEmblem = ({ className = 'w-full h-full', light = false }) => {
  const moonColor = light ? '#FAF7F0' : '#FFFFFF';
  const dotColor = light ? '#FF8C6B' : '#FFFFFF';
  const starColor = light ? '#FF8C6B' : '#FFD9A8';

  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
    >
      {/* Precision Bold Crescent Moon C */}
      <path
        d="M 33 6.5 C 28 2.5 20.5 1.5 13.5 4.2 C 5.5 7.5 0 15.5 0 24.5 C 0 34.5 8 42.5 18 42.5 C 26.5 42.5 33 37.5 36 30 C 31 33.2 24.5 34 18.2 31.8 C 11 29.2 6.2 22.8 6.2 15.5 C 6.2 11.2 8.2 7.2 11.8 5 C 18.5 4.2 26.5 6.5 33 6.5 Z"
        fill={moonColor}
      />
      {/* Precision Twin Brand Dots */}
      <circle cx="23.5" cy="16" r="3.4" fill={dotColor} />
      <circle cx="23.5" cy="29" r="3.4" fill={dotColor} />
      {/* 4-Point Sparkle Star on Top Apex */}
      <path
        d="M 34.5 1 C 35.2 4.8 37.2 6.8 41 7.5 C 37.2 8.2 35.2 10.2 34.5 14 C 33.8 10.2 31.8 8.2 28 7.5 C 31.8 6.8 33.8 4.8 34.5 1 Z"
        fill={starColor}
      />
    </svg>
  );
};

/**
 * CShapeSmileIcon — Backwards compatibility wrapper
 */
export const CShapeSmileIcon = ({ className = 'w-full h-full' }) => (
  <CrescentEmblem className={className} />
);

/**
 * SmileyMark — Bold Luxury Terracotta Brand Emblem Badge
 */
export const SmileyMark = ({ size = 'md', variant = 'terracotta', className = '' }) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-xl', svg: 'w-4.5 h-4.5' },
    md: { box: 'w-10 h-10 rounded-xl', svg: 'w-6 h-6' },
    lg: { box: 'w-11.5 h-11.5 rounded-2xl', svg: 'w-7 h-7' },
    xl: { box: 'w-14 h-14 rounded-2xl', svg: 'w-9 h-9' },
  };

  const current = sizeMap[size] || sizeMap.md;

  const variantStyles = {
    terracotta: 'bg-gradient-to-br from-[#E06B43] via-[#C75932] to-[#A84420] text-white shadow-lg shadow-[#C75932]/30 ring-1 ring-[#FF9E7D]/35 border border-[#B54A25]',
    dark: 'bg-[#241C18] text-[#FAF7F0] shadow-lg shadow-black/30 border border-[#3E2E22]',
    light: 'bg-[#FAF7F0] text-[#32251D] shadow-sm shadow-black/5 border border-stone-300',
  };

  const activeStyle = variantStyles[variant] || variantStyles.terracotta;

  return (
    <div className={`relative group/logo inline-flex items-center justify-center select-none ${className}`}>
      <div
        className={`${current.box} ${activeStyle} flex items-center justify-center transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:shadow-xl active:scale-95`}
        title="Crexza"
      >
        <div className={`${current.svg} flex items-center justify-center`}>
          <CrescentEmblem className="w-full h-full" light={variant === 'dark'} />
        </div>
      </div>
    </div>
  );
};

/**
 * BrandLogo — High-Impact, Crystal-Clear Crexza Brand Identity
 * Displays the bold luxury Crescent Emblem Badge paired with the full, high-contrast "Crexza" wordmark.
 */
export const BrandLogo = ({
  size = 'md',
  showText = true,
  to = '/',
  className = '',
  light = false,
}) => {
  const sizes = {
    sm: { text: 'text-lg', star: 'w-3.5 h-3.5', gap: 'gap-2.5' },
    md: { text: 'text-[22px] tracking-tight', star: 'w-4 h-4', gap: 'gap-3' },
    lg: { text: 'text-[26px] tracking-tight', star: 'w-4.5 h-4.5', gap: 'gap-3.5' },
    xl: { text: 'text-[32px] tracking-tight', star: 'w-5.5 h-5.5', gap: 'gap-4' },
  };

  const current = sizes[size] || sizes.md;
  const textColor = light ? 'text-[#FAF7F0]' : 'text-[#1C130D]';
  const accentColor = light ? 'text-[#FF8C6B]' : 'text-[#C75932]';

  const content = (
    <div className={`inline-flex items-center ${current.gap} group/brand select-none cursor-pointer ${className}`}>
      {/* 1. Bold Luxury Crescent Emblem Badge */}
      <SmileyMark size={size} variant={light ? 'dark' : 'terracotta'} />

      {/* 2. Full High-Contrast Wordmark "Crexza" */}
      {showText && (
        <div className="flex items-center font-black leading-none select-none">
          <span className={`${current.text} ${textColor} font-black transition-colors duration-200 group-hover/brand:text-black`}>
            Crex
          </span>
          <span className={`${current.text} ${accentColor} font-black ml-0.5 relative inline-flex items-center transition-colors duration-200`}>
            za
            {/* Signature 4-Point Star Sparkle on the 'a' */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`${current.star} ml-0.5 -mt-3 opacity-95 transition-transform duration-300 group-hover/brand:rotate-45 group-hover/brand:scale-125`}
            >
              <path d="M12 0 C12.5 6 14 7.5 20 8 C14 8.5 12.5 10 12 16 C11.5 10 10 8.5 4 8 C10 7.5 11.5 6 12 0 Z" />
            </svg>
          </span>
        </div>
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
