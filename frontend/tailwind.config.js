/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-vdart', 'bg-vdart/10', 'bg-vdart', 'text-vdart-success', 'bg-vdart-success/10', 'bg-vdart-success',
    'text-vdart-warning', 'bg-vdart-warning/10', 'bg-vdart-warning', 'text-vdart-danger', 'bg-vdart-danger/10', 'bg-vdart-danger'
  ],
  theme: {
    extend: {
      colors: {
        vdart: {
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
