import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const source = "outputs/chordz-cn";
const target = "work/legong-app/app";

const EXCLUDE = new Set([
  "启动.bat",
  "启动应用.bat",
  "启动全屏.bat",
  "停止服务.bat",
  "server.ps1",
  "server.js",
  "server.pid",
  "launch.log",
  "README.md",
  ".github",
  ".gitignore",
]);

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

const entries = await readdir(source, { withFileTypes: true });
for (const entry of entries) {
  if (EXCLUDE.has(entry.name)) continue;
  await cp(path.join(source, entry.name), path.join(target, entry.name), { recursive: true });
}

await mkdir("work/legong-app/build", { recursive: true });
await cp(path.join(source, "音感觉醒.ico"), "work/legong-app/build/icon.ico");

const files = await readdir(target);
console.log(`已同步 ${files.length} 个条目到桌面版工程`);
