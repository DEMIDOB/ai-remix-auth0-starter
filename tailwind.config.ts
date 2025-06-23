import type { Config } from 'tailwindcss'

const config = {
  content: ['./app/**/*.{ts,tsx,js,jsx}'],
  safelist: [], // ✅ still valid
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config

export default config
