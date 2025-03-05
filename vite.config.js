import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "./src/styles/abstracts/variables";
          @use "./src/styles/abstracts/mixins";
        `
      }
    }
  }
});
