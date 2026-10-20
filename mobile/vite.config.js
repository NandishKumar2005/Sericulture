import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  define: {
    // Only remap non-VITE_ vars (e.g. from Vercel dashboard) to VITE_ names
    // VITE_GOOGLE_CLIENT_ID is handled natively by Vite from .env files — do NOT define it here
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:5000/api')
  }
});
