import { readFile } from "node:fs/promises";

const html = await readFile("outputs/chordz-cn/metronome.html", "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const target = scripts.find((code) => code.includes("playSound")) ?? "";
const lines = target.split("\n");

console.log("--- 构造函数 ---");
console.log(lines.slice(0, 24).map((line, i) => `${i + 1}: ${line}`).join("\n"));

const settingsStart = lines.findIndex((line) => line.includes("saveSettings()"));
console.log("\n--- 设置读写 ---");
console.log(lines.slice(settingsStart - 2, settingsStart + 30).map((line, i) => `${settingsStart - 1 + i}: ${line}`).join("\n"));

const initStart = lines.findIndex((line) => line.includes("Set initial values"));
console.log("\n--- 初始化 ---");
console.log(lines.slice(initStart - 12, initStart + 12).map((line, i) => `${initStart - 11 + i}: ${line}`).join("\n"));
