import { readFile } from "node:fs/promises";

const targets = {
  "training-speed.html": 445,
  "training-chord-inversions.html": 553,
  "training-play-chord.html": 362,
};

for (const [file, start] of Object.entries(targets)) {
  const html = await readFile(`outputs/chordz-cn/${file}`, "utf8");
  const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const code = scripts.find((s) => s.includes("detectPitch")) ?? "";
  const lines = code.split("\n");
  console.log(`\n========== ${file} ==========`);
  console.log(lines.slice(start - 1, start + 24).map((line, i) => `${start + i}: ${line}`).join("\n"));
}
