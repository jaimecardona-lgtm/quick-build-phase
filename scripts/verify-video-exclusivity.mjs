// Verifica que cada video (masterId) del manifiesto src/lib/visual-scenes.ts esté asignado a una sola sección.
// Falla (exit 1) si un mismo masterId aparece en más de una sección o si el master no existe en public/media/cinematic.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = readFileSync(join(root, "src/lib/visual-scenes.ts"), "utf8");

// Cada entrada del manifiesto: kind, masterId y sectionId en ese orden.
const entry = /kind:\s*"(video|image)",\s*masterId:\s*"([^"]+)",\s*sectionId:\s*"([^"]+)"/g;
const videos = new Map();
let match;
let total = 0;
while ((match = entry.exec(manifest))) {
  total += 1;
  const [, kind, masterId, sectionId] = match;
  if (kind !== "video") continue;
  if (!videos.has(masterId)) videos.set(masterId, new Set());
  videos.get(masterId).add(sectionId);
}

let failed = false;
for (const [masterId, sections] of videos) {
  if (sections.size > 1) {
    failed = true;
    console.error(`FALLA: ${masterId} asignado a ${sections.size} secciones: ${[...sections].join(", ")}`);
  }
  const master = join(root, "public/media/cinematic", `${masterId}.mp4`);
  const derivative = join(root, "public/media/cinematic", `${masterId}-720.mp4`);
  if (!existsSync(master) || !existsSync(derivative)) {
    failed = true;
    console.error(`FALLA: ${masterId} sin master o derivado 720p en public/media/cinematic`);
  }
}

if (failed) {
  process.exit(1);
}
console.log(`OK: ${videos.size} videos exclusivos, cada uno en una sola sección (${total} escenas en el manifiesto).`);
