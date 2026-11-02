// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Servidor Node.js real (node .output/server/index.mjs) para el contenedor de Render, no Cloudflare.
  nitro: { preset: "node-server" },
  vite: {
    // Bandera de build para /planeacion (herramienta interna). Apagada salvo VITE_PLANEACION_ENABLED=true.
    define: {
      __PLANEACION_ENABLED__: JSON.stringify(process.env["VITE_PLANEACION_ENABLED"] === "true"),
    },
    resolve: {
      alias: [
        {
          // Sin la bandera, el módulo interno se sustituye por un stub: su código nunca llega al bundle público.
          find: /^@\/components\/planning\/PlanningApp$/,
          replacement:
            process.env["VITE_PLANEACION_ENABLED"] === "true"
              ? fileURLToPath(new URL("./src/components/planning/PlanningApp", import.meta.url))
              : fileURLToPath(new URL("./src/components/planning/PlanningAppDisabled.tsx", import.meta.url)),
        },
      ],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
