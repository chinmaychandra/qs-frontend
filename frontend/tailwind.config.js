/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        void: '#030712',
        surface: '#0a0f1e',
        panel: '#0f1629',
        border: '#1e2d4a',
        accent: '#00d4ff',
        'accent-dim': '#0088aa',
        quantum: '#00ff88',
        'quantum-dim': '#00aa55',
        danger: '#ff3366',
        'danger-dim': '#aa1144',
        warn: '#ffaa00',
        'warn-dim': '#aa7000',
        muted: '#4a6080',
        subtle: '#1a2840',
      },
      animation: {
        'scan-line': 'scanLine 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'matrix-rain': 'matrixRain 20s linear infinite',
        'border-flow': 'borderFlow 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'flicker': 'flicker 4s linear infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px #00d4ff33' },
          '50%': { boxShadow: '0 0 20px #00d4ff88, 0 0 40px #00d4ff33' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.4' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.6' },
          '99%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
