/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF',
          100: '#DCE8FF',
          500: '#3B6EF5',
          600: '#2A56D6',
          700: '#2143A8',
        },
        ink: {
          DEFAULT: '#1F2937',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F4F6FA',
        },
        basic: { light: '#DCFCE7', DEFAULT: '#22C55E', dark: '#15803D' },
        intermediate: { light: '#DBEAFE', DEFAULT: '#3B82F6', dark: '#1D4ED8' },
        advanced: { light: '#F3E8FF', DEFAULT: '#A855F7', dark: '#7E22CE' },
        locked: { light: '#F3F4F6', DEFAULT: '#D1D5DB', dark: '#9CA3AF' },
      },
    },
  },
  plugins: [],
};
