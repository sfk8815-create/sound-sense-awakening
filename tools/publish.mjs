#!/usr/bin/env node
/*
 * 一键上线：构建成品 → 同步桌面版与仓库 → 提交 → 推送
 * 用法：双击项目根目录的「一键上线.bat」，或执行 node tools/publish.mjs
 */

import { spawnSync } from "node:child_process";
import { cp, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT = path.resolve(REPO, "..", "..");
const SITE_SRC = path.join(PROJECT, "outputs", "chordz-cn");
const SITE_DST = path.join(REPO, "outputs", "chordz-cn");
const WORK_SRC = path.join(PROJECT, "work");
const WORK_DST = path.join(REPO, "work");
const DESKTOP_APP = path.join(PROJECT, "outputs", "新版", "乐感工坊-win32-x64", "resources", "app", "app");

const REPO_URL = "https://github.com/sfk8815-create/sound-sense-awakening";
const PAGES_URL = "https://sfk8815-create.github.io/sound-sense-awakening/";

const COPY_EXT = new Set([".html", ".js", ".mjs", ".css", ".json", ".png", ".ico", ".svg", ".jpg", ".jpeg", ".xml", ".txt", ".webmanifest"]);
const SKIP_NAMES = new Set(["server.pid", "README.md", ".github", ".gitignore"]);
const SKIP_RULES = [/^启动.*\.bat$/, /^停止服务.*\.bat$/, /^server\.(ps1|js)$/, /^tmp-/, /^launch\.log$/];
const SKIP_DIRS = new Set([
  "node_modules", ".git", ".pnpm-store", ".npm", ".cache", ".localappdata", ".appdata",
  ".electron-cache", "dist", "chordz-extract", "ppt-build", "desktop-backup",
  "manual-render", "qa-render", "render", "png",
]);

function log(text) {
  process.stdout.write(text + "\n");
}

function fail(step, detail) {
  log("");
  log("× 卡在第 " + step + " 步，后面的步骤没有再执行。");
  if (detail) log("  原因：" + detail);
  log("");
  log("  处理建议：把上面这些行完整发给 Codex，我来判断怎么修。不要自己反复重试推送。");
  process.exit(1);
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd || PROJECT,
    encoding: "utf8",
    shell: false,
    env: process.env,
  });
}

function runStep(stepNo, title, command, args, options) {
  log("");
  log("【第 " + stepNo + " 步】" + title);
  const result = run(command, args, options);
  const output = ((result.stdout || "") + (result.stderr || "")).trim();
  if (output) log(output.split("\n").slice(-8).join("\n"));
  if (result.status !== 0) fail(stepNo, command + " 返回码 " + result.status);
  return output;
}

async function listFiles(dir, base = dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      await listFiles(full, base, out);
    } else {
      out.push(path.relative(base, full));
    }
  }
  return out;
}

function copyable(relative) {
  const name = path.basename(relative);
  if (SKIP_NAMES.has(name) || SKIP_NAMES.has(relative.split(path.sep)[0])) return false;
  if (SKIP_RULES.some((rule) => rule.test(name))) return false;
  return COPY_EXT.has(path.extname(name).toLowerCase());
}

function trackedFiles(subDir) {
  // core.quotePath=false 保证中文文件名不被转义
  const result = run("git", ["-c", "core.quotePath=false", "ls-files", subDir], { cwd: REPO });
  if (result.status !== 0) return [];
  return (result.stdout || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => path.relative(subDir, line).split("/").join(path.sep));
}

async function syncTracked(sourceDir, targetDir, label) {
  const tracked = trackedFiles(path.relative(REPO, targetDir).split(path.sep).join("/"));
  let copied = 0;
  let missing = 0;
  for (const relative of tracked) {
    const from = path.join(sourceDir, relative);
    if (!(await stat(from).then(() => true).catch(() => false))) {
      missing += 1;
      continue;
    }
    const to = path.join(targetDir, relative);
    await mkdir(path.dirname(to), { recursive: true });
    await cp(from, to, { force: true });
    copied += 1;
  }
  log("  " + label + "：同步 " + copied + " 个仓库跟踪文件" + (missing ? "（源目录里缺 " + missing + " 个）" : ""));
}

/** 成品站点里新出现的网页文件也一并带上，源码目录不自动新增 */
async function syncNewSiteFiles(sourceDir, targetDir, label) {
  const tracked = new Set(trackedFiles("outputs/chordz-cn"));
  const sourceFiles = await listFiles(sourceDir);
  const added = [];
  for (const relative of sourceFiles) {
    if (!copyable(relative)) continue;
    if (tracked.has(relative)) continue;
    const extension = path.extname(relative).toLowerCase();
    if (![".html", ".css", ".js", ".png", ".ico", ".svg"].includes(extension)) continue;
    const to = path.join(targetDir, relative);
    await mkdir(path.dirname(to), { recursive: true });
    await cp(path.join(sourceDir, relative), to, { force: true });
    added.push(relative);
  }
  if (added.length) {
    log("  " + label + "：新增 " + added.length + " 个网页文件");
    for (const item of added.slice(0, 8)) log("      + " + item);
    if (added.length > 8) log("      …… 其余 " + (added.length - 8) + " 个");
  }
}

async function main() {
  log("==============================================");
  log("  音感觉醒 · 一键上线");
  log("  项目：" + PROJECT);
  log("==============================================");

  if (run("git", ["--version"]).status !== 0) {
    fail(0, "没找到 git 命令，请先安装 Git 或 GitHub Desktop");
  }

  runStep(1, "由源码生成成品站点", process.execPath, [path.join(PROJECT, "work", "build-cn.mjs")], { cwd: PROJECT });
  runStep(2, "页面内联脚本语法检查", process.execPath, [path.join(PROJECT, "work", "check-inline-js.mjs")], { cwd: PROJECT });

  log("");
  log("【第 3 步】上传前自检（密钥、本机路径、个人材料、超大文件）");
  const check = run(process.execPath, [path.join(REPO, "tools", "preflight-check.mjs")], { cwd: REPO });
  const checkOutput = ((check.stdout || "") + (check.stderr || "")).trim();
  if (checkOutput) log(checkOutput);
  if (check.status !== 0) fail(3, "自检发现需要处理的文件，已停下，没有提交也没有推送");

  log("");
  log("【第 4 步】同步到开源仓库与桌面版");
  await syncTracked(SITE_SRC, SITE_DST, "成品站点 → 仓库");
  await syncNewSiteFiles(SITE_SRC, SITE_DST, "成品站点 → 仓库");
  await syncTracked(WORK_SRC, WORK_DST, "页面源码 → 仓库");
  run(process.execPath, [path.join(PROJECT, "work", "sync-desktop.mjs")], { cwd: PROJECT });
  run(process.execPath, [path.join(REPO, "work", "sync-desktop.mjs")], { cwd: REPO });
  if (await stat(DESKTOP_APP).then(() => true).catch(() => false)) {
    let desktopCopied = 0;
    for (const relative of await listFiles(SITE_SRC)) {
      if (!copyable(relative)) continue;
      const from = path.join(SITE_SRC, relative);
      const to = path.join(DESKTOP_APP, relative);
      await mkdir(path.dirname(to), { recursive: true });
      await cp(from, to, { force: true });
      desktopCopied += 1;
    }
    log("  成品站点 → 已安装的桌面版：更新 " + desktopCopied + " 个文件");
  }

  const status = run("git", ["status", "--porcelain"], { cwd: REPO }).stdout.trim();
  log("");
  log("【第 5 步】提交");
  if (!status) {
    log("  没有需要提交的改动，跳过提交。");
  } else {
    const changed = status.split("\n").length;
    run("git", ["add", "-A"], { cwd: REPO });
    const message = process.argv[2] || "更新软件内容与文档（" + changed + " 个文件）";
    runStep(5, "写入提交（" + changed + " 个文件）", "git", [
      "-c", "user.name=马荣寰",
      "-c", "user.email=324737404+mading686-dotcom@users.noreply.github.com",
      "commit", "-m", message,
    ], { cwd: REPO });
  }

  const remoteHeads = run("git", ["ls-remote", "--heads", "studio", "main"], { cwd: REPO });
  const hasRemoteMain = remoteHeads.status === 0 && (remoteHeads.stdout || "").trim().length > 0;

  log("");
  log("【第 6 步】推送到 GitHub");
  const pushArgs = hasRemoteMain ? ["push", "studio", "main"] : ["push", "-u", "studio", "main"];
  const pushed = run("git", pushArgs, { cwd: REPO });
  const pushOutput = ((pushed.stdout || "") + (pushed.stderr || "")).trim();
  if (pushOutput) log(pushOutput);
  if (pushed.status !== 0) {
    if (/Repository not found/i.test(pushOutput)) fail(6, "远端仓库还不存在或名字不一致，等主管建好库再推");
    if (/403|Write access/i.test(pushOutput)) fail(6, "还没有推送权限，通常是协作者邀请没接受");
    if (/fetch first|non-fast-forward|rejected/i.test(pushOutput)) fail(6, "远端有你本地没有的提交，先拉取合并，不要强推");
    fail(6, "推送失败，原因见上面的输出");
  }

  const sha = run("git", ["rev-parse", "--short", "HEAD"], { cwd: REPO }).stdout.trim();
  log("");
  log("==============================================");
  log("  上线完成");
  log("  提交：" + sha);
  log("  仓库：" + REPO_URL);
  log("  线上：" + PAGES_URL);
  log("  （线上要能打开，需先在仓库 Settings → Pages 里把 Source 设为 GitHub Actions；");
  log("    已开启时，推送后约一两分钟自动生效）");
  log("==============================================");
}

main().catch((error) => fail("未预期", error.message));
