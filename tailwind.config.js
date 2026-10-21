/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: "#FAF7EE",
          card: "#FFFFFF",
          cream: "#F4EFE6",
          parchment: "#EFE8DA",
          dark: "#1E1A16",
        },
        riso: {
          orange: "#FF5E36",
          yellow: "#FFB800",
          blue: "#2563EB",
          cobalt: "#1D4ED8",
          pink: "#FF3366",
          green: "#16A34A",
          teal: "#0D9488",
          purple: "#7C3AED",
          red: "#DC2626",
          ink: "#18181B",
        },
      },
      boxShadow: {
        'pop': '4px 4px 0px #18181B',
        'pop-sm': '2px 2px 0px #18181B',
        'pop-md': '5px 5px 0px #18181B',
        'pop-lg': '7px 7px 0px #18181B',
        'pop-xl': '10px 10px 0px #18181B',
        'pop-orange': '4px 4px 0px #FF5E36',
        'pop-yellow': '4px 4px 0px #FFB800',
        'pop-blue': '4px 4px 0px #2563EB',
        'pop-red': '4px 4px 0px #DC2626',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Bricolage Grotesque', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        wobble: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        stamp: {
          '0%': { transform: 'scale(3) rotate(-15deg)', opacity: '0' },
          '50%': { transform: 'scale(0.9) rotate(-8deg)', opacity: '1' },
          '75%': { transform: 'scale(1.05) rotate(-6deg)' },
          '100%': { transform: 'scale(1) rotate(-6deg)', opacity: '1' },
        },
        gavel: {
          '0%': { transform: 'rotate(0deg)' },
          '40%': { transform: 'rotate(-45deg)' },
          '70%': { transform: 'rotate(20deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      },
      animation: {
        'wobble-slow': 'wobble 3s ease-in-out infinite',
        'stamp-in': 'stamp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'gavel-strike': 'gavel 0.6s ease-in-out forwards',
      }
    },
  },
  plugins: [],
};
