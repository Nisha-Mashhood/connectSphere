import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 8089, 
    https: false,
  },
  define: { "process.env": {} },

  cacheDir: "D:/vite-temp-cache",
});