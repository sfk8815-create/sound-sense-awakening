import { readFile } from "node:fs/promises";

for (const file of ["training-speed.html", "training-chord-inversions.html", "training-play-chord.html"]) {
  const html = await readFile(`outputs/chordz-cn/${file}`, "utf8");
  const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const code = scripts.find((s) => s.includes("detectPitch")) ?? "";
  const lines = code.split("\n");
  console.log(`\n========== ${file} ==========`);

  lines.forEach((line, index) => {
    if (/new (SpeedTrainer|ChordInversionsTrainer|PlayChordTrainer)|const \w*[Tt]rainer = |let \w*[Tt]rainer/.test(line)) {
      console.log(`实例化 ${index + 1}: ${line.trim()}`);
    }
  });

  const start = lines.findIndex((line) => line.includes("handleDetectedNote(note) {") && !line.includes("throw"));
  if (start >= 0) {
    console.log(`--- handleDetectedNote (行 ${start + 1} 起) ---`);
    console.log(lines.slice(start, start + 26).map((line, i) => `${start + 1 + i}: ${line}`).join("\n"));
  }
}
