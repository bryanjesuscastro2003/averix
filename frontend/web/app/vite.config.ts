import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // env = loadEnv(mode, process.env.g!, '')
    plugins: [react(), tailwindcss()],

    define: {
      "process.env": env,
    },

    server: {
      host: "0.0.0.0",
      port: 5175,
      https: {
        key: "./key.pem",
        cert: "./cert.pem",
      },
    },
  };
});
