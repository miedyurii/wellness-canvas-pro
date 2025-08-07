import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Add security headers for production builds
      ...(mode === 'production' && {
        plugins: [
          ['@babel/plugin-transform-react-jsx', {
            runtime: 'automatic'
          }]
        ]
      })
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Security configuration for production
  ...(mode === 'production' && {
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        }
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production')
    }
  })
}));
