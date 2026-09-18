import { readFile } from "node:fs/promises";

for (const file of ["training-speed.html", "training-chord-inversions.html", "training-play-chord.html"]) {
  const html = await readFile(`outputs/chordz-cn/${file}`, "utf8");
  const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const code = scripts.find((s) => s.includes("detectPitch")) ?? "";
  const lines = code.split("\n");
  console.log(`\n========== ${file} ==========`);
  lines.forEach((line, index) => {
    if (/detectPitch|detectedNote|note ===|note ==|correct|wrong|score\+\+|this\.score|targetNote|currentChord|playSuccess|handleNote|processNote/i.test(line)) {
      console.log(`${index + 1}: ${line}`);
    }
  });
}
