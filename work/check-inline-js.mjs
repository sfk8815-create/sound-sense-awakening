import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";

const dir = "outputs/chordz-cn";
const entries = await readdir(dir, { withFileTypes: true });
const files = entries.filter((e) => e.isFile() && e.name.endsWith(".html")).map((e) => path.join(dir, e.name));

let checked = 0;
const failures = [];

for (const file of files) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    const code = match[1].trim();
    if (!code) continue;
    checked += 1;
    try {
      new Function(code);
    } catch (error) {
      failures.push(`${path.basename(file)}: ${error.message}`);
    }
  }
}

console.log(`检查了 ${checked} 段页面内脚本`);
if (failures.length) {
  console.log("发现语法问题：");
  for (const failure of failures) console.log("- " + failure);
} else {
  console.log("全部通过语法检查。");
}
