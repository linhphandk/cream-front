import path from "path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  // empty in dev: requests stay same-origin and go through the proxy below (cream-back has no CORS)
  const apiTarget = env.VITE_API_URL || "http://localhost:3000"

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      proxy: {
        "/auth": { target: apiTarget, changeOrigin: true },
        "/orgs": { target: apiTarget, changeOrigin: true },
        "/onboarding/stripe": { target: apiTarget, changeOrigin: true },
        "/health": { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      target: "esnext",
    },
    esbuild: {
      target: "esnext",
    },
  }
})
