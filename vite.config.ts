import { splitVendorChunkPlugin } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';
import compression from 'vite-plugin-compression';
import path from 'path';
import { watchIcons } from './vite/plugins.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    watchIcons(),
    splitVendorChunkPlugin(),
    require('cssnano')({
      preset: 'default',
    }),
    eslint(),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        svgProps: { stroke: 'stroke' },
      },
      include: '**/*.svg?react',
    }),
    compression({ algorithm: 'brotliCompress' }), // Or 'gzip'
  ],
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false, // Consider disabling in production
    minify: 'terser',
    rollupOptions: {
      external: ['icons/*', 'vite'],
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    mockReset: true,
  },
});
