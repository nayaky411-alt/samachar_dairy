import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || 'https://api.samachardiary24x7.in/api/v1';
  const backendHost = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/storage': {
          target: backendHost,
          changeOrigin: true,
        },
      },
    },
  };
});
