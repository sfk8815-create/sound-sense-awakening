import { readFile } from "node:fs/promises";

const html = await readFile("outputs/chordz-cn/rhythm-training.html", "utf8");
const script = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((code) => code.includes("registerHit")) ?? "";
const lines = script.split("\n");

console.log(lines.slice(236, 262).map((line, i) => `${i + 237}: ${line}`).join("\n"));
console.log("\n===== finishTraining =====");
console.log(lines.slice(366, 412).map((line, i) => `${i + 367}: ${line}`).join("\n"));
