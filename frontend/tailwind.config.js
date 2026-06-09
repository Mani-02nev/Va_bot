/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-brand', 'bg-brand/10', 'bg-brand', 'text-brand-success', 'bg-brand-success/10', 'bg-brand-success',
    'text-brand-warning', 'bg-brand-warning/10', 'bg-brand-warning', 'text-brand-danger', 'bg-brand-danger/10', 'bg-brand-danger'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0A2A66',  // Primary Blue
          secondary: '#123A8C',// Secondary Blue
          accent: '#1F5EDC',   // Accent Blue
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
          bg: '#F5F7FA',
          card: '#FFFFFF',
          border: '#E5E7EB',
          text: '#111827',
          muted: '#6B7280',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
