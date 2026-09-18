import { deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = -1;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function blend(pixel, color, alpha) {
  pixel[0] = Math.round(pixel[0] * (1 - alpha) + color[0] * alpha);
  pixel[1] = Math.round(pixel[1] * (1 - alpha) + color[1] * alpha);
  pixel[2] = Math.round(pixel[2] * (1 - alpha) + color[2] * alpha);
  pixel[3] = Math.max(pixel[3], Math.round(alpha * 255));
}

function makeIcon(size) {
  const pixels = Buffer.alloc(size * size * 4, 0);
  const radius = size * 0.22;
  const top = [15, 118, 110];
  const bottom = [19, 78, 74];
  const noteColor = [251, 191, 36];

  const inRoundedSquare = (x, y) => {
    const r = radius;
    const cx = Math.min(Math.max(x, r), size - r);
    const cy = Math.min(Math.max(y, r), size - r);
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;
      const pixel = [0, 0, 0, 0];

      if (!inRoundedSquare(x + 0.5, y + 0.5)) {
        pixels.set(pixel, index);
        continue;
      }

      const t = y / size;
      const background = [
        Math.round(top[0] + (bottom[0] - top[0]) * t),
        Math.round(top[1] + (bottom[1] - top[1]) * t),
        Math.round(top[2] + (bottom[2] - top[2]) * t),
      ];
      blend(pixel, background, 1);

      const nx = (x + 0.5) / size;
      const ny = (y + 0.5) / size;

      // 音符的符头
      const headX = 0.37;
      const headY = 0.71;
      const rx = 0.155;
      const ry = 0.115;
      const headDistance = ((nx - headX) / rx) ** 2 + ((ny - headY) / ry) ** 2;
      if (headDistance <= 1) {
        blend(pixel, noteColor, 1);
      }

      // 符干
      if (nx >= 0.495 && nx <= 0.555 && ny >= 0.26 && ny <= 0.72) {
        blend(pixel, noteColor, 1);
      }

      // 符尾
      if (nx >= 0.55 && nx <= 0.79) {
        const beamY = 0.27 + (nx - 0.55) * 0.55;
        if (ny >= beamY - 0.055 && ny <= beamY + 0.055) {
          blend(pixel, noteColor, 1);
        }
      }

      pixels.set(pixel, index);
    }
  }

  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function toIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  const entries = [];
  let offset = 6 + pngs.length * 16;
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...pngs.map((png) => png.data)]);
}

const outDir = "outputs/chordz-cn/icons";
await mkdir(outDir, { recursive: true });

const png192 = makeIcon(192);
const png512 = makeIcon(512);
const png256 = makeIcon(256);

await writeFile(`${outDir}/icon-192.png`, png192);
await writeFile(`${outDir}/icon-512.png`, png512);
await writeFile(`${outDir}/icon-256.png`, png256);
await writeFile(
  "outputs/chordz-cn/音感觉醒.ico",
  toIco([
    { size: 256, data: png256 },
    { size: 192, data: png192 },
  ])
);

console.log("图标已生成：icons/icon-192.png、icons/icon-512.png、音感觉醒.ico");
