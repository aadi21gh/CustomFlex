import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = React.forwardRef(({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  required,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-dark-300 mb-1.5">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`
            input-field
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500/60 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {helpText && !error && (
        <p className="text-xs text-dark-500 mt-1.5">{helpText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ label, error, helpText, className = '', id, required, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-dark-300 mb-1.5">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        className={`input-field resize-none ${error ? 'border-red-500/60' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
      {helpText && !error && <p className="text-xs text-dark-500 mt-1.5">{helpText}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';

export default Input;
