module.exports = {
  content: [
    "./index.html",
    "./*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        'primary-hover': '#4338ca',
        secondary: '#6b7280',
        success: '#10b981',
        danger: '#ef4444',
        'light-bg': '#f8f9fa',
        'dark-text': '#333333',
        'header-bg': '#f2f7ff',
        'tree-bg': '#f8fafc',
        'input-border': '#e5e7eb'
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        'lg': '0.5rem'
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      }
    }
  },
  plugins: []
} 