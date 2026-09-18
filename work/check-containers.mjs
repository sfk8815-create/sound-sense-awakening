import { readdir, readFile } from "node:fs/promises";

const files = (await readdir("outputs/chordz-cn")).filter((name) => name.endsWith(".html"));

for (const file of files) {
  const html = await readFile(`outputs/chordz-cn/${file}`, "utf8");
  const index = html.indexOf('<nav class="main-nav">');
  if (index < 0) {
    console.log(`${file} -> 无导航`);
    continue;
  }
  const rest = html.slice(index);
  const match = rest.match(/<div class="[^"]*container[^"]*"/);
  console.log(`${file} -> ${match ? match[0] : "未找到容器"}`);
}
