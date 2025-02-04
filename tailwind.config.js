module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('@tailwindcss/line-clamp')],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5fe9d0',
          400: '#2ed3b7',
          500: '#15b79e',
          600: '#0e9384',
        },
        tertiary: {
          700: '#626ba3',
        },
        primary: {
          25: '#fcfaff',
          50: '#f4f7fe',
          100: '#dee7fc',
          200: '#c7d6fa',
          250: '#c9bdff',
          300: '#9eb5fa',
          400: '#868ff9',
          450: '#937bff',
          500: '#615eed',
          600: '#4318ff',
        },
        // Assumptions Colors
        desirability: '#7839ee',
        viability: '#0e9384',
        adaptability: '#155eef',
        feasibility: '#088ab2',

        level: {
          low: '#66CCAA',
          medium: '#FFC107',
          high: '#E57373',
        },

        warning: {
          50: '#fffaeb',
          500: '#f79009',
          700: '#b54708',
        },
        error: {
          50: '#fef3f2',
          500: '#f04438',
          700: '#b42318',
        },
        success: {
          50: '#ecfdf3',
          500: '#17b26a',
          700: '#027a48',
        },
        width: {
          'nav-drawer': '15.5rem',
        },
      },

      fontFamily: {
        primary: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        none: '0rem',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.5rem',
        xl: '1rem',
        '2xl': '2rem',
        full: '9999px',
      },
      blur: {
        xs: '2px',
      },
      animation: {
        'slide-in-center': 'slideInCenter 0.3s ease both',
        'slide-in-top': 'slideInTop 0.3s ease both',
        'slide-in-bottom': 'slideInBottom 0.3s ease both',
        'slide-in-left': 'slideInLeft 0.3s ease both',
        'slide-in-right': 'slideInRight 0.3s ease both',
        'slide-out-right': 'slideOutRight 0.3s ease both',
      },
      keyframes: {
        slideInCenter: {
          from: { transform: 'translateY(-50px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInTop: {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInBottom: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
