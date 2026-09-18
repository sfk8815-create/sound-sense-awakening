import { readFile } from "node:fs/promises";

const files = process.argv.slice(2);

for (const file of files) {
  const html = await readFile(file, "utf8");
  const found = new Set();

  for (const match of html.matchAll(/>([^<>]+)</g)) {
    const text = match[1].replace(/\s+/g, " ").trim();
    if (text && /[A-Za-z]/.test(text)) found.add(text);
  }

  for (const match of html.matchAll(/(?:placeholder|aria-label|title|alt)="([^"]*)"/g)) {
    const text = match[1].trim();
    if (text && /[A-Za-z]/.test(text)) found.add(`[attr] ${text}`);
  }

  console.log(`\n===== ${file} =====`);
  for (const text of [...found].sort()) console.log(text);
}
