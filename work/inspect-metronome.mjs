import { readFile } from "node:fs/promises";

const html = await readFile("outputs/chordz-cn/metronome.html", "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const target = scripts.find((code) => code.includes("playSound")) ?? "";
const lines = target.split("\n");

lines.forEach((line, index) => {
  if (/playSound|gain|Gain|volume|Volume|Tone\.|createOscillator|amplitude|start-stop|bpm/i.test(line)) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
