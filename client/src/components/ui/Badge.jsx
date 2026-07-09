import React from 'react';

const variantStyles = {
  default: 'bg-dark-800 text-dark-300 border-dark-700',
  brand: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
  success: 'bg-green-500/15 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const Badge = ({ children, variant = 'default', className = '', dot = false }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}>
    {dot && (
      <span className={`w-1.5 h-1.5 rounded-full ${
        variant === 'success' ? 'bg-green-400' :
        variant === 'warning' ? 'bg-yellow-400' :
        variant === 'danger' ? 'bg-red-400' :
        variant === 'brand' ? 'bg-brand-400' : 'bg-dark-400'
      }`} />
    )}
    {children}
  </span>
);

export default Badge;
