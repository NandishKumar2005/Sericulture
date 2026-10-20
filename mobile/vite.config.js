import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  define: {
    // Only map non-VITE_ vars from Vercel to VITE_ vars
    // VITE_ prefixed vars are handled natively by Vite — do not override them here
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:5000/api'),
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '')
  }
});
