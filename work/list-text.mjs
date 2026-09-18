import { readFile } from "node:fs/promises";

const files = process.argv.slice(2);

for (const file of files) {
  const html = await readFile(file, "utf8");
  const withoutCode = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const found = new Set();
  for (const match of withoutCode.matchAll(/>([^<>]+)</g)) {
    const text = match[1].replace(/\s+/g, " ").trim();
    if (text && /[A-Za-z]/.test(text)) found.add(text);
  }

  console.log(`\n===== ${file} =====`);
  for (const text of [...found]) console.log(text);
}
