import { mkdir, writeFile } from "node:fs/promises";

const url = "https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js";
const response = await fetch(url);

if (!response.ok) {
  throw new Error(`Tone.js 下载失败，HTTP ${response.status}`);
}

const buffer = Buffer.from(await response.arrayBuffer());
await mkdir("outputs/chordz-cn/vendor", { recursive: true });
await writeFile("outputs/chordz-cn/vendor/Tone.js", buffer);
console.log(`Tone.js 已保存，共 ${buffer.length} 字节`);
