/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import colors from 'tailwindcss/colors';
import twThemer from 'tailwindcss-themer';
import twGradientMaskImage from 'tailwind-gradient-mask-image';
import AWS_COLORS from './src/constants/colors';

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [...defaultTheme.fontFamily.sans],
        display: [...defaultTheme.fontFamily.sans],
        mono: [...defaultTheme.fontFamily.mono],
      },
      animation: {
        'error-shake': 'shake 500ms ease 1',
        'toast-enter': 'toastEnter 200ms ease-in',
        'toast-exit': 'toastLeave 200ms ease-in',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '16%': { transform: 'translateX(10px)' },
          '32%': { transform: 'translateX(-10px)' },
          '48%': { transform: 'translateX(4px)' },
          '64%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(2px)' },
          '96%': { transform: 'translateX(-2px)' },
        },
        fadeScale: {
          '0%': { opacity: '0', transform: 'scale(0.2)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        toastEnter: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        toastLeave: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(0.9)', opacity: 0 },
        },
      },
      colors: {
        ...AWS_COLORS,
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    twThemer({
      defaultTheme: {
        extend: {
          colors: {
            primary: AWS_COLORS.amber[500],
            primaryAlt: AWS_COLORS.amber[600],
            secondary: AWS_COLORS.blue[500],
            secondaryAlt: AWS_COLORS.blue[600],
            neutral: AWS_COLORS.gray[500],
            neutralAlt: AWS_COLORS.gray[600],
            positive: AWS_COLORS.green[500],
            positiveAlt: AWS_COLORS.green[700],
            destruct: AWS_COLORS.red[500],
            destructAlt: AWS_COLORS.red[700],
            warn: AWS_COLORS.amber[300],
            warnAlt: AWS_COLORS.amber[500],
            uiText: AWS_COLORS.gray[900],
            uiTextAlt: AWS_COLORS.gray[100],
            uiTextAlt2: AWS_COLORS.gray[600],
            surface: colors.white,
            surfaceAlt: AWS_COLORS.gray[100],
            surfaceAlt2: colors.black,
            surfaceAlt3: AWS_COLORS.gray[200],
            border: AWS_COLORS.gray[200],
            overlay: AWS_COLORS.gray[100],
          },
        },
      },
      themes: [
        {
          name: 'dark-theme',
          selectors: ['.dark', '[data-theme="dark"]'],
          extend: {
            colors: {
              primary: AWS_COLORS.amber[500],
              primaryAlt: AWS_COLORS.amber[600],
              secondary: AWS_COLORS.blue[500],
              secondaryAlt: AWS_COLORS.blue[600],
              neutral: AWS_COLORS.gray[500],
              neutralAlt: AWS_COLORS.gray[600],
              positive: AWS_COLORS.green[600],
              positiveAlt: AWS_COLORS.green[500],
              destruct: AWS_COLORS.red[600],
              destructAlt: AWS_COLORS.red[500],
              warn: AWS_COLORS.amber[500],
              warnAlt: AWS_COLORS.amber[400],
              uiText: AWS_COLORS.gray[200],
              uiTextAlt: AWS_COLORS.gray[600],
              uiTextAlt2: AWS_COLORS.gray[400],
              surface: colors.black,
              surfaceAlt: AWS_COLORS.gray[900],
              surfaceAlt2: colors.white,
              surfaceAlt3: AWS_COLORS.gray[800],
              border: AWS_COLORS.gray[800],
              overlay: AWS_COLORS.gray[900],
            },
          },
        },
      ],
    }),
    twGradientMaskImage,
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'animation-delay': (value) => {
            return {
              'animation-delay': value,
            };
          },
        },
        {
          values: theme('transitionDelay'),
        }
      );
    }),
  ],
};
