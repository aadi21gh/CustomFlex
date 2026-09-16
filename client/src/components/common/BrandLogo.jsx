import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CrescentEmblem — Refined Crexza Crescent Icon Mark
 * High-definition architectural crescent 'C' with precision twin terracotta dots
 * and a 4-point diamond star sparkle.
 */
export const CrescentEmblem = ({ className = 'w-6 h-6', light = false }) => {
  const moonColor = light ? '#FAF7F0' : '#FFFFFF';
  const dotColor = light ? '#FF8C6B' : '#FAF7F0';

  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
    >
      {/* Precision Crescent Moon C */}
      <path
        d="M 33 6.5 C 28.5 2.8 21.5 1.5 14.5 4 C 6 7 0 15 0 24.5 C 0 34.5 8 42.5 18 42.5 C 26 42.5 32.5 37.5 35.5 30.5 C 30.5 33.5 24 34.2 18 32.2 C 11.2 29.8 6.5 23.5 6.5 16.5 C 6.5 12.2 8.5 8.5 12 6 C 18.5 5.5 26.5 7.5 33 6.5 Z"
        fill={moonColor}
      />
      {/* Twin Brand Dots */}
      <circle cx="24" cy="16.5" r="3.2" fill={dotColor} />
      <circle cx="24" cy="29.5" r="3.2" fill={dotColor} />
      {/* 4-Point Sparkle Star on Top Apex */}
      <path
        d="M 35 1 C 35.6 4.5 37.5 6.4 41 7 C 37.5 7.6 35.6 9.5 35 13 C 34.4 9.5 32.5 7.6 29 7 C 32.5 6.4 34.4 4.5 35 1 Z"
        fill={dotColor}
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
 * SmileyMark — Refined Luxury Brand Emblem Badge
 */
export const SmileyMark = ({ size = 'md', variant = 'terracotta', className = '' }) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7 rounded-lg', svg: 'w-4 h-4' },
    md: { box: 'w-9 h-9 rounded-xl', svg: 'w-5.5 h-5.5' },
    lg: { box: 'w-11 h-11 rounded-2xl', svg: 'w-7 h-7' },
    xl: { box: 'w-14 h-14 rounded-2xl', svg: 'w-9 h-9' },
  };

  const current = sizeMap[size] || sizeMap.md;

  const variantStyles = {
    terracotta: 'bg-gradient-to-br from-[#D97753] to-[#B85735] text-white shadow-md shadow-[#C76D4A]/25 border border-[#E88C6B]/40',
    dark: 'bg-[#241C18] text-[#FAF7F0] shadow-md shadow-black/20 border border-[#3E2E22]',
    light: 'bg-[#FAF7F0] text-[#32251D] shadow-sm shadow-black/5 border border-stone-200/80',
  };

  const activeStyle = variantStyles[variant] || variantStyles.terracotta;

  return (
    <div className={`relative group/logo inline-flex items-center justify-center select-none ${className}`}>
      <div
        className={`${current.box} ${activeStyle} flex items-center justify-center transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:shadow-lg active:scale-95`}
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
 * BrandLogo — Razor-Sharp, Luxury Crexza Brand Identity
 * Displays the iconic Crescent Emblem Badge alongside the full, perfectly kerned "Crexza" wordmark.
 */
export const BrandLogo = ({
  size = 'md',
  showText = true,
  to = '/',
  className = '',
  light = false,
}) => {
  const sizes = {
    sm: { text: 'text-lg', star: 'w-3 h-3', gap: 'gap-2' },
    md: { text: 'text-xl tracking-tight', star: 'w-3.5 h-3.5', gap: 'gap-2.5' },
    lg: { text: 'text-2xl tracking-tight', star: 'w-4 h-4', gap: 'gap-3' },
    xl: { text: 'text-3xl tracking-tight', star: 'w-5 h-5', gap: 'gap-3.5' },
  };

  const current = sizes[size] || sizes.md;
  const textColor = light ? 'text-[#FAF7F0]' : 'text-[#2C241E]';
  const accentColor = light ? 'text-[#FF8C6B]' : 'text-[#C76D4A]';

  const content = (
    <div className={`inline-flex items-center ${current.gap} group/brand select-none cursor-pointer ${className}`}>
      {/* 1. Luxury Crescent Emblem Badge */}
      <SmileyMark size={size} variant={light ? 'dark' : 'terracotta'} />

      {/* 2. Full Crisp Typographic Wordmark "Crexza" */}
      {showText && (
        <div className="flex items-center font-extrabold leading-none select-none">
          <span className={`${current.text} ${textColor} font-black transition-colors duration-200 group-hover/brand:text-black`}>
            Crex
          </span>
          <span className={`${current.text} ${accentColor} font-black ml-0.5 relative inline-flex items-center transition-colors duration-200`}>
            za
            {/* Signature 4-Point Star Sparkle on the 'a' */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`${current.star} ml-0.5 -mt-2.5 opacity-90 transition-transform duration-300 group-hover/brand:rotate-45 group-hover/brand:scale-125`}
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
