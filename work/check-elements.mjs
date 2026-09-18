import { readFile } from "node:fs/promises";

const html = await readFile("outputs/chordz-cn/rhythm-training.html", "utf8");
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const used = new Set(
  [...html.matchAll(/(?:el\(|getElementById\()"([^"]+)"/g)].map((m) => m[1])
);

const missing = [...used].filter((id) => !ids.has(id));
console.log(`页面元素 ${ids.size} 个，脚本引用 ${used.size} 个`);
console.log(missing.length ? `缺少的元素：${missing.join(", ")}` : "所有被引用的元素都存在");
