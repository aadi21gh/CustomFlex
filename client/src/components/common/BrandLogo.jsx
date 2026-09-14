import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CShapeSmileIcon — Professional geometric Crexza monogram
 * Features an architecturally precise 'C' curve paired with proportional eye dots ':'.
 */
export const CShapeSmileIcon = ({ className = 'w-full h-full text-white' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Architectural C curve */}
    <path
      d="M 19 8 C 11.2 8 7 12.8 7 18 C 7 23.2 11.2 28 19 28"
      stroke="currentColor"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Precision twin eye dots */}
    <circle cx="26" cy="12.5" r="2.2" fill="currentColor" />
    <circle cx="26" cy="23.5" r="2.2" fill="currentColor" />
  </svg>
);

/**
 * SmileyMark — Professional Luxury Brand Mark for Crexza
 * Minimalist, balanced, and premium.
 */
export const SmileyMark = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7 rounded-lg', svg: 'w-4 h-4' },
    md: { box: 'w-8.5 h-8.5 rounded-xl', svg: 'w-5 h-5' },
    lg: { box: 'w-10 h-10 rounded-xl', svg: 'w-6 h-6' },
    xl: { box: 'w-12 h-12 rounded-2xl', svg: 'w-7.5 h-7.5' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className="relative group/logo inline-flex items-center justify-center select-none">
      {/* Subtle refined ambient border glow on hover */}
      <div
        className="absolute -inset-0.5 rounded-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 blur-xs"
        style={{
          background: 'linear-gradient(135deg, #C76D4A, #8A9A7B)',
          zIndex: 0,
        }}
      />

      {/* Main Luxury Emblem Badge */}
      <div
        className={`${current.box} relative z-10 flex items-center justify-center transition-all duration-200 group-hover/logo:scale-[1.03] ${className}`}
        style={{
          background: 'linear-gradient(145deg, #C76D4A 0%, #B85936 60%, #8A9A7B 100%)',
          boxShadow: '0 2px 8px rgba(199, 109, 74, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        title="Crexza (:"
      >
        <div className={`${current.svg} flex items-center justify-center`}>
          <CShapeSmileIcon className="w-full h-full text-white" />
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
