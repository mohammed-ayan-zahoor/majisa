/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fdf8f6',
                    100: '#f2e8e5',
                    200: '#eaddd7',
                    300: '#e0cec7',
                    400: '#d2bab0',
                    500: '#a0616a', // Rose gold-ish
                    600: '#8a4f57',
                    700: '#743e45',
                    800: '#5e3035',
                    900: '#4a2327',
                },
                gold: {
                    100: '#fbf7e3',
                    200: '#f5ebb8',
                    300: '#efdf8f',
                    400: '#e9d366',
                    500: '#e3c73d',
                    600: '#b69f31',
                    700: '#887725',
                },
                cream: {
                    50: '#FFFCF9',
                    100: '#F9F7F2', // Main background
                    200: '#F2EFE9',
                    300: '#EBE6DE',
                },
                charcoal: {
                    DEFAULT: '#2D2D2D',
                    50: '#8C8C8C',
                    100: '#737373',
                    200: '#595959',
                    300: '#404040',
                    400: '#2D2D2D', // Main text
                    500: '#1A1A1A',
                    600: '#0D0D0D',
                }
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                serif: ['Mosseta', 'serif'],
            },
        },
    },
    plugins: [],
}
