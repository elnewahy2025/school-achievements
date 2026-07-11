import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kahoot: {
          purple: '#7b2ff2',
          red: '#e21b3c',
          blue: '#1368ce',
          green: '#26890c',
          orange: '#ff6b35',
          yellow: '#f9a825',
        },
        dark: {
          900: '#0f0f23',
          800: '#1a1a2e',
          700: '#222244',
          600: '#2d2d5e',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'skeleton-pulse': 'skeletonPulse 2s ease-in-out infinite',
        'hero-text': 'heroText 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        bounceIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        skeletonPulse: { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '0.8' } },
        heroText: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.02)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
};
export default config;
