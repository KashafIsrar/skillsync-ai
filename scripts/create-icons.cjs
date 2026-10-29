const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const output = path.resolve(__dirname, "..", "public");
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(name, data) {
  const type = Buffer.from(name);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([length, type, data, checksum]);
}
function png(size) {
  const rows = Buffer.alloc((size * 4 + 1) * size);
  const background = [22, 19, 31, 255];
  const accent = [240, 217, 228, 255];
  const dot = [193, 160, 172, 255];
  const glyph = ["11111", "10000", "10000", "11111", "00001", "00001", "11111"];
  const cell = Math.max(1, Math.floor(size / 9));
  const startX = Math.floor((size - cell * 5) / 2);
  const startY = Math.floor((size - cell * 7) / 2) - Math.floor(size * 0.04);
  for (let y = 0; y < size; y++) {
    rows[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - startX) / cell);
      const gy = Math.floor((y - startY) / cell);
      const onGlyph = gx >= 0 && gx < 5 && gy >= 0 && gy < 7 && glyph[gy][gx] === "1";
      const onDot = Math.hypot(x - size * 0.77, y - size * 0.77) < size * 0.065;
      const color = onDot ? dot : onGlyph ? accent : background;
      const offset = y * (size * 4 + 1) + 1 + x * 4;
      rows.set(color, offset);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(output, { recursive: true });
const small = png(32);
fs.writeFileSync(path.join(output, "favicon-32.png"), small);
fs.writeFileSync(path.join(output, "apple-touch-icon.png"), png(180));
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);
icoHeader[6] = 32;
icoHeader[7] = 32;
icoHeader.writeUInt16LE(1, 10);
icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(small.length, 14);
icoHeader.writeUInt32LE(22, 18);
fs.writeFileSync(path.join(output, "favicon.ico"), Buffer.concat([icoHeader, small]));
