const fs = require("node:fs");
const path = require("node:path");

const source = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
const publicDirectory = path.resolve(__dirname, "..", "public");
fs.mkdirSync(publicDirectory, { recursive: true });
fs.copyFileSync(source, path.join(publicDirectory, "pdf.worker.min.mjs"));
