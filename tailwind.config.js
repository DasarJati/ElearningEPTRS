import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['DM Sans', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: '#3b82f6', // Blue
                secondary: '#f59e0b', // Orange
            },
            // Soft, layered shadows tinted with slate so depth looks natural system-wide
            boxShadow: {
                sm: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.04)',
                DEFAULT: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 2px 6px -1px rgb(15 23 42 / 0.05)',
                md: '0 2px 4px -1px rgb(15 23 42 / 0.05), 0 6px 12px -2px rgb(15 23 42 / 0.07)',
                lg: '0 4px 8px -2px rgb(15 23 42 / 0.05), 0 12px 24px -4px rgb(15 23 42 / 0.08)',
                xl: '0 8px 16px -4px rgb(15 23 42 / 0.06), 0 20px 36px -8px rgb(15 23 42 / 0.10)',
                '2xl': '0 12px 24px -6px rgb(15 23 42 / 0.08), 0 28px 56px -12px rgb(15 23 42 / 0.14)',
                inner: 'inset 0 1px 3px 0 rgb(15 23 42 / 0.06)',
            },
            animation: {
                float: 'float 6s ease-in-out infinite',
                 wave: 'wave 1.5s ease-in-out infinite',
            },
            keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(15deg)' },
          '30%': { transform: 'rotate(-10deg)' },
          '45%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
        },
    },

    plugins: [forms],
};
