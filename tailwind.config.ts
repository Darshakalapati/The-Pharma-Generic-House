import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        // shadcn / radix tokens (kept for admin)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Public-site palette (matches the logo)
        plum: {
          DEFAULT: '#6B2C5F',
          deep: '#4A1E42',
          soft: '#8C4A80',
          tint: '#F4ECF1',
        },
        teal: {
          DEFAULT: '#2A9B8E',
          deep: '#1F7368',
          soft: '#4DB5A8',
          tint: '#E5F2F0',
        },
        bg: {
          DEFAULT: '#FAF6F0',
          elevated: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#1F1A1F',
          muted: '#6B6470',
          faint: '#9D96A0',
        },
        line: '#EAE2D6',
        sand: '#F0E8DA',

        // Legacy brand-* tokens (kept for admin — DO NOT MODIFY)
        brand: {
          purple: '#6B2C5F',
          'purple-soft': '#8C4A80',
          'purple-deep': '#4C1A44',
          teal: '#2A9B8E',
          'teal-soft': '#4DB5A8',
          'teal-deep': '#1F7A70',
          cream: '#FBF7F2',
          'cream-warm': '#F5EFE5',
          ink: '#1F1A1F',
          muted: '#6B6470',
          line: '#EDE6DC',
        },
        primary: { DEFAULT: '#6B2C5F', foreground: '#FBF7F2' },
        accent: { DEFAULT: '#2A9B8E', foreground: '#FFFFFF' },
        secondary: { DEFAULT: '#F5EFE5', foreground: '#1F1A1F' },
        muted: { DEFAULT: '#F5EFE5', foreground: '#6B6470' },
        destructive: { DEFAULT: '#C4453C', foreground: '#FFFFFF' },
        success: { DEFAULT: '#2A9B8E', foreground: '#FFFFFF' },
        warning: { DEFAULT: '#D4A24C', foreground: '#1F1A1F' },
        card: { DEFAULT: '#FFFFFF', foreground: '#1F1A1F' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#1F1A1F' },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        h1: '-0.025em',
        h2: '-0.02em',
        eyebrow: '0.12em',
      },
      maxWidth: {
        'reading': '36rem',
        'narrow': '65ch',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(31, 26, 31, 0.04), 0 4px 16px rgba(31, 26, 31, 0.05)',
        card: '0 2px 6px rgba(31, 26, 31, 0.04), 0 8px 24px rgba(31, 26, 31, 0.06)',
        elevated: '0 4px 12px rgba(31, 26, 31, 0.08), 0 16px 40px rgba(31, 26, 31, 0.08)',
        'plum-glow': '0 8px 24px rgba(107, 44, 95, 0.18)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'rise-slow': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'zoom-in': {
          from: { transform: 'scale(1.04)' },
          to: { transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        rise: 'rise 0.6s cubic-bezier(0.2, 0, 0, 1) both',
        'rise-slow': 'rise-slow 0.8s cubic-bezier(0.2, 0, 0, 1) both',
        'zoom-in': 'zoom-in 1s cubic-bezier(0.2, 0, 0, 1) both',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
