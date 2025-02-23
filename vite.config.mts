import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';

const PORT = 3000;

export default defineConfig((env) => {
  process.env = { ...process.env, ...loadEnv(env.mode, process.cwd()) };
  return {
    logLevel: 'warn',
    server: {
      port: PORT,
      open: `http://localhost:${PORT}`,
    },
    preview: {
      port: PORT,
      open: `http://localhost:${PORT}`,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: './build',
      sourcemap: true,
      // Disable auto-inline assets
      assetsInlineLimit: 0,
    },
    esbuild: {
      // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
      },
    },
    plugins: [
      env.mode === 'development' &&
        checker({
          overlay: {
            initialIsOpen: process.env.VITE_DEV_SERVER_OVERLAY === 'true',
          },
          typescript: true,
        }),
      vanillaExtractPlugin(),
    ],
  };
});
