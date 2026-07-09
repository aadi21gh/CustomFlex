import React from 'react';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({
  children,
  className = '',
  variant = 'default',
  hover = false,
  animate = false,
  onClick,
  ...props
}, ref) => {
  const variants = {
    default: 'glass-card',
    strong: 'glass-card-strong',
    flat: 'bg-dark-900/60 border border-dark-800 rounded-2xl',
    gradient: 'gradient-border glass-card',
  };

  const baseClass = `${variants[variant] || variants.default} ${hover ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer' : ''} ${className}`;

  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={baseClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div ref={ref} className={baseClass} onClick={onClick} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-glass-border ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-glass-border ${className}`}>{children}</div>
);

export default Card;
