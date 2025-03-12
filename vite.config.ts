import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { splitVendorChunkPlugin, loadEnv } from 'vite';
import compression from 'vite-plugin-compression';
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';
import { viteBoilerplatePlugin, watchIcons } from './vite/plugins.js';

// https://vitejs.dev/config/
export default defineConfig((config) => {
  const { mode } = config;
  const isDevelopment = mode === 'development';
  const env = loadEnv(mode, process.cwd(), '');

  const defaultPlugins = [
    splitVendorChunkPlugin(),
    require('cssnano')({
      preset: 'default',
    }),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        svgProps: { stroke: 'stroke', fill: 'fill' },
      },
      include: '**/*.svg?react',
    }),
    compression({ algorithm: 'brotliCompress' }), // Or 'gzip'
  ];

  const devPlugins = [watchIcons(), viteBoilerplatePlugin(), eslint()];

  const plugins = [
    ...defaultPlugins,
    ...(isDevelopment ? devPlugins : []),
    // Sentry must be the last plugin
    sentryVitePlugin({
      org: 'aucctus',
      project: 'front-end-react',
      authToken: env.SENTRY_AUTH_TOKEN,
    }),
  ];

  const allowedHosts = env.ALLOWED_HOSTS ? env.ALLOWED_HOSTS.split(',') : [];

  return {
    publicDir: 'public',
    plugins: plugins,
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version),
      __APP_ENVIRONMENT__: JSON.stringify(env.NODE_ENV),
    },
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
        // React Components and JavaScript
        '@components': path.resolve(__dirname, 'src/app/components'),
        '@pages': path.resolve(__dirname, 'src/app/pages'),
        '@routes': path.resolve(__dirname, 'src/routes'),
        '@libs': path.resolve(__dirname, 'src/libs'),
        '@assets': path.resolve(__dirname, 'src/app/assets'),
        '@context': path.resolve(__dirname, 'src/app/context'),
        '@hooks': path.resolve(__dirname, 'src/app/hooks'),
        '@stores': path.resolve(__dirname, 'src/app/stores'),
        '@bootstraps': path.resolve(__dirname, 'src/app/bootstraps'),

        // Style Sheets
        '~global.scss': path.resolve(
          __dirname,
          'src/app/assets/styles/global.scss',
        ),
        '~button.scss': path.resolve(
          __dirname,
          'src/app/assets/styles/button.scss',
        ),
        '~typography.scss': path.resolve(
          __dirname,
          'src/app/assets/styles/typography.scss',
        ),
        '~colors.scss': path.resolve(
          __dirname,
          'src/app/assets/styles/colors.scss',
        ),
        '~variables.scss': path.resolve(
          __dirname,
          'src/app/assets/styles/variables.scss',
        ),
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
    server: isDevelopment
      ? {
          allowedHosts,
        }
      : {},
  };
});
