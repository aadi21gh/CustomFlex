/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: '#5B4636', // Map white to Walnut Brown to adapt text-white and bg-white overlays automatically
        brand: {
          50: '#FDFBF7',
          100: '#F8ECE6',
          200: '#F1D6CB',
          300: '#E7B8A4',
          400: '#D89377',
          500: '#C76D4A', // Terracotta primary accent
          600: '#B55938',
          700: '#9C482A',
          800: '#813A21',
          900: '#672E1B',
          950: '#4B2113',
        },
        purple: {
          400: '#B2C0A5',
          500: '#8A9A7B', // Sage Green secondary accent
          600: '#708061',
          700: '#57664B',
        },
        dark: {
          50: '#3E2E22',
          100: '#5B4636', // Walnut Brown (main dark text)
          200: '#5F4F40',
          300: '#6E5F50',
          400: '#7A6C5C',
          500: '#8C7D6B',
          600: '#AFA38E',
          700: '#C9BFAC',
          800: '#DFD8C9', // Card / border highlights
          850: '#E7E1D4',
          900: '#EFEAE0', // Warm cream container / background shades
          950: '#F7F3EB', // Main body background Cream
        },
        glass: {
          white: 'rgba(91, 70, 54, 0.05)',
          'white-10': 'rgba(91, 70, 54, 0.10)',
          'white-20': 'rgba(91, 70, 54, 0.20)',
          border: 'rgba(91, 70, 54, 0.08)',
          'border-strong': 'rgba(91, 70, 54, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.65rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #C76D4A, #8A9A7B, #5B4636)',
        'dark-gradient': 'linear-gradient(180deg, #F7F3EB 0%, #EFEAE0 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(199, 109, 74, 0.15) 0%, transparent 70%)',
        'glow-gradient': 'radial-gradient(ellipse at center, rgba(199, 109, 74, 0.4), transparent 70%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(199, 109, 74, 0.3)',
        'glow': '0 0 20px rgba(199, 109, 74, 0.4)',
        'glow-lg': '0 0 40px rgba(199, 109, 74, 0.5)',
        'glow-purple': '0 0 20px rgba(138, 154, 123, 0.4)',
        'glass': '0 8px 32px rgba(91, 70, 54, 0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-lg': '0 16px 48px rgba(91, 70, 54, 0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
        'card': '0 4px 24px rgba(91, 70, 54, 0.08)',
        'card-hover': '0 8px 40px rgba(91, 70, 54, 0.12), 0 0 0 1px rgba(199, 109, 74, 0.3)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'gradient-rotate': 'gradientRotate 8s linear infinite',
        'slide-up': 'slideUp 0.5s ease forwards',
        'slide-down': 'slideDown 0.3s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gradientRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
