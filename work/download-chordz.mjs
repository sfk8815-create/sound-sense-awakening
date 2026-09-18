import { writeFile } from "node:fs/promises";

const url = "https://codeload.github.com/mymindwentblvnk/chordz/zip/refs/heads/main";
const response = await fetch(url);

if (!response.ok) {
  throw new Error(`下载失败，HTTP ${response.status}`);
}

const buffer = Buffer.from(await response.arrayBuffer());
await writeFile("work/chordz.zip", buffer);
console.log(`已下载 ${buffer.length} 字节`);
