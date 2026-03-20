/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        primary: {
          DEFAULT: '#1B8C4E',
          dark: '#157A42',
          light: '#E8F5E9',
        },
        // Neutrals
        bg: '#F5F7FA',
        card: '#FFFFFF',
        sidebar: '#FAFBFC',
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F0F0F0',
        },
        // Text
        text: {
          DEFAULT: '#1A1A2E',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        // Status
        strong: {
          DEFAULT: '#16A34A',
          bg: '#DCFCE7',
        },
        good: {
          DEFAULT: '#2563EB',
          bg: '#DBEAFE',
        },
        attention: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: '#FEE2E2',
        },
        // Dashboard specific greens
        green: {
          DEFAULT: '#2D7A4F',
          mid: '#3a9460',
          light: '#E8F5EE',
          muted: '#C5E8D1',
          glow: 'rgba(45, 122, 79, 0.15)',
          accent: '#34D399',
          dark: '#183325',
          logo: '#245F3D',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        'sidebar': '250px',
        'header': '64px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.04)',
        'md': '0 2px 8px rgba(0,0,0,0.06)',
        'lg': '0 4px 16px rgba(0,0,0,0.08)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.06)',
        'drawer': '-8px 0 30px rgba(15,23,42,0.12)',
        'modal': '0 10px 25px rgba(0,0,0,0.2)',
        'dropdown': '0 8px 24px rgba(0,0,0,0.12)',
        'avatar-ring': '0 0 0 3px rgba(45,122,79,0.2)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #1B8C4E 0%, #2BA961 100%)',
        'green-gradient': 'linear-gradient(135deg, rgba(45,122,79,0.12), rgba(45,122,79,0.05))',
        'green-bar': 'linear-gradient(90deg, #2D7A4F, #34D399)',
        'blue-bar': 'linear-gradient(90deg, #2563EB, #60A5FA)',
        'orange-bar': 'linear-gradient(90deg, #D97706, #FCD34D)',
        'purple-bar': 'linear-gradient(90deg, #7C3AED, #A78BFA)',
        'red-bar': 'linear-gradient(90deg, #EF4444, #FCA5A5)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'dropdown': 'dropdownFadeIn 0.15s ease',
        'modal-slide': 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'drawer-in': 'drawerIn 0.22s ease-out',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        dropdownFadeIn: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        modalSlideUp: {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        drawerIn: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      minWidth: {
        'sidebar': '250px',
      },
      width: {
        'sidebar': '250px',
      },
      height: {
        'header': '64px',
      },
      inset: {
        'sidebar': '250px',
        'header': '64px',
      },
    },
  },
  plugins: [],
}
