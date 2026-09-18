import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { PAGES, renderPage } from "./pages-content.mjs";
import { CHORD_ZH } from "./chord-desc-zh.mjs";

const source = "work/chordz-extract/chordz-main";
const target = "outputs/chordz-cn";

await cp(source, target, { recursive: true, force: true });

async function listHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "vendor" || entry.name === "images") continue;
      files.push(...(await listHtml(full)));
    } else if (entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = await listHtml(target);

const titleMap = new Map([
  ["<title>Chordz</title>", "<title>和弦训练室</title>"],
  ["<title>Training - Chordz</title>", "<title>训练 - 和弦训练室</title>"],
  ["<title>Metronome - Chordz</title>", "<title>节拍器 - 和弦训练室</title>"],
  ["<title>Speed Training - Chordz</title>", "<title>极速训练 - 和弦训练室</title>"],
  ["<title>Chord Inversions - Chordz</title>", "<title>和弦转位 - 和弦训练室</title>"],
  ["<title>Play Chord - Chordz</title>", "<title>弹奏和弦 - 和弦训练室</title>"],
  ["<title>Find All Chords - Chordz</title>", "<title>找出全部和弦 - 和弦训练室</title>"],
  ["<title>Find Scale - Chordz</title>", "<title>找音阶 - 和弦训练室</title>"],
  ["<title>Chordz - Calculate Chords</title>", "<title>和弦计算 - 和弦训练室</title>"],
  ["<title>Chordz - Chord Progressions</title>", "<title>和弦进行 - 和弦训练室</title>"],
  ["<title>Chordz - Find Note</title>", "<title>找音 - 和弦训练室</title>"],
  ["<title>Chordz - Chord Details</title>", "<title>和弦详情 - 和弦训练室</title>"],
  ["<title>Chordz - Guide</title>", "<title>使用指南 - 和弦训练室</title>"],
  ["<title>Chordz - Music Theory Wiki</title>", "<title>乐理百科 - 和弦训练室</title>"],
  ["<title>Borrowed Chords - Chordz Wiki</title>", "<title>借用和弦 - 乐理百科</title>"],
  ["<title>Building Major Scales - Chordz Wiki</title>", "<title>构建大调音阶 - 乐理百科</title>"],
  ["<title>Chromatic Scale - Chordz Wiki</title>", "<title>半音阶 - 乐理百科</title>"],
  ["<title>Chord Inversions - Chordz Wiki</title>", "<title>和弦转位 - 乐理百科</title>"],
  ["<title>Building Natural Chords - Chordz Wiki</title>", "<title>构建自然和弦 - 乐理百科</title>"],
  ["<title>Circle of Fifths & Fourths - Chordz Wiki</title>", "<title>五度圈与四度圈 - 乐理百科</title>"],
  ["<title>Diminished Chords - Chordz Wiki</title>", "<title>减和弦 - 乐理百科</title>"],
  ["<title>Ghost Notes - Chordz Wiki</title>", "<title>幽灵音 - 乐理百科</title>"],
  ["<title>The Master Pattern - Chordz Wiki</title>", "<title>核心音程模式 - 乐理百科</title>"],
  ["<title>Pro Tips - Chordz Wiki</title>", "<title>进阶练习建议 - 乐理百科</title>"],
  ["<title>Understanding Natural Chords - Chordz Wiki</title>", "<title>认识自然和弦 - 乐理百科</title>"],
  ["<title>Minor Scales - Chordz Wiki</title>", "<title>小调音阶 - 乐理百科</title>"],
  ["<title>Relative Pitch - Chordz Wiki</title>", "<title>相对音感 - 乐理百科</title>"],
  ["<title>Roman Numerals - Chordz Wiki</title>", "<title>罗马数字 - 乐理百科</title>"],
  ["<title>Musical Scales - Chordz Wiki</title>", "<title>音阶 - 乐理百科</title>"],
]);

const globalPairs = [
  ['<html lang="en">', '<html lang="zh-CN">'],
  ["🎮 Training</a>", "🎮 训练</a>"],
  ["📖 Chord Progressions</a>", "📖 和弦进行</a>"],
  ["🎵 Chord Progressions</a>", "🎵 和弦进行</a>"],
  ["⏱️ Metronome</a>", "⏱️ 节拍器</a>"],
  ["🎤 Find Note</a>", "🎤 找音</a>"],
  ["🎼 Find Scale</a>", "🎼 找音阶</a>"],
  ["📚 Wiki</a>", "📚 乐理百科</a>"],
  ["← Back to Training", "← 返回训练"],
  [
    '<script src="https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js"></script>',
    '<script src="vendor/Tone.js"></script>',
  ],
  [' content="Chordz">', ' content="和弦训练室">'],
];

const perFilePairs = new Map([
  [
    "training.html",
    [
      [">Training Mode<", ">训练模式<"],
      ["Practice and improve your musical skills", "转位、速弹、和弦弹奏与调内和弦四项专项练习"],
      ["🔄 Chord Inversions", "🔄 和弦转位"],
      [
        "Master chord inversions by playing all sequences for any chord as fast as you can!",
        "尽可能快地弹完任意和弦的全部转位序列，彻底掌握和弦转位！",
      ],
      ["⚡ Speed Training", "⚡ 极速训练"],
      [
        "Find and play as many keys on your keyboard as fast as possible in 60 seconds!",
        "60 秒内尽可能快地找到并弹出更多琴键！",
      ],
      ["🎸 Play Chord", "🎸 弹奏和弦"],
      [
        "Play all three notes of a chord on your instrument as fast as you can!",
        "用乐器尽可能快地弹出和弦的全部三个音！",
      ],
      ["🎹 Find All Chords", "🎹 找出全部和弦"],
      [
        "Build all 7 natural chords in a random key! Test your music theory knowledge.",
        "在随机调性中构建全部 7 个自然和弦，检验你的乐理知识！",
      ],
    ],
  ],
  [
    "metronome.html",
    [
      [">Metronome<", ">节拍器<"],
      ["Keep your rhythm steady", "保持稳定的节奏"],
      ["👆 Tap Tempo", "👆 点击定速"],
      ["\n                    Tempo\n                </label>", "\n                    速度\n                </label>"],
      ["Time Signature", "拍号"],
      ["\n                        Sound\n                    </label>", "\n                        音色\n                    </label>"],
      [">Click<", ">电子咔哒<"],
      [">Woodblock<", ">木鱼<"],
      [">Beep<", ">电子音<"],
      [">Cowbell<", ">牛铃<"],
      ["▶️ Start", "▶️ 开始"],
      ["⏸️ Stop", "⏸️ 停止"],
      ['<select id="beats-per-measure"', '<select id="beats-per-measure" data-segmented'],
      ['<select id="sound-select"', '<select id="sound-select" data-segmented'],
      [
        '                        <option value="cowbell">牛铃</option>\n                    </select>\n                </div>',
        '                        <option value="cowbell">牛铃</option>\n                    </select>\n                </div>\n\n                <!-- 音量 -->\n                <div style="grid-column: 1 / -1;">\n                    <label style="display: block; margin-bottom: 6px; font-weight: 600; color: var(--text-primary); font-size: 0.85rem;">\n                        音量：<span id="volume-value">100%</span>\n                    </label>\n                    <input type="range" id="volume-range" min="0" max="100" step="5" value="100" style="width: 100%; accent-color: var(--primary-color);">\n                </div>',
      ],
      ["this.soundType = 'click';", "this.soundType = 'click';\n                this.volume = 1;\n                this.noiseBuffer = null;"],
      [
        "                document.getElementById('sound-select').addEventListener('change', (e) => {",
        "                document.getElementById('volume-range').addEventListener('input', (e) => {\n                    this.volume = Number(e.target.value) / 100;\n                    document.getElementById('volume-value').textContent = e.target.value + '%';\n                    this.saveSettings();\n                });\n\n                document.getElementById('sound-select').addEventListener('change', (e) => {",
      ],
      [
        "                document.getElementById('sound-select').value = this.soundType;",
        "                document.getElementById('sound-select').value = this.soundType;\n                document.getElementById('volume-range').value = Math.round(this.volume * 100);\n                document.getElementById('volume-value').textContent = Math.round(this.volume * 100) + '%';",
      ],
      [
        "                        soundType: this.soundType\n                    }));",
        "                        soundType: this.soundType,\n                        volume: this.volume\n                    }));",
      ],
      [
        "                        this.soundType = settings.soundType || 'click';",
        "                        this.soundType = settings.soundType || 'click';\n                        this.volume = typeof settings.volume === 'number' ? settings.volume : 1;",
      ],
      [
        `            playSound(isFirstBeat, time) {
                const osc = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                switch(this.soundType) {
                    case 'click':
                        osc.frequency.value = isFirstBeat ? 1200 : 800;
                        gainNode.gain.value = isFirstBeat ? 0.5 : 0.3;
                        osc.type = 'sine';
                        break;

                    case 'woodblock':
                        osc.frequency.value = isFirstBeat ? 1500 : 1000;
                        gainNode.gain.value = isFirstBeat ? 0.6 : 0.4;
                        osc.type = 'triangle';
                        break;

                    case 'beep':
                        osc.frequency.value = isFirstBeat ? 880 : 440;
                        gainNode.gain.value = isFirstBeat ? 0.4 : 0.2;
                        osc.type = 'square';
                        break;

                    case 'cowbell':
                        osc.frequency.value = isFirstBeat ? 800 : 540;
                        gainNode.gain.value = isFirstBeat ? 0.5 : 0.35;
                        osc.type = 'square';
                        break;
                }

                osc.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                osc.start(time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
                osc.stop(time + 0.05);
            }`,
        `            playSound(isFirstBeat, time) {
                const ctx = this.audioContext;
                const volume = typeof this.volume === 'number' ? this.volume : 1;

                // 生成一次噪声缓冲，用作每拍的敲击音头
                if (!this.noiseBuffer) {
                    const length = Math.max(1, Math.floor(ctx.sampleRate * 0.05));
                    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < length; i++) {
                        data[i] = (Math.random() * 2 - 1) * (1 - i / length);
                    }
                    this.noiseBuffer = buffer;
                }

                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();

                switch (this.soundType) {
                    case 'click':
                        osc.frequency.value = isFirstBeat ? 1400 : 950;
                        osc.type = 'sine';
                        break;

                    case 'woodblock':
                        osc.frequency.value = isFirstBeat ? 1700 : 1150;
                        osc.type = 'triangle';
                        break;

                    case 'beep':
                        osc.frequency.value = isFirstBeat ? 1000 : 620;
                        osc.type = 'square';
                        break;

                    case 'cowbell':
                        osc.frequency.value = isFirstBeat ? 900 : 620;
                        osc.type = 'square';
                        break;
                }

                const peak = Math.max(0.0002, (isFirstBeat ? 0.9 : 0.65) * volume);
                gainNode.gain.setValueAtTime(0.0001, time);
                gainNode.gain.exponentialRampToValueAtTime(peak, time + 0.003);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                osc.start(time);
                osc.stop(time + 0.14);

                const noise = ctx.createBufferSource();
                noise.buffer = this.noiseBuffer;
                const noiseGain = ctx.createGain();
                const noisePeak = Math.max(0.0002, (isFirstBeat ? 0.55 : 0.38) * volume);
                noiseGain.gain.setValueAtTime(0.0001, time);
                noiseGain.gain.exponentialRampToValueAtTime(noisePeak, time + 0.002);
                noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
                noise.connect(noiseGain);
                noiseGain.connect(ctx.destination);
                noise.start(time);
                noise.stop(time + 0.07);
            }`,
      ],
    ],
  ],
  [
    "training-speed.html",
    [
      [">Speed Training<", ">极速训练<"],
      ["Find and play keys as fast as possible in 60 seconds", "60 秒内尽可能快地找到并弹出琴键"],
      ["🏆 Best:", "🏆 最佳："],
      ["No records yet", "暂无记录"],
      ["Notation:", "记谱方式："],
      [
        "                        English\n                    </button>",
        "                        英文音名\n                    </button>",
      ],
      ["toggleBtn.textContent = 'English';", "toggleBtn.textContent = '英文音名';"],
      ["toggleBtn.textContent = 'German';", "toggleBtn.textContent = '德式音名';"],
      ["toggleBtn.textContent = 'Staff';", "toggleBtn.textContent = '五线谱';"],
      ["🎤 Start Speed Training", "🎤 开始极速训练"],
      ["⏹ Stop Training", "⏹ 停止训练"],
      [">Time Left<", ">剩余时间<"],
      [">Score<", ">得分<"],
      ["Play this note:", "请弹奏这个音："],
      ["Time's Up!", "时间到！"],
      ["Great job!", "太棒了！"],
    ],
  ],
  [
    "training-chord-inversions.html",
    [
      [">Chord Inversions<", ">和弦转位<"],
      [
        "Master all inversions by playing sequences as fast as you can",
        "尽可能快地弹完转位序列，掌握全部转位",
      ],
      ["🏆 Best:", "🏆 最佳："],
      ["No records yet", "暂无记录"],
      ["Notation:", "记谱方式："],
      [
        "                        English\n                    </button>",
        "                        英文音名\n                    </button>",
      ],
      [
        "toggleBtn.textContent = this.notation === 'english' ? 'English' : 'German';",
        "toggleBtn.textContent = this.notation === 'english' ? '英文音名' : '德式音名';",
      ],
      ['<option value="random" selected>🎲 Random Chord</option>', '<option value="random" selected>🎲 随机和弦</option>'],
      ['<optgroup label="Major Chords">', '<optgroup label="大三和弦">'],
      ['<optgroup label="Minor Chords">', '<optgroup label="小三和弦">'],
      ["🎤 Start Training", "🎤 开始训练"],
      ["⏹ Stop Training", "⏹ 停止训练"],
      [">Time<", ">用时<"],
      ["Perfect!", "完美！"],
      ["You've mastered all inversions!", "你已经掌握了全部转位！"],
      [
        "🎲 A random chord will be selected when you start",
        "🎲 开始后会自动选择一个随机和弦",
      ],
    ],
  ],
  [
    "training-play-chord.html",
    [
      [">Play Chord<", ">弹奏和弦<"],
      ["Play all three notes of the displayed chord", "弹出所示和弦的全部三个音"],
      ["🏆 Best:", "🏆 最佳："],
      ["No records yet", "暂无记录"],
      ["🎤 Start Training", "🎤 开始训练"],
      ["⏹ Stop Training", "⏹ 停止训练"],
      [">Time Left<", ">剩余时间<"],
      [">Score<", ">得分<"],
      ["Play this chord:", "请弹奏这个和弦："],
      ["Detected notes:", "检测到的音："],
      ["Time's Up!", "时间到！"],
      ["🏆 New Record!", "🏆 新纪录！"],
      ["Final Score: ", "最终得分："],
    ],
  ],
  [
    "training-find-chords.html",
    [
      [">Find All Chords<", ">找出全部和弦<"],
      ["Build all 7 natural chords in a given key", "在指定调性中构建全部 7 个自然和弦"],
      ["Find all chords in:", "找出该调的全部和弦："],
      [">Chord<", ">和弦<"],
      [">Degree<", ">级数<"],
      [">Notes<", ">音<"],
      [">Roman<", ">罗马数字<"],
      ["Reference Keyboard", "参考键盘"],
      [">e.g., C, Dm, Bdim<", ">例如：C、Dm、Bdim<"],
      [">e.g., C-E-G, D-F-A, B-D-F<", ">例如：C-E-G、D-F-A、B-D-F<"],
      [">e.g., I, ii, vii°<", ">例如：I、ii、vii°<"],
      ["✓ Check Answers", "✓ 检查答案"],
      ["💡 Show Answers", "💡 显示答案"],
      ["🎲 Start New Challenge", "🎲 开始新挑战"],
      [">Hide<", ">隐藏<"],
    ],
  ],
  [
    "chord-progressions.html",
    [
      ["Find chord progressions by mood and key", "按情绪和调性查找和弦进行"],
      [">Root Note:<", ">主音：<"],
      ['<option value="all">All Keys</option>', '<option value="all">全部调性</option>'],
      ['data-filter="all">All</button>', 'data-filter="all">全部</button>'],
      ['data-type="starred">⭐ Starred</button>', 'data-type="starred">⭐ 已收藏</button>'],
      ['data-type="scale">Major</button>', 'data-type="scale">大调</button>'],
      ['data-type="scale">Minor</button>', 'data-type="scale">小调</button>'],
      ['data-type="borrowed">Borrowed Chords</button>', 'data-type="borrowed">借用和弦</button>'],
      ['data-type="mood">Happy</button>', 'data-type="mood">欢快</button>'],
      ['data-type="mood">Uplifting</button>', 'data-type="mood">振奋</button>'],
      ['data-type="mood">Sad</button>', 'data-type="mood">悲伤</button>'],
      ['data-type="mood">Melancholic</button>', 'data-type="mood">忧郁</button>'],
      ['data-type="mood">Dreamy</button>', 'data-type="mood">梦幻</button>'],
      ['data-type="mood">Unsettling</button>', 'data-type="mood">不安</button>'],
      ['data-type="mood">Uncomfortable</button>', 'data-type="mood">紧张</button>'],
      ["🎲 Random Chord Progression", "🎲 随机和弦进行"],
    ],
  ],
  [
    "chord-detail.html",
    [
      ["Add to favorites", "收藏"],
      [">Close<", ">关闭<"],
      ["Loading...", "加载中……"],
      ["Select Key:", "选择调性："],
      ["Notes to Play:", "需要弹奏的音："],
      ["About This Progression:", "关于这个和弦进行："],
      ["Loading description...", "正在加载说明……"],
      ["🎲 Another Random Progression", "🎲 再来一个随机进行"],
    ],
  ],
  [
    "find-note.html",
    [
      ["Find your root note, then explore chord progressions", "找到你的主音，然后探索和弦进行"],
      ["Start Listening", "开始聆听"],
      ["📝 Detected Notes History", "📝 检测历史"],
      ["Detected Note", "检测到的音"],
      ["By Score", "按得分"],
      ["By Order Played", "按演奏顺序"],
      ["Clear History", "清空历史"],
    ],
  ],
  [
    "find-scale.html",
    [
      ["Identify scales from selected notes", "根据所选音符识别音阶"],
      ["Select Notes", "选择音符"],
      ["🗑 Clear All", "🗑 全部清除"],
      ["Click notes to select them manually, or use the microphone below", "点击琴键手动选择音符，也可以使用下方的麦克风"],
      ["No notes selected", "尚未选择音符"],
      ["🎤 Detect Notes", "🎤 检测音符"],
      ["Use your microphone to detect and auto-select notes", "用麦克风检测并自动选中音符"],
      ["🎤 Start Listening", "🎤 开始聆听"],
      ["⏹ Stop Listening", "⏹ 停止聆听"],
      ["Detected Note:", "检测到的音："],
      ["Matching Scales", "匹配的音阶"],
      ["Select notes above to find matching scales", "先在上面选择音符，才能找到匹配的音阶"],
    ],
  ],
  [
    "calculate-chords.html",
    [
      ["From Scale to Keyboard: Step-by-Step Breakdown", "从音阶到键盘：一步一步拆解"],
      ["Choose your root note and chord progression to see the complete breakdown:", "选择主音与和弦进行，查看完整拆解："],
      ["Root Note:", "主音："],
      ["Chord Progression:", "和弦进行："],
      ["Examples: I-IV-V, vi-IV-I-V, i-VI-III-VII (lowercase = minor)", "例如：I-IV-V、vi-IV-I-V、i-VI-III-VII（小写表示小三和弦）"],
      ["💡 Quick Tips", "💡 快速提示"],
      ["Uppercase = Major, Lowercase = Minor:", "大写＝大三和弦，小写＝小三和弦："],
      [
        "Use uppercase Roman numerals (I, IV, V) for major keys, lowercase (i, iv, v) for minor keys",
        "大调用大写罗马数字（I、IV、V），小调用小写（i、iv、v）",
      ],
      ["Auto-detection:", "自动判断："],
      ["The scale type is automatically detected from your first Roman numeral", "程序会根据第一个罗马数字自动判断调式"],
      ["Natural chords", "自然和弦"],
      [
        "(I, ii, iii, IV, V, vi, vii°) use skip-pick-skip-pick from your scale",
        "（I、ii、iii、IV、V、vi、vii°）用“隔一个取一个”的方法从音阶中得到",
      ],
      ["Borrowed chords", "借用和弦"],
      [
        "(like VI instead of vi) use interval formulas and will be highlighted in orange",
        "（例如用 VI 代替 vi）按音程公式构成，会用橙色标出",
      ],
      ["Start simple:", "从简单的开始："],
      [
        "Try I-V-vi-IV in C, or i-VI-III-VII in A - both use all white keys!",
        "试试 C 调的 I-V-vi-IV，或 A 调的 i-VI-III-VII——两者都只用白键！",
      ],
      ["Common major progressions:", "常见大调进行："],
      ["Common minor progressions:", "常见小调进行："],
      ["← Back to Wiki", "← 返回乐理百科"],
      ["Enter a chord progression to see the breakdown!", "输入和弦进行，查看完整推演过程！"],
      [
        "Step 1: Build Your ${scaleTypeName.charAt(0).toUpperCase() + scaleTypeName.slice(1)} Scale Using the Pattern",
        "第 1 步：用音程模式构建${scaleTypeName === 'minor' ? '小调' : '大调'}音阶",
      ],
      ["<p><strong>Start:</strong> ${root} (our root note)</p>", "<p><strong>起点：</strong>${root}（主音）</p>"],
      ["<p><strong>Apply ${patternText}:</strong></p>", "<p><strong>应用音程模式 ${patternText}：</strong></p>"],
      [
        "<strong>Result:</strong> ${root} ${scaleTypeName} scale = ",
        "<strong>结果：</strong>${root} ${scaleTypeName === 'minor' ? '小调' : '大调'}音阶 = ",
      ],
      ["Step 2: Number Your Scale Notes", "第 2 步：给音阶各音编号"],
      [">Position:</td>", ">音级位置：</td>"],
      [">Note:</td>", ">音名：</td>"],
      ["${i + 1}${['st', 'nd', 'rd', 'th', 'th', 'th', 'th'][i]}", "${i + 1}"],
      ["Step 3: Decode the Roman Numerals", "第 3 步：解读罗马数字"],
      [
        "<p><strong>Roman numerals tell you which position to start from!</strong></p>",
        "<p><strong>罗马数字表示从音阶的第几个音开始构建和弦</strong></p>",
      ],
      [
        "const naturalQualities = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];",
        "const naturalQualities = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];\n                    const qualityZh = { major: '大三和弦', minor: '小三和弦', diminished: '减和弦' };",
      ],
      [
        '→ <strong style="color: var(--accent-energetic);">⚠️ Borrowed chord!</strong> Natural chord at position ${position} is ${naturalQuality}, but you want ${requestedQuality}<br>',
        '→ <strong style="color: var(--accent-energetic);">⚠️ 借用和弦！</strong>第 ${position} 级的自然和弦是${qualityZh[naturalQuality]}，而你要的是${qualityZh[requestedQuality]}<br>',
      ],
      [
        "→ Build diminished chord: minor 3rd (3 semitones) + diminished 5th (6 semitones)<br>",
        "→ 构建减和弦：小三度（3 个半音）＋减五度（6 个半音）<br>",
      ],
      [
        "→ Build major chord: major 3rd (4 semitones) + perfect 5th (7 semitones)<br>",
        "→ 构建大三和弦：大三度（4 个半音）＋纯五度（7 个半音）<br>",
      ],
      [
        "→ Build minor chord: minor 3rd (3 semitones) + perfect 5th (7 semitones)<br>",
        "→ 构建小三和弦：小三度（3 个半音）＋纯五度（7 个半音）<br>",
      ],
      [
        "explanation = `→ Skip-pick-skip-pick from ${startNote} in the scale: ${skipPickSteps.join(' - ')}<br>`;",
        "explanation = `→ 在音阶中从 ${startNote} 开始“隔一个取一个”：${skipPickSteps.join(' - ')}<br>`;",
      ],
      [
        "const quality = parsed.isDiminished ? 'Diminished' : (parsed.isMajor ? 'Major' : 'Minor');",
        "const quality = parsed.isDiminished ? 'diminished' : (parsed.isMajor ? 'major' : 'minor');",
      ],
      ["${romanNumeral} (${quality})</strong>", "${romanNumeral}（${qualityZh[quality]}）</strong>"],
      [
        "→ Start at position <strong>${position}</strong> = <strong>${startNote}</strong><br>",
        "→ 从第 <strong>${position}</strong> 级开始 = <strong>${startNote}</strong><br>",
      ],
      [">Play: ${chordNotes.join(' + ')}</strong>", ">弹奏：${chordNotes.join(' + ')}</strong>"],
      [
        '<strong style="color: var(--accent-tense);">Error: Invalid Roman numeral "${romanNumeral}"</strong>',
        '<strong style="color: var(--accent-tense);">错误：无法识别的罗马数字 “${romanNumeral}”</strong>',
      ],
      ["Step 4: Play on Keyboard!", "第 4 步：在键盘上弹奏"],
      [
        "<strong>Your complete progression ${progression.join(' - ')} in ${root} ${scaleTypeName}:</strong>",
        "<strong>完整进行 ${progression.join(' - ')}（${root} ${scaleTypeName === 'minor' ? '小调' : '大调'}）：</strong>",
      ],
      [
        "Press all three notes of each chord at the same time, then move to the next chord!",
        "每个和弦的三个音要同时按下，弹完再换下一个和弦。",
      ],
      ["`(skip ${scale[(parsed.degree + 1) % 7]})`", "`（跳过 ${scale[(parsed.degree + 1) % 7]}）`"],
      ["`(skip ${scale[(parsed.degree + 3) % 7]})`", "`（跳过 ${scale[(parsed.degree + 3) % 7]}）`"],
    ],
  ],
  [
    "wiki.html",
    [
      ["Comprehensive guide to understanding music theory", "系统了解乐理知识的完整指南"],
      ["🎼 Musical Scales (What They Are & Their Uses)", "🎼 音阶（是什么、有什么用）"],
      ["🎹 The Master Pattern (W-W-H-W-W-W-H)", "🎹 核心音程模式（全全半全全全半）"],
      ["Ⅰ Roman Numeral Notation", "Ⅰ 罗马数字记法"],
      ["🎼 The Chromatic Scale (All 12 Notes)", "🎼 半音阶（全部 12 个音）"],
      ["📐 Building Major Scales", "📐 构建大调音阶"],
      ["🔄 Circle of Fifths & Fourths (Same Circle!)", "🔄 五度圈与四度圈（同一个圈）"],
      ["🎯 Relative Pitch (The Trainable Superpower)", "🎯 相对音感（可以练出来的能力）"],
      ["🎵 Building Natural Chords", "🎵 构建自然和弦"],
      ["🔄 Chord Inversions (Umkehrungen)", "🔄 和弦转位"],
      ["🎶 Understanding Natural Chords", "🎶 认识自然和弦"],
      ["🔻 Diminished Chords (vii°, ii°)", "🔻 减和弦（vii°、ii°）"],
      ["🎨 Borrowed Chords (Advanced)", "🎨 借用和弦（进阶）"],
      ["🌙 Minor Scales and Keys", "🌙 小调与调性"],
      ["👻 Ghost Notes (Rhythm Technique)", "👻 幽灵音（节奏技巧）"],
      ["💡 Pro Tips and Practice", "💡 练习建议"],
      ["🎹 Calculate Chords Tool", "🎹 和弦计算工具"],
      ["🎤 Find Your Root Note", "🎤 找你的主音"],
      [
        '<li><a href="wiki-scales.html">',
        '<li><a href="guide.html">🧭 上手引导（第一次用先看这个）</a></li>\n                    <li><a href="wiki-scales.html">',
      ],
    ],
  ],
]);

const problems = [];
const applied = new Map();

for (const file of htmlFiles) {
  let html = await readFile(file, "utf8");
  const before = html;

  for (const [from, to] of globalPairs) {
    if (html.includes(from)) {
      html = html.split(from).join(to);
      applied.set(from, (applied.get(from) ?? 0) + 1);
    }
  }

  for (const [from, to] of titleMap) {
    if (html.includes(from)) {
      html = html.split(from).join(to);
      applied.set(from, (applied.get(from) ?? 0) + 1);
    }
  }

  const pairs = perFilePairs.get(path.basename(file));
  if (pairs) {
    for (const [from, to] of pairs) {
      if (!html.includes(from)) {
        problems.push(`${path.basename(file)} 缺少待替换文本：${from.slice(0, 60)}`);
        continue;
      }
      html = html.split(from).join(to);
      applied.set(from, (applied.get(from) ?? 0) + 1);
    }
  }

  if (html !== before) {
    await writeFile(file, html, "utf8");
  }
}

// 标题汉化：只替换纯文本标题，避免破坏带样式的标题
const headingMap = new Map([
  ["Chord Progressions", "和弦进行"],
  ["Find Note", "找音"],
  ["Find Scale", "找音阶"],
  ["Calculate Chords", "和弦计算"],
  ["Music Theory Wiki", "乐理百科"],
  ["📖 All Topics", "📖 全部主题"],
  ["Fundamentals", "基础入门"],
  ["Chords", "和弦"],
  ["Advanced Topics", "进阶主题"],
  ["Interactive Tools", "互动工具"],
  ["How to Play Chord Progressions", "和弦进行怎么用"],
  ["🎹 THE MASTER PATTERN", "🎹 核心音程模式"],
  ["1. Understanding Roman Numerals", "1. 认识罗马数字"],
  ["2. The Chromatic Scale (All 12 Notes)", "2. 半音阶（全部 12 个音）"],
  ["3. Using the W-W-H-W-W-W-H Pattern", "3. 使用“全全半全全全半”模式"],
  ["Example: C Major Scale", "例：C 大调音阶"],
  ["Example: G Major Scale", "例：G 大调音阶"],
  ["4. Building Natural Chords from Your Scale", "4. 从音阶构建自然和弦"],
  ["The Skip-Pick Formula:", "“隔一个取一个”公式："],
  ["Building Major Chords (I, IV, V)", "构建大三和弦（I、IV、V）"],
  ["Building Minor Chords (ii, iii, vi) - Same Method!", "构建小三和弦（ii、iii、vi）——方法相同！"],
  ["5. Chord Inversions (Umkehrungen)", "5. 和弦转位"],
  ["The Three Positions", "三种位置"],
  ["Understanding Chord Note Names", "理解和弦音名"],
  ["Why Use Inversions?", "为什么要用转位？"],
  ["How to Identify Inversions", "如何判断转位"],
  ["6. Putting It All Together!", "6. 综合运用"],
  ["7. Understanding Natural Chords (Diatonic Chords)", "7. 认识自然和弦（调内和弦）"],
  ["The Natural Chord Pattern in Major Keys", "大调中的自然和弦规律"],
  ["How to Tell If a Chord Is Natural", "如何判断一个和弦是不是自然和弦"],
  ["Why Do We Use Borrowed Chords?", "为什么要用借用和弦？"],
  ['8. What Are Borrowed Chords?', "8. 什么是借用和弦？"],
  ['Why "Borrowed"?', "为什么叫“借用”？"],
  ["How to Play Them", "怎么弹"],
  ["Interval Formulas (For Reference)", "音程公式（供参考）"],
  ["9. Minor Scales - The Other Essential Pattern", "9. 小调音阶——另一个必须掌握的模式"],
  ["Building a Natural Minor Scale", "构建自然小调音阶"],
  ["Relative Major and Minor", "关系大小调"],
  ["When Do I Use Minor?", "什么时候用小调？"],
  ["10. Pro Tips", "10. 练习建议"],
  ["Borrowed Chords", "借用和弦"],
  ["What Are Borrowed Chords?", "什么是借用和弦？"],
  ["Why Use Borrowed Chords?", "为什么要用借用和弦？"],
  ["Related Topics", "相关主题"],
  ["Building Natural Chords", "构建自然和弦"],
  ["Building Natural Chords from Your Scale", "从音阶构建自然和弦"],
  ["Understanding Diminished Chords", "认识减和弦"],
  ["Why Does This Work?", "为什么这样行得通？"],
  ["Building Major Scales", "构建大调音阶"],
  ["Using the W-W-H-W-W-W-H Pattern", "使用“全全半全全全半”模式"],
  ["Why This Pattern Works", "这个模式为什么有效"],
  ["Chord Inversions", "和弦转位"],
  ["Practice with Training Mode!", "用训练模式练习！"],
  ["The Chromatic Scale", "半音阶"],
  ["What is the Chromatic Scale?", "什么是半音阶？"],
  ["Enharmonic Equivalents", "等音"],
  ["The Natural Half Steps", "自然半音"],
  ["Understanding Steps", "理解全音与半音"],
  ["Why 12 Notes?", "为什么是 12 个音？"],
  ["Circle of Fifths & Fourths", "五度圈与四度圈"],
  ["What Is the Circle of Fifths?", "什么是五度圈？"],
  ["How It's Organized", "它是怎么排列的"],
  ["Visual Layout", "视觉布局"],
  ["Sharps and Flats Pattern", "升号与降号的规律"],
  ["Order of Sharps and Flats", "升号与降号的顺序"],
  ["Relative Minor Keys", "关系小调"],
  ["Using the Circle for Chord Progressions", "用五度圈理解和弦进行"],
  ["Modulation (Changing Keys)", "转调"],
  ["Practical Applications", "实际应用"],
  ["How to Memorize the Circle", "如何记住五度圈"],
  ['Why It\'s Called "Fifths"', "为什么叫“五度”"],
  ["The Circle of Fourths", "四度圈"],
  ["Diminished Chords", "减和弦"],
  ["What Are Diminished Chords?", "什么是减和弦？"],
  ["How to Build Diminished Chords", "如何构建减和弦"],
  ['What Makes Them "Diminished"?', "为什么叫“减”？"],
  ["Where Do Diminished Chords Appear?", "减和弦出现在哪里？"],
  ["The Symbol: °", "符号：°"],
  ["How to Use Diminished Chords", "如何使用减和弦"],
  ["Common Uses in Different Genres", "不同风格中的常见用法"],
  ["Building Any Diminished Chord", "构建任意减和弦"],
  ["Why Are They Important?", "它们为什么重要？"],
  ["Ghost Notes", "幽灵音"],
  ["What Are Ghost Notes?", "什么是幽灵音？"],
  ["How to Play Ghost Notes", "怎么演奏幽灵音"],
  ["Notation", "记谱"],
  ["Why Use Ghost Notes?", "为什么要用幽灵音？"],
  ["Where to Use Ghost Notes", "在哪些地方使用"],
  ["Common Patterns", "常见节奏型"],
  ["Listening Examples", "听辨示例"],
  ["Practice Exercise", "练习"],
  ["The Master Pattern", "核心音程模式"],
  ["What Do Whole and Half Mean?", "全音和半音是什么意思？"],
  ["Why This Pattern Matters", "为什么这个模式重要"],
  ["Example: Building the C Major Scale", "例：构建 C 大调音阶"],
  ["Example: Building the G Major Scale", "例：构建 G 大调音阶"],
  ["Visual Pattern on Keyboard", "键盘上的可视化规律"],
  ["Minor Scales and Keys", "小调与调性"],
  ["Minor Scales - The Other Essential Pattern", "小调音阶——另一个必须掌握的模式"],
  ["Example: A Natural Minor Scale", "例：A 自然小调音阶"],
  ["Natural Chords in Minor Keys", "小调中的自然和弦"],
  ["Example: Natural Chords in A Minor", "例：A 小调中的自然和弦"],
  ["Understanding Natural Chords", "认识自然和弦"],
  ["What Are Natural Chords?", "什么是自然和弦？"],
  ["The Natural Chord Pattern", "自然和弦的规律"],
  ["Example: Natural Chords in C Major", "例：C 大调中的自然和弦"],
  ['Why "Natural"?', "为什么叫“自然”？"],
  ["Pro Tips and Practice", "练习建议"],
  ["Pro Tips", "练习建议"],
  ["Practice Tips", "练习方法"],
  ["Learning Strategies", "学习策略"],
  ["Common Mistakes to Avoid", "常见错误"],
  ["Next Steps", "下一步"],
  ["Relative Pitch", "相对音感"],
  ["What Is Relative Pitch?", "什么是相对音感？"],
  ["Relative Pitch vs Perfect Pitch", "相对音感与绝对音感"],
  ["Why Relative Pitch Is Better for Most Musicians", "为什么大多数音乐人更需要相对音感"],
  ["How to Develop Relative Pitch", "如何培养相对音感"],
  ["Common Intervals and How to Remember Them", "常见音程与记忆方法"],
  ["Stages of Relative Pitch Development", "相对音感的发展阶段"],
  ["Real-World Applications", "实际应用"],
  ["Common Challenges and Solutions", "常见困难与解决办法"],
  ["Tools in This App That Develop Relative Pitch", "本应用里能训练相对音感的工具"],
  ["Your First Week of Relative Pitch Training", "相对音感训练的第一周"],
  ["Roman Numeral Notation", "罗马数字记法"],
  ["Understanding Roman Numerals", "认识罗马数字"],
  ["Why Use Roman Numerals?", "为什么要用罗马数字？"],
  ["Common Progressions", "常见进行"],
  ["The Seven Scale Degrees", "七个音级"],
  ["Borrowed Chords (Advanced)", "借用和弦（进阶）"],
  ["Musical Scales", "音阶"],
  ["What Is a Scale?", "什么是音阶？"],
  ["The Major Scale Pattern", "大调音阶模式"],
  ["Why Are Scales Important?", "音阶为什么重要？"],
  ["Common Scale Types", "常见音阶类型"],
  ["How Scales Build Chords", "音阶如何构成和弦"],
  ["What Scales Are Used For", "音阶的用途"],
  ["Scale Degrees & Their Functions", "音级及其功能"],
  ["Practice with Scales", "练习音阶"],
]);

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const replaced = html.replace(/<(h[123])([^>]*)>([\s\S]*?)<\/\1>/g, (match, tag, attrs, inner) => {
    if (inner.includes("<")) return match;
    const text = inner.replace(/\s+/g, " ").trim();
    const zh = headingMap.get(text);
    if (!zh) return match;
    return `<${tag}${attrs}>${zh}</${tag}>`;
  });
  if (replaced !== html) await writeFile(file, replaced, "utf8");
}

const chordOptionsPath = path.join(target, "training-chord-inversions.html");
const chordOptions = await readFile(chordOptionsPath, "utf8");
const chordOptionsZh = chordOptions
  .replace(/>([A-G]#?) Major</g, ">$1 大三和弦<")
  .replace(/>([A-G]#?) Minor</g, ">$1 小三和弦<");
await writeFile(chordOptionsPath, chordOptionsZh, "utf8");

// 所有页面导航栏加入“节奏训练”入口（兼容两套导航写法）
const navRegex = /(<nav class="main-nav">)([\s\S]*?)(<\/nav>)/;

function addNavLink(inner) {
  if (inner.includes("rhythm-training.html")) return inner;

  const lines = inner.split("\n");
  const metronomeIndex = lines.findIndex(
    (line) => line.includes("metronome.html") && line.includes("nav-link")
  );
  const progressionIndex = lines.findIndex(
    (line) => line.includes("chord-progressions.html") && line.includes("nav-link")
  );
  const insertAfter = metronomeIndex >= 0 ? metronomeIndex : progressionIndex;
  if (insertAfter < 0) {
    // 少数页面导航栏是空的，这里补全为完整导航
    const indent = "        ";
    const fullNav = [
      `${indent}<a href="training.html" class="nav-link">🎮 训练</a>`,
      `${indent}<a href="chord-progressions.html" class="nav-link">📖 和弦进行</a>`,
      `${indent}<a href="metronome.html" class="nav-link">⏱️ 节拍器</a>`,
      `${indent}<a href="rhythm-training.html" class="nav-link">🥁 节奏训练</a>`,
      `${indent}<a href="find-note.html" class="nav-link">🎤 找音</a>`,
      `${indent}<a href="find-scale.html" class="nav-link">🎼 找音阶</a>`,
      `${indent}<a href="wiki.html" class="nav-link">📚 乐理百科</a>`,
    ];
    return "\n" + fullNav.join("\n") + inner;
  }

  const indent = (lines[insertAfter].match(/^\s*/) || [""])[0];
  const additions = [];
  if (metronomeIndex < 0) {
    additions.push(`${indent}<a href="metronome.html" class="nav-link">⏱️ 节拍器</a>`);
  }
  additions.push(`${indent}<a href="rhythm-training.html" class="nav-link">🥁 节奏训练</a>`);
  lines.splice(insertAfter + 1, 0, ...additions);
  return lines.join("\n");
}

for (const file of htmlFiles) {
  let html = await readFile(file, "utf8");
  const before = html;
  if (navRegex.test(html)) {
    html = html.replace(navRegex, (match, open, inner, close) => open + addNavLink(inner) + close);
  }
  if (html !== before) await writeFile(file, html, "utf8");
}

// 少数百科页面顶部导航为空标签，这里补全
const emptyNav = '    <nav class="main-nav">\n\n';
const fullNavBlock = [
  '        <a href="training.html" class="nav-link">🎮 训练</a>',
  '        <a href="chord-progressions.html" class="nav-link">📖 和弦进行</a>',
  '        <a href="metronome.html" class="nav-link">⏱️ 节拍器</a>',
  '        <a href="rhythm-training.html" class="nav-link">🥁 节奏训练</a>',
  '        <a href="find-note.html" class="nav-link">🎤 找音</a>',
  '        <a href="find-scale.html" class="nav-link">🎼 找音阶</a>',
  '        <a href="wiki.html" class="nav-link">📚 乐理百科</a>',
].join("\n");

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (html.includes(emptyNav)) {
    await writeFile(file, html.replace(emptyNav, '    <nav class="main-nav">\n' + fullNavBlock + "\n\n"), "utf8");
  }
}

// 和弦练习页只保留和弦相关模块，节奏闯关由左侧导航单独进入

// 品牌主题：功能重命名、应用外壳、加载自定义配色
const renames = [
  // 页面标题
      ["<title>训练 - 乐感工坊</title>", "<title>和弦练习 - 乐感工坊</title>"],
  ["<title>极速训练 - 乐感工坊</title>", "<title>60 秒速弹 - 乐感工坊</title>"],
  ["<title>和弦转位 - 乐感工坊</title>", "<title>转位闯关 - 乐感工坊</title>"],
  ["<title>弹奏和弦 - 乐感工坊</title>", "<title>和弦弹奏 - 乐感工坊</title>"],
  ["<title>找出全部和弦 - 乐感工坊</title>", "<title>调内和弦挑战 - 乐感工坊</title>"],
  ["<title>节奏训练 - 乐感工坊</title>", "<title>节奏闯关 - 乐感工坊</title>"],
  ["<title>节拍器 - 乐感工坊</title>", "<title>节拍基准 - 乐感工坊</title>"],
  ["<title>和弦进行 - 乐感工坊</title>", "<title>进行曲库 - 乐感工坊</title>"],
  ["<title>和弦详情 - 乐感工坊</title>", "<title>进行详解 - 乐感工坊</title>"],
  ["<title>找音 - 乐感工坊</title>", "<title>音高识别 - 乐感工坊</title>"],
  ["<title>找音阶 - 乐感工坊</title>", "<title>音阶识别 - 乐感工坊</title>"],
  ["<title>和弦计算 - 乐感工坊</title>", "<title>和弦推演 - 乐感工坊</title>"],
  ["<title>使用指南 - 乐感工坊</title>", "<title>上手引导 - 乐感工坊</title>"],
  [" - 乐理百科</title>", " - 乐理手册</title>"],
  // 页面主标题
      [">训练模式<", ">和弦练习<"],
  [">极速训练<", ">60 秒速弹<"],
  [">和弦转位<", ">转位闯关<"],
  [">弹奏和弦<", ">和弦弹奏<"],
  [">找出全部和弦<", ">调内和弦挑战<"],
  [">节奏训练<", ">节奏闯关<"],
  [">节拍器<", ">节拍基准<"],
  [">和弦进行<", ">进行曲库<"],
  [">找音<", ">音高识别<"],
  [">找音阶<", ">音阶识别<"],
  [">和弦计算<", ">和弦推演<"],
  [">乐理百科<", ">乐理手册<"],
  // 导航文字
  ["🎮 训练</a>", "🎮 练习中心</a>"],
  ["📖 和弦进行</a>", "🎼 进行曲库</a>"],
  ["🎵 和弦进行</a>", "🎼 进行曲库</a>"],
  ["⏱️ 节拍器</a>", "⏱️ 节拍基准</a>"],
  ["🥁 节奏训练</a>", "🥁 节奏闯关</a>"],
  ["🎤 找音</a>", "🎤 音高识别</a>"],
  ["🎼 找音阶</a>", "🪜 音阶识别</a>"],
  ["📚 乐理百科</a>", "📚 乐理手册</a>"],
  // 练习中心卡片与正文里的功能名
  ["🔄 和弦转位", "🔄 转位闯关"],
  ["⚡ 极速训练", "⚡ 60 秒速弹"],
  ["🎸 弹奏和弦", "🎸 和弦弹奏"],
  ["🎹 找出全部和弦", "🎹 调内和弦挑战"],
  ["🥁 节奏训练", "🥁 节奏闯关"],
  ["乐理百科", "乐理手册"],
  ["节奏训练", "节奏闯关"],
];

const NAV_GROUPS = [
  {
    label: "练习",
    items: [
      { href: "rhythm-training.html", icon: "🥁", text: "节奏闯关" },
      { href: "score-training.html", icon: "🎼", text: "视奏训练" },
      { href: "theory-practice.html", icon: "🎓", text: "乐理考题" },
      { href: "training.html", icon: "🎹", text: "和弦练习" },
    ],
  },
  {
    label: "工具",
    items: [
      { href: "metronome.html", icon: "⏱️", text: "节拍基准" },
      { href: "chord-progressions.html", icon: "🎼", text: "进行曲库" },
      { href: "find-note.html", icon: "🎤", text: "音高识别" },
      { href: "find-scale.html", icon: "🪜", text: "听音辨调" },
      { href: "calculate-chords.html", icon: "🧮", text: "和弦找音" },
    ],
  },
  {
    label: "知识",
    items: [{ href: "wiki.html", icon: "📚", text: "乐理手册" }],
  },
  {
    label: "教学",
    items: [
      { href: "class-manage.html", icon: "👩‍🏫", text: "班级管理" },
      { href: "homework.html", icon: "📝", text: "作业布置" },
      { href: "pretest-report.html", icon: "📊", text: "前后测报告" },
      { href: "data-backup.html", icon: "🗄️", text: "数据备份" },
    ],
  },
];

function activeHrefFor(fileName) {
  if (!fileName) return "";
  if (fileName === "home.html") return "home.html";
  if (fileName.startsWith("training")) return "training.html";
  if (fileName === "chord-detail.html") return "chord-progressions.html";
  if (fileName.startsWith("wiki")) return "wiki.html";
  return fileName;
}

function buildNav(fileName) {
  const active = activeHrefFor(fileName);
  const lines = ['    <nav class="main-nav">'];
  lines.push('        <a href="home.html" class="nav-brand">🎵 音感觉醒</a>');
  for (const group of NAV_GROUPS) {
    lines.push(`        <div class="lg-cap">${group.label}</div>`);
    for (const item of group.items) {
      const cls = item.href === active ? "nav-link active" : "nav-link";
      lines.push(`        <a href="${item.href}" class="${cls}">${item.icon} ${item.text}</a>`);
    }
  }
  lines.push("    </nav>");
  // 导航一出现在页面上就恢复它上次的滚动位置，避免页面画完后再跳动（会闪一下）
  lines.push(`    <script>
        (function () {
            try {
                var nav = document.querySelector(".main-nav");
                var saved = window.sessionStorage.getItem("lg-nav-scroll");
                if (nav && saved !== null) nav.scrollTop = Number(saved) || 0;
            } catch (error) {
                /* 存储不可用时忽略 */
            }
        })();
    </script>`);
  return lines.join("\n");
}

function applyShell(html, fileName) {
  // 先统一品牌名，后续的重命名规则才能匹配到最终标题
  let out = html.split("和弦训练室").join("乐感工坊");

  for (const [from, to] of renames) {
    if (out.includes(from)) out = out.split(from).join(to);
  }

  // 品牌定名：音感觉醒
  out = out.split("乐感工坊").join("音感觉醒");

  // 统一重建左侧导航，保证每个页面的入口完全一致
  out = out.replace(
    /<nav class="main-nav">[\s\S]*?(?:<\/nav>|(?=<div class="(?:guide-container|builder-container|detail-container|note-container|container)"))/,
    buildNav(fileName)
  );
  out = out.replace(/<nav class="main-nav">\s*<\/nav>/g, "");
  if (!out.includes('href="theme.css"')) {
    out = out.replace(
      "</head>",
      '    <link rel="stylesheet" href="theme.css">\n    <link rel="icon" href="icons/icon-192.png">\n    <link rel="apple-touch-icon" href="icons/icon-192.png">\n</head>'
    );
  }
  if (!out.includes("serviceWorker.register")) {
    const swScript = `    <script>
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", function () {
                navigator.serviceWorker.register("sw.js").catch(function () {});
            });
        }
    </script>
`;
    if (out.includes("</body>")) {
      out = out.replace("</body>", swScript + "</body>");
    } else {
      // 原项目有两个百科页面文件本身没有结尾标签，这里补齐结构
      out = out + "\n" + swScript + "</body>\n</html>\n";
    }
  }

  if (!out.includes("modes.js")) {
    const headExtras = `    <script>
        (function () {
            try {
                var saved = JSON.parse(localStorage.getItem("lg-modes") || "{}");
                var root = document.documentElement;
                if (saved.light) root.classList.add("lg-light");
                if (saved.focus) root.classList.add("lg-focus");
                if (saved.large) root.classList.add("lg-large");
            } catch (error) {}
        })();
    </script>
    <script src="modes.js" defer></script>
`;
    if (out.includes("</head>")) {
      out = out.replace("</head>", headExtras + "</head>");
    }
  }

  if (!out.includes("ui-controls.js")) {
    out = out.replace("</head>", '    <script src="ui-controls.js" defer></script>\n</head>');
  }

  if (!out.includes("piano-tone.js")) {
    out = out.replace("</head>", '    <script src="piano-tone.js"></script>\n</head>');
  }

  if (!out.includes("scroll-guard.js")) {
    out = out.replace("</head>", '    <script src="scroll-guard.js" defer></script>\n</head>');
  }

  // 需要在乐器上作答的三个练习页面，加入屏幕虚拟键盘
  const virtualKeyboardPages = new Set([
    "training-speed.html",
    "training-chord-inversions.html",
    "training-play-chord.html",
  ]);
  if (fileName && virtualKeyboardPages.has(fileName) && !out.includes("virtual-keyboard.js")) {
    out = out.replace("</head>", '    <script src="virtual-keyboard.js" defer></script>\n</head>');
  }
  return out;
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const decorated = applyShell(html, path.basename(file));
  if (decorated !== html) await writeFile(file, decorated, "utf8");
}

const manifestFile = path.join(target, "manifest.json");
const manifestJson = JSON.parse(await readFile(manifestFile, "utf8"));
manifestJson.name = "音感觉醒 - 音乐能力训练与测评";
manifestJson.short_name = "音感觉醒";
manifestJson.description = "练耳、乐理、节拍与节奏训练的本地音乐学习工具";
manifestJson.start_url = "home.html";
manifestJson.background_color = "#0b0f14";
manifestJson.theme_color = "#0b0f14";
manifestJson.icons = [
  { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
];
await writeFile(manifestFile, JSON.stringify(manifestJson, null, 2), "utf8");

// 复制品牌主题与节奏训练模块
await cp("work/theme.css", path.join(target, "theme.css"), { force: true });
await cp("work/sw.js", path.join(target, "sw.js"), { force: true });
await cp("work/modes.js", path.join(target, "modes.js"), { force: true });
await cp("work/ui-controls.js", path.join(target, "ui-controls.js"), { force: true });
await cp("work/piano-tone.js", path.join(target, "piano-tone.js"), { force: true });
await cp("work/virtual-keyboard.js", path.join(target, "virtual-keyboard.js"), { force: true });
await cp("work/scroll-guard.js", path.join(target, "scroll-guard.js"), { force: true });
async function copyWithCrlf(sourceFile, targetFile) {
  const content = await readFile(sourceFile, "utf8");
  await writeFile(targetFile, content.replace(/\r?\n/g, "\r\n"), "utf8");
}

await copyWithCrlf("work/启动应用.bat", path.join(target, "启动应用.bat"));
await copyWithCrlf("work/启动全屏.bat", path.join(target, "启动全屏.bat"));
await copyWithCrlf("work/启动.bat", path.join(target, "启动.bat"));
await copyWithCrlf("work/停止服务.bat", path.join(target, "停止服务.bat"));
await copyWithCrlf("work/server.ps1", path.join(target, "server.ps1"));
const rhythmHtml = applyShell(await readFile("work/rhythm-training.html", "utf8"), "rhythm-training.html");
await writeFile(path.join(target, "rhythm-training.html"), rhythmHtml, "utf8");

// 新首页工作台
const homeHtml = applyShell(await readFile("work/home.html", "utf8"), "home.html");
await writeFile(path.join(target, "home.html"), homeHtml, "utf8");

// 视奏训练模块
const scoreHtml = applyShell(await readFile("work/score-training.html", "utf8"), "score-training.html");
await writeFile(path.join(target, "score-training.html"), scoreHtml, "utf8");

// 听音辨调（原音阶识别页改造成训练模块）
const earHtml = applyShell(await readFile("work/find-scale.html", "utf8"), "find-scale.html");
await writeFile(path.join(target, "find-scale.html"), earHtml, "utf8");

// 和弦找音（原和弦推演页改造成训练模块）
const chordHtml = applyShell(await readFile("work/calculate-chords.html", "utf8"), "calculate-chords.html");
await writeFile(path.join(target, "calculate-chords.html"), chordHtml, "utf8");

// 班级管理（教师端）
const classHtml = applyShell(await readFile("work/class-manage.html", "utf8"), "class-manage.html");
await writeFile(path.join(target, "class-manage.html"), classHtml, "utf8");

// 数据备份与迁移（教师端）
const backupHtml = applyShell(await readFile("work/data-backup.html", "utf8"), "data-backup.html");
await writeFile(path.join(target, "data-backup.html"), backupHtml, "utf8");

// 乐理练习（学生端）
const theoryHtml = applyShell(await readFile("work/theory-practice.html", "utf8"), "theory-practice.html");
await writeFile(path.join(target, "theory-practice.html"), theoryHtml, "utf8");

// 作业布置（教师端，含学生查看）
const hwHtml = applyShell(await readFile("work/homework.html", "utf8"), "homework.html");
await writeFile(path.join(target, "homework.html"), hwHtml, "utf8");

// 前后测报告（教师端）
const prHtml = applyShell(await readFile("work/pretest-report.html", "utf8"), "pretest-report.html");
await writeFile(path.join(target, "pretest-report.html"), prHtml, "utf8");

// 乐理手册与上手引导：统一用中文内容重新生成
for (const page of PAGES) {
  const html = applyShell(renderPage(page), page.file);
  await writeFile(path.join(target, page.file), html, "utf8");
}

// 手册目录页用词修正：训练模块改名后，目录里的名称要恢复成音乐术语
const wikiIndexPath = path.join(target, "wiki.html");
const wikiIndex = await readFile(wikiIndexPath, "utf8");
await writeFile(
  wikiIndexPath,
  wikiIndex
    .split("🔄 转位闯关</a>")
    .join("🔄 和弦转位</a>")
    .split("🎹 和弦计算工具</a>")
    .join("🧮 和弦推演</a>")
    .split("🎤 找你的主音</a>")
    .join("🎤 音高识别</a>"),
  "utf8"
);

// 手册里讲“和弦转位”的文章，标题不应被训练模块的重命名带走
const wikiChordInversionsPath = path.join(target, "wiki-chord-inversions.html");
const wikiChordInversions = await readFile(wikiChordInversionsPath, "utf8");
await writeFile(
  wikiChordInversionsPath,
  wikiChordInversions
    .split("<title>转位闯关 - 乐感工坊</title>").join("<title>和弦转位 - 乐感工坊</title>")
    .split('font-size: 1.7rem;">转位闯关</h1>').join('font-size: 1.7rem;">和弦转位</h1>'),
  "utf8"
);

// 进行曲库：和弦进行的中文名称与说明
const chordDataPath = path.join(target, "chord-data.js");
const chordData = await readFile(chordDataPath, "utf8");
let pendingZh = null;
const chordDataZh = chordData
  .split("\n")
  .map((line) => {
    const nameMatch = line.match(/^(\s*)name: "([^"]+)",\s*$/);
    if (nameMatch) {
      const entry = CHORD_ZH[nameMatch[2]];
      pendingZh = entry ?? null;
      return entry ? line.replace(`"${nameMatch[2]}"`, `"${entry.name}"`) : line;
    }
    if (pendingZh && /^\s*description: "/.test(line)) {
      const replaced = line.replace(/description: "[^"]*"/, `description: "${pendingZh.desc}"`);
      pendingZh = null;
      return replaced;
    }
    return line;
  })
  .join("\n");
await writeFile(chordDataPath, chordDataZh, "utf8");

// 首页跳转：打开根地址时进入工作台
const indexPath = path.join(target, "index.html");
const indexHtml = await readFile(indexPath, "utf8");
await writeFile(
  indexPath,
  indexHtml
    .split("training.html")
    .join("home.html")
    .replace("window.location.href = lastPage;", 'window.location.href = "home.html";'),
  "utf8"
);

console.log(`已生成 ${target}`);
console.log(`共处理 ${htmlFiles.length} 个 HTML 页面`);
if (problems.length) {
  console.log("\n以下文本没有找到，需要人工确认：");
  for (const problem of problems) console.log("- " + problem);
} else {
  console.log("所有计划替换的文本都已命中。");
}
