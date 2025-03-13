import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';
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
      sourcemaps: {
        filesToDeleteAfterUpload: '**/*.map', // Clean up after upload
      },
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
      sourcemap: !isDevelopment ? 'hidden' : true, // 'hidden' doesn't add references in the bundle
      minify: 'terser',
      assetsInlineLimit: 4096, // Inline small assets to reduce HTTP requests
      chunkSizeWarningLimit: 1000, // Increase warning limit if needed
      cssCodeSplit: true, // Split CSS for better caching
      target: 'es2018', // Modern browsers support
      commonjsOptions: {
        transformMixedEsModules: true, // Handle mixed CJS and ESM modules
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.info', 'console.debug', 'console.warn'],
          passes: 2, // Multiple passes can achieve better minimization
        },
        mangle: {
          safari10: true, // Better Safari compatibility
        },
        format: {
          comments: false, // Remove all comments
        },
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Check if the module belongs to a predefined group
              const packageName = id.split('node_modules/')[1].split('/')[0];

              // Size-based approach - large packages get their own chunk
              // This list can be dynamically generated based on bundle analysis
              const largePackages = ['bootstrap'];
              if (largePackages.some((pkg) => packageName.startsWith(pkg))) {
                return `vendor-${packageName.replace('@', '')}`;
              }

              // Default vendor chunk
              return 'vendor';
            }

            // Application code chunking - based on module path LEAVE HERE AS EXAMPLE FOR FUTURE
            // if (id.includes('src/app/')) {
            //   if (id.includes('components')) return 'app-components';
            //   if (id.includes('pages')) return 'app-pages';
            // }
          },
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
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
