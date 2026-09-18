import { readFile } from "node:fs/promises";

const html = await readFile("outputs/chordz-cn/metronome.html", "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const target = scripts.find((code) => code.includes("playSound")) ?? "";
const lines = target.split("\n");

console.log(lines.slice(255, 300).map((line, i) => `${i + 256}: ${line}`).join("\n"));
