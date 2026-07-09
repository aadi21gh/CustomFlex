import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 'md', className = '', label = 'Loading...' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10', xl: 'w-16 h-16' };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <Loader2 className={`${sizes[size]} animate-spin text-brand-500`} />
      {label && <span className="text-sm text-dark-400 animate-pulse">{label}</span>}
    </div>
  );
};

export const PageSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm z-50">
    <div className="glass-card p-8 flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-dark-700" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
      </div>
      <p className="text-dark-300 font-medium">Loading CustomFlex...</p>
    </div>
  </div>
);

export default Spinner;
