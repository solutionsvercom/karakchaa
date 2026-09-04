import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  base: "/admin/",
  build: {
    outDir: path.resolve(appRoot, "../DigitalMenu/dist/admin"),
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  plugins: [
    react(
      command === "serve"
        ? {
            babel: {
              plugins: [["babel-plugin-react-compiler"]],
            },
          }
        : undefined
    ),
  ],
}));
