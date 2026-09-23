#!/usr/bin/env node
/*
 * 开源前自检：确认仓库里没有个人材料、密钥、本地路径或体积异常的文件。
 * 用法：node tools/preflight-check.mjs
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SKIP_DIRS = new Set([".git", "node_modules", ".pnpm-store"]);
const SKIP_FILES = new Set(["tools/preflight-check.mjs"]);
const TEXT_EXT = new Set([".html", ".js", ".mjs", ".css", ".json", ".md", ".txt", ".py", ".bat", ".ps1", ".yml", ".yaml"]);
const MAX_MB = 5;

const RULES = [
  { name: "密钥", pattern: /(atr_|sk-)[A-Za-z0-9]{8,}/, hint: "疑似 API 密钥" },
  { name: "本地路径", pattern: /[A-Za-z]:\\\\?Users\\\\?|C:\/Users\//i, hint: "写死的本机绝对路径" },
  {
    name: "邮箱",
    // GitHub 的 noreply 地址是官方匿名邮箱，用于公开署名，不算泄露个人信息
    pattern: /(?<!users\.noreply\.github\.com\b)[\w.+-]+@(?!users\.noreply\.github\.com\b)[A-Za-z][\w-]*(?:\.[A-Za-z]{2,})+/,
    hint: "个人邮箱地址",
  },
  { name: "手机号", pattern: /(?<!\d)1[3-9]\d{9}(?!\d)/, hint: "手机号" },
  { name: "赛事材料字样", pattern: /互联网\+|大创|申报书|项目申报|答辩稿|开题报告/, hint: "疑似竞赛或申报材料，不宜随源码公开" },
  { name: "内部评审字样", pattern: /评审意见|未公开|内部资料|仅限内部/, hint: "疑似内部材料" },
];

const BLOCKED_EXT = new Set([".docx", ".pptx", ".xlsx", ".pdf", ".zip", ".rar", ".7z", ".exe", ".msi"]);
const ALLOWED_DOCS = [path.join(root, "docs")];

const problems = [];
const bigFiles = [];
let scanned = 0;

/** 优先用 git 列出"会被发布"的文件（跳过 .gitignore 里的构建产物与个人材料） */
function gitFileList() {
  try {
    const output = execFileSync(
      "git",
      ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
      { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
    );
    const files = output.split("\0").filter(Boolean);
    return files.length ? files : null;
  } catch (error) {
    return null;
  }
}

async function checkFile(rel) {
  const full = path.join(root, rel);
  const info = await stat(full).catch(() => null);
  if (!info || !info.isFile()) return;
  const sizeMb = info.size / 1024 / 1024;
  if (sizeMb > MAX_MB) bigFiles.push(`${rel}（${sizeMb.toFixed(1)} MB）`);

  const ext = path.extname(rel).toLowerCase();
  const inDocs = ALLOWED_DOCS.some((prefix) => full.startsWith(prefix));
  if (BLOCKED_EXT.has(ext) && !inDocs) {
    problems.push({ file: rel, rule: "不应提交的文件类型", hint: `${ext} 文件通常属于个人材料或打包产物` });
    return;
  }
  if (!TEXT_EXT.has(ext)) return;

  scanned += 1;
  const text = await readFile(full, "utf8");
  for (const rule of RULES) {
    const hit = text.match(rule.pattern);
    if (hit) problems.push({ file: rel, rule: rule.name, hint: `${rule.hint}：${hit[0].slice(0, 40)}` });
  }
}

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    const rel = path.relative(root, full);
    if (SKIP_FILES.has(rel.split(path.sep).join("/"))) continue;
    const info = await stat(full);
    const sizeMb = info.size / 1024 / 1024;
    if (sizeMb > MAX_MB) bigFiles.push(`${rel}（${sizeMb.toFixed(1)} MB）`);

    const ext = path.extname(entry.name).toLowerCase();
    const inDocs = ALLOWED_DOCS.some((prefix) => full.startsWith(prefix));
    if (BLOCKED_EXT.has(ext) && !inDocs) {
      problems.push({ file: rel, rule: "不应提交的文件类型", hint: `${ext} 文件通常属于个人材料或打包产物` });
      continue;
    }
    if (!TEXT_EXT.has(ext)) continue;

    scanned += 1;
    const text = await readFile(full, "utf8");
    for (const rule of RULES) {
      const hit = text.match(rule.pattern);
      if (hit) problems.push({ file: rel, rule: rule.name, hint: `${rule.hint}：${hit[0].slice(0, 40)}` });
    }
  }
}

const fileList = gitFileList();
if (fileList) {
  for (const rel of fileList) {
    const normalized = rel.split("/").join(path.sep);
    if (SKIP_FILES.has(rel.split(path.sep).join("/"))) continue;
    await checkFile(normalized);
  }
} else {
  await walk(root);
}

console.log(`已扫描文本文件 ${scanned} 个`);
if (bigFiles.length) {
  console.log("\n体积偏大的文件：");
  bigFiles.forEach((item) => console.log("  - " + item));
}
if (problems.length) {
  console.log("\n需要处理的问题：");
  problems.forEach((item) => console.log(`  - [${item.rule}] ${item.file} -> ${item.hint}`));
  process.exitCode = 1;
} else {
  console.log("未发现个人材料、密钥或本地路径，可以安全推送。");
}
