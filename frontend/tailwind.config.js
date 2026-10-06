/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: {
          base: '#070B14',
          surface: '#0D1527',
          elevated: '#152238',
          border: '#1E293B',
          muted: '#334155',
        },
        neon: {
          cyan: '#00F5FF',
          blue: '#38BDF8',
          purple: '#A855F7',
          violet: '#C084FC',
          amber: '#F59E0B',
          rose: '#F43F5E',
          emerald: '#10B981',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 245, 255, 0.45)',
        'glow-cyan-lg': '0 0 35px -5px rgba(0, 245, 255, 0.6)',
        'glow-purple': '0 0 20px -3px rgba(168, 85, 247, 0.45)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.45)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
      },
    },
  },
  plugins: [],
}
