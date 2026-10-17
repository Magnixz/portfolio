
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 4440,
    strictPort: true,

    proxy: {
      "/api": {
        target: "http://localhost:4441",
        changeOrigin: true
      }
    }
  }
});
