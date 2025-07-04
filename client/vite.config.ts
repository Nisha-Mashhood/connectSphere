import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173, // Default Vite port 
    https: false, // Change to true if testing on HTTPS
  },
  define: { 'process.env': {} }
});