import { readFile } from "node:fs/promises";

const html = await readFile("outputs/chordz-cn/metronome.html", "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const target = scripts.find((code) => code.includes("saveSettings")) ?? "";

for (const [index, line] of target.split("\n").entries()) {
  if (/saveSettings\(\)\s*\{|loadSettings\(\)\s*\{|sound-select|beats-per-measure'\)\.addEventListener|soundType = e\.target/.test(line)) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
}

const settingsLine = target.split("\n").findIndex((line) => /saveSettings\(\)\s*\{/.test(line));
console.log("\n--- 上下文 ---");
console.log(
  target
    .split("\n")
    .slice(settingsLine - 1, settingsLine + 14)
    .map((line, i) => `${settingsLine + i}: ${line}`)
    .join("\n")
);
