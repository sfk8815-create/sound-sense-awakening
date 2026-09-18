# 音感觉醒 · 音乐能力训练与测评系统

<img src="outputs/chordz-cn/icons/icon-192.png" width="96" alt="音感觉醒图标">

面向中小学音乐课堂与音乐专业基础教学的音乐能力训练工具。学生在电脑上直接练习，程序用麦克风听清每一次击打，判断节奏准不准，并自动留下可对比、可导出的练习数据；教师可以建立名单、布置作业、查看达标情况，并生成前后测进步报告。全部功能在本机运行，不联网、不注册、不上传数据。

许可证：MIT ｜ 平台：Windows（浏览器版可跨平台）｜ 语言：简体中文

## 它解决什么问题

节奏与乐理训练长期依赖教师逐个听辨：一节四十分钟的课，教师很难听完每个学生的节奏稳定性，学生课后练习也没有客观反馈。市面上的节拍器只提供"参考拍点"，无法告诉学生"你打早了还是打晚了"。

本项目把两件事连了起来：一是用浏览器的音频输入实时比较击打时刻与节拍网格，给出毫秒级偏差、准确率与诊断建议；二是把每次练习沉淀成本地数据，并用前后测报告量化进步幅度，让教学效果的评估有据可依。

## 功能

| 模块 | 说明 |
| --- | --- |
| 节奏闯关 | 麦克风识别击打时机，实时标出准、偏早、偏晚，结束后给准确率、平均偏差、偏差图、诊断建议与周报；含 12 关进阶体系、自定义节奏型、预备拍提示强度可选 |
| 乐理考题 | 按音乐课与艺考笔试题型随机出题：音值组合与时值、拍号与节拍、音程、和弦、调号与调性、音阶与调式、记谱法、音乐术语，答完给判断依据，支持只练错题 |
| 视奏训练 | 导入 MusicXML 或 MIDI 乐谱，五线谱与钢琴卷帘对照，逐音判定音高与节奏，支持高音与低音谱号 |
| 和弦练习 | 转位闯关、60 秒速弹、和弦弹奏、调内和弦挑战四个训练 |
| 听辨工具 | 音高识别、听音辨调、和弦找音、节拍基准、进行曲库 |
| 乐理手册 | 音阶、和弦、五度圈、相对音感等中文专题文章 |
| 班级管理 | 建立学生名单，汇总每人的练习次数、平均准确率、得分与最好成绩，可导出全班成绩表 |
| 作业布置 | 布置练习任务并设定达标线，学生完成后程序自动比对记录判定达标，无需教师手工核对 |
| 前后测报告 | 设定分界日期，自动生成各模块前测与后测对比、进步幅度与结论，可打印或导出 |
| 数据备份 | 一键导出全部数据为 JSON，支持合并或覆盖导入，便于换机与迁移 |

## 快速开始

### 方式一：直接打开（最快）

用浏览器打开 `outputs/chordz-cn/home.html` 即可。建议使用最新版 Edge 或 Chrome。

节奏闯关、音高识别需要麦克风权限，直接以 `file://` 打开时部分浏览器会限制录音功能，因此推荐使用下面的本地服务方式。

### 方式二：本地服务（推荐）

仓库自带一个零依赖的静态服务脚本，需要 Node.js 18 以上：

```bash
node work/serve.js
```

然后在浏览器访问 `http://127.0.0.1:8765/chordz-cn/home.html`。

### 方式三：桌面版

`work/legong-app` 是 Electron 封装，提供无地址栏的独立窗口与原生全屏：

```bash
cd work/legong-app
npm install
npm start
```

打包 Windows 免安装版可使用 `electron-builder`，产物目录已在 `.gitignore` 中排除，不随仓库分发。

## 目录结构

```
README.md                 项目说明
LICENSE                   MIT 许可证
THIRD_PARTY_NOTICES.md    第三方来源与致谢
CONTRIBUTING.md           贡献指引
docs/                     使用说明与软件说明书
tools/                    开源前自检脚本
outputs/chordz-cn/        可直接运行的成品站点（HTML/CSS/JS/图标）
work/                     页面源码、构建脚本与检查脚本
work/legong-app/          Electron 封装源码
```

成品站点的每个页面都是单文件 HTML，样式与逻辑内联，便于课堂离线拷贝与投影使用；`work/` 中的页面文件是唯一权威源，构建脚本负责把源码加工成成品。

## 技术栈

- 前端：原生 HTML、CSS、JavaScript，无框架、无构建依赖
- 音频：Web Audio API 合成钢琴音色，AudioContext 高精度时钟驱动节拍网格
- 输入：麦克风实时分析（时域峰值检测）与 Web MIDI 设备输入
- 乐谱：MusicXML / MIDI 解析后在 Canvas 上绘制五线谱与钢琴卷帘
- 桌面封装：Electron
- 数据：浏览器 localStorage，全部数据留在本机

## 关键实现说明

**节奏判定。** 播放节拍后记录每个拍点的理论时刻，把麦克风检测到的击打峰值换算成相对偏差。判定阈值以 70 毫秒内为"准"、70 至 150 毫秒为"偏差"，并把该次练习的中位数偏移作为基准做一次对齐，抵消设备与耳机延迟。评分会按偏差分布、漏击与多余击打分，最终给出等级。

**乐理出题。** 题目由乐理规则计算生成，而非固定题库：音程按度数与半音数查表判定，和弦按根音加结构音推导，调号、关系小调与同主音调来自调性表，五声调式由音阶旋转得出。每题都附带判断依据，答错时说明错在哪里。

**数据与备份。** 练习记录、关卡进度、学生名单与作业都以带前缀的键写入 localStorage；数据备份页面可以整体导出为 JSON，导入时校验文件来源，格式不符不会改动已有数据。

## 开发与构建

```bash
# 由源码生成成品站点到 outputs/chordz-cn
node work/build-cn.mjs

# 页面内联脚本语法检查
node work/check-inline-js.mjs

# 同步到 Electron 工程
node work/sync-desktop.mjs

# 开源前自检（个人材料、密钥、本地路径、超大文件）
node tools/preflight-check.mjs
```

## 隐私

软件不联网、不注册账号、不上传任何数据。麦克风采集的声音只在内存中即时分析，不录制、不保存、不传输。练习数据保存在本机浏览器中，可由使用者随时导出或清空。

## 已知限制

- 麦克风判定依赖设备质量与环境噪声，嘈杂教室中建议佩戴耳机或使用 MIDI 电钢输入。
- 视奏训练的曲谱导入支持 MusicXML 与 MIDI，暂不支持扫描图片识谱。
- 数据保存在浏览器本地，清理浏览器数据会一并清除，请定期导出备份。
- 桌面版目前只在 Windows 上打包验证，其他平台需自行构建。

## 后续计划

- 增加更多教材曲目与视奏曲库
- 支持按班级导出教学分析报告
- 增加课堂投屏用的演示模式与学员端互评

## 贡献

欢迎提交 Issue 与 Pull Request，具体要求见 [CONTRIBUTING.md](CONTRIBUTING.md)。提交前请运行 `node tools/preflight-check.mjs`。

## 版权与作者

© 西南大学·音乐声学实验室 · 西南大学·艺术人类学研究所 · 西南大学·中国音乐心理健康研究所

作者：马荣寰 —— 邮箱 / 社交媒体账号待补充

### Copyright and authorship

© Music Acoustics Laboratory, Southwest University · Institute of Artistic Anthropology, Southwest University · Institute of Chinese Music and Mental Health, Southwest University

Author: Ma Ronghuan — email / social media account to be added

## 许可证与致谢

本项目以 MIT 许可证开源，见 [LICENSE](LICENSE)。

项目的前身是 [Chordz](https://github.com/mymindwentblvnk/chordz)（作者 Michael Eichenseer，MIT 许可证）。和弦练习、进行曲库、音高识别与乐理手册等页面的结构、样式与部分交互逻辑基于该项目改写，界面文案已全部重写为中文并做了功能扩展，原始版权声明已完整保留。其他第三方来源见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

---

## English overview

SoundSense Awakening (音感觉醒) is an offline music-training suite for school music classrooms and basic musicianship courses. It listens to a student's clapping or playing through the microphone, measures timing error in milliseconds, scores rhythm accuracy, generates music-theory exam questions from theory rules, and turns practice records into pre/post assessment reports for teachers. Everything runs locally in the browser with no server, no account, and no data upload. Licensed under MIT, derived from the Chordz project.
