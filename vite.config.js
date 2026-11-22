import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// The browser uses /api; Vite forwards development requests to Express.
export default defineConfig({ plugins: [react()], server: { proxy: { '/api': 'http://127.0.0.1:3000' } } });
