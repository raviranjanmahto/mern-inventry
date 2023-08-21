import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base URL for your application (used for serving and resolving assets)
  // base: "/",

  // Configure the dev server
  server: {
    port: 3000, // Development server port
    proxy: {
      "/api": "http://localhost:7002", // Proxy API requests to Express server
    },
  },
});
