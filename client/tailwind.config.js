/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: { 50:'#f0fdfc',100:'#ccfbf1',200:'#99f6e4',300:'#5eead4',400:'#2dd4bf',500:'#14b8a6',600:'#0d9488',700:'#0f766e',800:'#115e59',900:'#134e4a' },
        navy: { 50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81',950:'#0c0f1e' },
        electric: { 400:'#22d3ee',500:'#06b6d4',600:'#0891b2' },
      },
      fontFamily: {
        display: ['"Inter"','system-ui','sans-serif'],
        body: ['"Inter"','system-ui','sans-serif'],
        mono: ['"JetBrains Mono"','monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1)',
        'fade-in': 'fadeIn 0.4s ease',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.22,1,0.36,1)',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: { '0%,100%': {transform:'translateY(0)'}, '50%': {transform:'translateY(-12px)'} },
        glowPulse: { '0%,100%': {boxShadow:'0 0 20px rgba(20,184,166,0.3)'}, '50%': {boxShadow:'0 0 40px rgba(20,184,166,0.6)'} },
        slideUp: { '0%': {opacity:'0',transform:'translateY(24px)'}, '100%': {opacity:'1',transform:'translateY(0)'} },
        fadeIn: { '0%': {opacity:'0'}, '100%': {opacity:'1'} },
        scaleIn: { '0%': {opacity:'0',transform:'scale(0.93)'}, '100%': {opacity:'1',transform:'scale(1)'} },
        shimmer: { '0%': {backgroundPosition:'-200% 0'}, '100%': {backgroundPosition:'200% 0'} },
      },
    },
  },
  plugins: [],
};
