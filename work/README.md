# 源码目录说明

本目录既是页面源码，也是构建工具所在的位置。

## 构建流程

```bash
node work/build-cn.mjs        # 由源码生成成品站点到 outputs/chordz-cn
node work/check-inline-js.mjs # 检查每个页面内联脚本的语法
node work/sync-desktop.mjs    # 把成品站点同步进 Electron 工程
```

成品站点位于 `outputs/chordz-cn`，**不要直接修改成品文件**：任何手改都会在下一次构建时被覆盖。需要改界面或逻辑时改本目录下的同名页面，然后重新构建。

## 关于品牌名

本目录的页面源文件中保留着历史品牌字符串（"乐感工坊"）。这是有意为之：`build-cn.mjs` 在生成成品时，会统一把该字符串替换为当前品牌名"音感觉醒"，同时完成旧版本遗留的标题、菜单用词等改名映射。

因此：

- 成品站点里不会出现旧品牌名。
- 直接修改源码里的品牌字符串并不会生效，除非同步修改 `build-cn.mjs` 中的替换规则。
- 如果要整体更换品牌名，请修改 `build-cn.mjs` 里的品牌替换行，而不是逐个页面手工替换。

## 页面清单

| 文件 | 功能 |
| --- | --- |
| `home.html` | 工作台首页：主入口、当前进度、最近练习 |
| `rhythm-training.html` | 节奏闯关：麦克风判定、关卡、评分、周报 |
| `theory-practice.html` | 乐理考题：八类笔试题型随机出题 |
| `score-training.html` | 视奏训练：乐谱导入与逐音判定 |
| `training.html` 及 `training-*.html` | 和弦练习各子模块 |
| `class-manage.html` | 班级管理 |
| `homework.html` | 作业布置与学生查看 |
| `pretest-report.html` | 前后测报告 |
| `data-backup.html` | 数据备份与迁移 |
| `metronome.html`、`find-note.html`、`find-scale.html`、`calculate-chords.html`、`chord-progressions.html` | 辅助工具 |
| `wiki*.html` | 乐理手册文章 |

## 共用脚本

| 文件 | 作用 |
| --- | --- |
| `modes.js` | 显示模式（专注、浅色、大屏）与全屏控制 |
| `ui-controls.js` | 分段选择控件的外观统一 |
| `piano-tone.js` | 钢琴音色合成，供各页面调用 |
| `virtual-keyboard.js` | 屏幕虚拟键盘与 MIDI 设备输入 |
| `scroll-guard.js` | 滚动位置保护与侧边导航位置记忆 |
| `serve.js` | 本地静态服务，便于启用麦克风 |

## 检查脚本

改动后建议依次运行：

```bash
node work/build-cn.mjs
node work/check-inline-js.mjs
node work/check-containers.mjs
node tools/preflight-check.mjs
```

## Electron 封装

`work/legong-app` 中保留了 `main.js`、`preload.js` 与 `package.json`。安装依赖与运行：

```bash
cd work/legong-app
npm install
npm start
```

`package.json` 中的 `productName` 决定桌面版数据的存放目录，改名会导致已有的本地数据看起来"消失"。用户数据如需保留，请在改名同时迁移原目录。
