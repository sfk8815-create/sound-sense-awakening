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

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function blend(pixel, color, alpha) {
  if (alpha <= 0) return;
  const a = Math.min(1, alpha);
  pixel[0] = Math.round(pixel[0] * (1 - a) + color[0] * a);
  pixel[1] = Math.round(pixel[1] * (1 - a) + color[1] * a);
  pixel[2] = Math.round(pixel[2] * (1 - a) + color[2] * a);
  pixel[3] = Math.max(pixel[3], Math.round(a * 255));
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  let t = lengthSquared === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function makePendulumIcon(size, config) {
  const { top, bottom, rod, accent, shape, extra } = config;
  const topRgb = hexToRgb(top);
  const bottomRgb = hexToRgb(bottom);
  const rodRgb = hexToRgb(rod);
  const accentRgb = hexToRgb(accent);

  const pixels = Buffer.alloc(size * size * 4, 0);
  const radius = size * 0.24;

  const inShape = (x, y) => {
    if (shape === "circle") {
      const dx = x - size / 2;
      const dy = y - size / 2;
      return Math.hypot(dx, dy) <= size * 0.47;
    }
    const r = radius;
    const cx = Math.min(Math.max(x, r), size - r);
    const cy = Math.min(Math.max(y, r), size - r);
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  };

  // 摆锤几何：支点在顶部中央，摆杆向右下倾斜
  const pivotX = size * 0.5;
  const pivotY = size * 0.27;
  const rodEndX = size * 0.70;
  const rodEndY = size * 0.74;
  const rodWidth = size * 0.045;
  const bobX = size * 0.615;
  const bobY = size * 0.545;
  const bobW = size * 0.155;
  const bobH = size * 0.105;
  const baseTop = size * 0.795;
  const baseBottom = size * 0.855;
  const baseLeft = size * 0.27;
  const baseRight = size * 0.73;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;
      const pixel = [0, 0, 0, 0];
      const px = x + 0.5;
      const py = y + 0.5;

      if (!inShape(px, py)) {
        pixels.set(pixel, index);
        continue;
      }

      const ratio = py / size;
      blend(pixel, [
        Math.round(topRgb[0] + (bottomRgb[0] - topRgb[0]) * ratio),
        Math.round(topRgb[1] + (bottomRgb[1] - topRgb[1]) * ratio),
        Math.round(topRgb[2] + (bottomRgb[2] - topRgb[2]) * ratio),
      ], 1);

      // 底座
      if (py >= baseTop && py <= baseBottom && px >= baseLeft && px <= baseRight) {
        blend(pixel, rodRgb, 0.9);
      }

      // 摆杆
      const distance = distanceToSegment(px, py, pivotX, pivotY, rodEndX, rodEndY);
      if (distance <= rodWidth / 2) {
        blend(pixel, rodRgb, 1);
      }

      // 摆锤上的配重块
      if (Math.abs(px - bobX) <= bobW / 2 && Math.abs(py - bobY) <= bobH / 2) {
        blend(pixel, rodRgb, 1);
      }

      // 支点圆
      if (Math.hypot(px - pivotX, py - pivotY) <= size * 0.038) {
        blend(pixel, rodRgb, 1);
      }

      if (extra === "waves") {
        // 声波弧线
        for (const offset of [0.10, 0.16]) {
          const ringRadius = size * (0.30 + offset);
          const ringDistance = Math.hypot(px - pivotX, py - pivotY);
          if (Math.abs(ringDistance - ringRadius) <= size * 0.012) {
            const startAngle = Math.atan2(py - pivotY, px - pivotX);
            if (startAngle > -0.2 && startAngle < 1.5) blend(pixel, accentRgb, 0.85);
          }
        }
      }

      if (extra === "dots") {
        // 底部节拍点
        for (let i = 0; i < 5; i++) {
          const dotX = size * (0.28 + i * 0.11);
          const dotY = size * 0.905;
          const dotRadius = i === 2 ? size * 0.030 : size * 0.020;
          if (Math.hypot(px - dotX, py - dotY) <= dotRadius) {
            blend(pixel, i === 2 ? accentRgb : rodRgb, i === 2 ? 1 : 0.75);
          }
        }
      }

      if (extra === "speed") {
        // 运动轨迹线
        for (const shift of [0.055, 0.095]) {
          const distanceLeft = distanceToSegment(
            px, py,
            pivotX - size * shift, pivotY + size * 0.04,
            rodEndX - size * shift, rodEndY - size * 0.02,
          );
          if (distanceLeft <= size * 0.011) blend(pixel, accentRgb, 0.55);
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

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const variants = [
  {
    file: "pendulum-a.png",
    label: "方案 A 深青底 + 琥珀摆针 + 底部节拍点",
    config: { top: "#0F766E", bottom: "#0B5F59", rod: "#FBBF24", accent: "#FFFFFF", shape: "square", extra: "dots" },
  },
  {
    file: "pendulum-b.png",
    label: "方案 B 圆形底 + 珊瑚橙摆针 + 声波弧线",
    config: { top: "#1E3A5F", bottom: "#132A45", rod: "#F97316", accent: "#93C5FD", shape: "circle", extra: "waves" },
  },
  {
    file: "pendulum-c.png",
    label: "方案 C 深紫底 + 柠檬黄摆针 + 运动轨迹",
    config: { top: "#4C1D95", bottom: "#3B1577", rod: "#FDE047", accent: "#C4B5FD", shape: "square", extra: "speed" },
  },
  {
    file: "pendulum-d.png",
    label: "方案 D 炭黑底 + 薄荷绿摆针 + 底部节拍点",
    config: { top: "#111827", bottom: "#0B1220", rod: "#34D399", accent: "#6EE7B7", shape: "square", extra: "dots" },
  },
];

await mkdir("outputs/icon-preview", { recursive: true });
for (const variant of variants) {
  const png = makePendulumIcon(512, variant.config);
  await writeFile(`outputs/icon-preview/${variant.file}`, png);
  console.log(`${variant.label} -> outputs/icon-preview/${variant.file}`);
}
