// Copies the tesseract.js worker and tesseract.js-core wasm runtime out of
// node_modules into public/ocr so OCR runs same-origin (no CDN fetch at runtime).
// Runs via the `prebuild` hook; output paths are gitignored.
import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "ocr");

await mkdir(join(outDir, "core"), { recursive: true });

await cp(
  join(root, "node_modules", "tesseract.js", "dist", "worker.min.js"),
  join(outDir, "worker.min.js"),
);

const coreSrc = join(root, "node_modules", "tesseract.js-core");
await cp(coreSrc, join(outDir, "core"), {
  recursive: true,
  filter: (src) =>
    src === coreSrc || /tesseract-core.*\.(js|wasm)$/.test(src),
});

console.log("Copied OCR assets to public/ocr");