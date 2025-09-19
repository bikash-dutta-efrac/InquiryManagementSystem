import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      'spotty-dogs-worry.loca.lt',
    ],
    host: true,
  },
  theme: {
    extend: {
      fontFamily: {
        // 'Inter' is now the first choice for the font-sans class
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
})
