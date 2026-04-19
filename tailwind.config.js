/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F1117',
          panel: '#1A1D27',
          hover: '#22253A',
        },
        border: {
          DEFAULT: '#2A2D3E',
        },
        accent: {
          DEFAULT: '#6C63FF',
          hover: '#7B73FF',
          muted: 'rgba(108, 99, 255, 0.15)',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 200ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-up': 'scaleUp 200ms ease-out',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
