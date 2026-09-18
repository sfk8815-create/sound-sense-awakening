import { readFile } from "node:fs/promises";

const html = await readFile("outputs/chordz-cn/rhythm-training.html", "utf8");
const script = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((code) => code.includes("registerHit")) ?? "";
const lines = script.split("\n");

const markers = ["function registerHit", "function updateLiveStats", "function finishTraining", "state.startTime =", "const latency =", "tolerance", "accuracy", "grade"];

lines.forEach((line, index) => {
  if (markers.some((marker) => line.includes(marker))) {
    console.log(`${index + 1}: ${line}`);
  }
});
