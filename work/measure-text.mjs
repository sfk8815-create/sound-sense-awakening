import { readFile } from "node:fs/promises";

const files = process.argv.slice(2);

for (const file of files) {
  const html = await readFile(file, "utf8");
  const withoutCode = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const texts = [];
  for (const match of withoutCode.matchAll(/>([^<>]+)</g)) {
    const text = match[1].replace(/\s+/g, " ").trim();
    if (text && /[A-Za-z]/.test(text)) texts.push(text);
  }

  const totalChars = texts.reduce((sum, text) => sum + text.length, 0);
  console.log(`${file}: ${texts.length} 条文本，约 ${totalChars} 个字符`);
}
