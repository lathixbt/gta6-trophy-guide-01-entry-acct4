import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier, readAppTree } from "./vendor/makefun-frontend.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const screenshots = join(root, "screenshots");
const shots = readdirSync(screenshots, { withFileTypes: true });
if (shots.length < 3 || shots.length > 4 || shots.some(shot => !shot.isFile())) {
  throw new Error("Expected three or four screenshot files in screenshots/.");
}

const { trophies } = JSON.parse(readFileSync(join(root, "app/data/trophies.json"), "utf8"));
if (!Array.isArray(trophies) || trophies.length !== 55) throw new Error("Expected a full 55-trophy journal.");
console.log(`Trophies: ${trophies.length}`);

mkdirSync(destination, { recursive: true });
for (const folder of ["app", "screenshots"]) {
  cpSync(join(root, folder), join(destination, folder), { recursive: true });
}

const app = readAppTree(join(destination, "app"), { app_max_files: 993, app_max_bytes: 50331648 });
console.log(`App: ${app.files.length} files, ${app.totalBytes} bytes`);

const dossier = buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(destination, "dossier.json"), dossier);
console.log(`Dossier: ${Buffer.byteLength(dossier)} bytes`);
