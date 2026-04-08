import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_STRIPE_PK': JSON.stringify(process.env.VITE_STRIPE_PK),
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: { vendor:['react','react-dom'], charts:['recharts'], icons:['lucide-react'] }
      }
    }
  }
})
