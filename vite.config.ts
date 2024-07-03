import { splitVendorChunkPlugin } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';
import compression from 'vite-plugin-compression';
import path from 'path';
import { watchIcons } from './vite/plugins.js';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [
    watchIcons(),
    // tsconfigPaths(),
    splitVendorChunkPlugin(),
    require('cssnano')({
      preset: 'default',
    }),
    eslint(),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        svgProps: { stroke: 'stroke', fill: 'fill' },
      },
      include: '**/*.svg?react',
    }),
    compression({ algorithm: 'brotliCompress' }), // Or 'gzip'
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: red;`,
        includePaths: [path.resolve(__dirname, './src')],
      },
    },
  },

  resolve: {
    alias: {
      // React Components
      '@components': path.resolve(__dirname, 'src/app/components'),
      '@pages': path.resolve(__dirname, 'src/app/pages'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@libs': path.resolve(__dirname, 'src/libs'),

      // Style Sheets
      '~global.scss': path.resolve(__dirname, 'src/app/assets/styles/global.scss'),
      '~button.scss': path.resolve(__dirname, 'src/app/assets/styles/button.scss'),
      '~typography.scss': path.resolve(__dirname, 'src/app/assets/styles/typography.scss'),
      '~colors.scss': path.resolve(__dirname, 'src/app/assets/styles/colors.scss'),
      '~variables.scss': path.resolve(__dirname, 'src/app/assets/styles/variables.scss'),
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),

      // Images
      '~pencil.png': path.resolve(__dirname, 'src/app/assets/img/pencil.png'),
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false, // Consider disabling in production
    minify: 'terser',
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
