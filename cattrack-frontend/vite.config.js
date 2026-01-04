import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Tulis 3001 di sini
    strictPort: true, // Opsional: Agar Vite tidak otomatis pindah ke port lain kalau 3001 dipakai
  }
})