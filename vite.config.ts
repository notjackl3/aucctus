import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslint(),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        svgProps: { stroke: 'stroke' },
      },
      include: '**/*.svg?react',
    }),
  ],
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    },
  },
  server: {
    open: true,
    port: 3000,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    mockReset: true,
  },
});
