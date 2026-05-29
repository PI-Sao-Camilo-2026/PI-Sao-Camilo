import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Plataforma Atleta - São Camilo",
        short_name: "AtletaCamilo",
        description: "Acompanhamento de hidratação e treinos",
        theme_color: "#9B1C2E", 
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  server: {
    host: true, // <-- Torna o projeto acessível no celular automaticamente ao dar 'npm run dev'
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