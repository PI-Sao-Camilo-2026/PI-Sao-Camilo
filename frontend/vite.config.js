import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://127.0.0.1:8000",
      "/sessoes": "http://127.0.0.1:8000",
      "/usuarios": "http://127.0.0.1:8000",
      "/relatorios": "http://127.0.0.1:8000",
      "/clima": "http://127.0.0.1:8000",
      "/fluidos": "http://127.0.0.1:8000",
    },
  },
});