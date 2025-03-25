import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import cssnano from 'cssnano';
import path from 'path';
import { loadEnv } from 'vite';
import compression from 'vite-plugin-compression';
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';
import { viteBoilerplatePlugin, watchIcons } from './vite/plugins.js';

// https://vitejs.dev/config/
export default defineConfig(async (config) => {
  const { mode } = config;
  const isDevelopment = mode === 'development';
  const env = loadEnv(mode, process.cwd(), '');

  // Dynamically import vite-plugin-checker so it loads as an ES module.
  const { default: checker } = await import('vite-plugin-checker');

  const defaultPlugins = [
    cssnano({ preset: 'default' }),
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

  const devPlugins = [
    watchIcons(),
    viteBoilerplatePlugin(),
    eslint(),
    checker({
      typescript: {
        tsconfigPath: './tsconfig.json', // use your valid tsconfig file
      },
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
  ];

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
        '@components': path.resolve(__dirname, 'src/app/components'),
        '@pages': path.resolve(__dirname, 'src/app/pages'),
        '@routes': path.resolve(__dirname, 'src/routes'),
        '@libs': path.resolve(__dirname, 'src/libs'),
        '@assets': path.resolve(__dirname, 'src/app/assets'),
        '@context': path.resolve(__dirname, 'src/app/context'),
        '@hooks': path.resolve(__dirname, 'src/app/hooks'),
        '@stores': path.resolve(__dirname, 'src/app/stores'),
        '@bootstraps': path.resolve(__dirname, 'src/app/bootstraps'),
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
        '~pencil.png': path.resolve(__dirname, 'src/app/assets/img/pencil.png'),
      },
    },
    build: {
      outDir: 'build',
      sourcemap: !isDevelopment ? 'hidden' : true,
      manifest: true,
      minify: 'terser',
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      target: 'es2018',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true,
          passes: 2,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              const packageName = id.split('node_modules/')[1].split('/')[0];
              const largePackages = ['bootstrap'];
              if (largePackages.some((pkg) => packageName.startsWith(pkg))) {
                return `vendor-${packageName.replace('@', '')}`;
              }
              return 'vendor';
            }
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
