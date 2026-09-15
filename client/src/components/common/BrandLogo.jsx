import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CShapeSmileIcon — Geometric Crexza monogram
 * An architecturally balanced 'C' curve paired with precision twin dots '(:'.
 */
export const CShapeSmileIcon = ({ className = 'w-full h-full text-white' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Architectural C curve */}
    <path
      d="M 17 7.5 C 10.2 7.5 6.5 11.6 6.5 16 C 6.5 20.4 10.2 24.5 17 24.5"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Precision twin eye dots */}
    <circle cx="23.5" cy="11.2" r="2.1" fill="currentColor" />
    <circle cx="23.5" cy="20.8" r="2.1" fill="currentColor" />
  </svg>
);

/**
 * SmileyMark — Refined Luxury Brand Mark for Crexza
 * Solid, crisp, and timeless (no muddy gradients).
 */
export const SmileyMark = ({ size = 'md', variant = 'terracotta', className = '' }) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7 rounded-lg', svg: 'w-4 h-4' },
    md: { box: 'w-8.5 h-8.5 rounded-xl', svg: 'w-5 h-5' },
    lg: { box: 'w-10 h-10 rounded-xl', svg: 'w-6 h-6' },
    xl: { box: 'w-12 h-12 rounded-2xl', svg: 'w-7.5 h-7.5' },
  };

  const current = sizeMap[size] || sizeMap.md;

  const variantStyles = {
    terracotta: 'bg-[#C76D4A] text-white shadow-sm shadow-[#C76D4A]/25 border border-[#B55938]/30 group-hover/logo:bg-[#B55938]',
    dark: 'bg-[#2C241E] text-[#F7F3EB] shadow-sm shadow-black/20 border border-[#3E2E22] group-hover/logo:bg-[#1E1713]',
    light: 'bg-white text-[#C76D4A] shadow-sm shadow-black/5 border border-dark-800 group-hover/logo:border-[#C76D4A]/30',
  };

  const activeStyle = variantStyles[variant] || variantStyles.terracotta;

  return (
    <div className="relative group/logo inline-flex items-center justify-center select-none">
      {/* Main Luxury Emblem Badge - Solid, bold and clean */}
      <div
        className={`${current.box} ${activeStyle} relative z-10 flex items-center justify-center transition-all duration-200 group-hover/logo:scale-[1.04] active:scale-95 ${className}`}
        title="Crexza (:"
      >
        <div className={`${current.svg} flex items-center justify-center`}>
          <CShapeSmileIcon className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export const BrandLogo = ({ size = 'md', showText = true, to = '/', className = '' }) => {
  const textSizeMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const content = (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      <SmileyMark size={size} />
      {showText && (
        <div className="flex items-baseline tracking-tight select-none">
          <span className={`${textSizeMap[size] || 'text-lg'} font-extrabold text-[#2C241E] group-hover:text-black transition-colors`}>
            Crex
          </span>
          <span
            className={`${textSizeMap[size] || 'text-lg'} font-black text-[#C76D4A] ml-0.5 transition-colors`}
          >
            za
          </span>
        </div>
      )}
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
