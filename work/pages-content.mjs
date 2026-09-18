/**
 * 乐理手册与上手引导的中文内容。
 * 每个页面由 build-cn.mjs 渲染成 html，并统一套用导航与主题。
 */

export const PAGES = [
  {
    file: "guide.html",
    icon: "🧭",
    title: "上手引导",
    intro: "第一次使用乐感工坊，按这个顺序走一遍就够了",
    sections: [
      {
        h2: "这个软件能做什么",
        paras: [
          "乐感工坊把音乐训练中经常用到的几件事放在一起：跟节拍练节奏、听辨音高与音阶、认识和弦与和弦进行、随时查乐理知识。",
          "它在本机运行，不需要联网，也不需要注册账号；练习成绩保存在你自己的电脑上。",
        ],
      },
      {
        h2: "界面结构",
        paras: ["左侧导航分为三组，点击即可切换；右下角有“模式”和“全屏”两个按钮。"],
        bullets: [
          "练习：节奏闯关、和弦练习（含转位、速弹、和弦弹奏、调内和弦四个子练习）",
          "工具：节拍基准、进行曲库、音高识别、音阶识别、和弦推演",
          "知识：乐理手册",
        ],
      },
      {
        h2: "建议的使用顺序",
        bullets: [
          "第一步：打开“节拍基准”，把速度调到 60 到 80，跟着节拍器拍手，先感受稳定的拍子。",
          "第二步：进入“节奏闯关”，选择四分音符，允许麦克风后跟着敲击，看自己的准确率和偏差。",
          "第三步：到“和弦练习”里做几轮转位或速弹，熟悉琴键位置。",
          "第四步：用“音高识别”和“音阶识别”做听辨练习，用“和弦推演”理解和弦是怎么来的。",
          "第五步：遇到不懂的概念，随时打开“乐理手册”查阅。",
        ],
      },
      {
        h2: "课堂投影怎么用",
        paras: [
          "点击右下角“模式”，可以同时打开浅色模式和大屏模式，适合明亮的教室；再点“全屏”，画面就没有浏览器边框了。",
          "如果希望切换模块时保持全屏，请用桌面上的“乐感工坊（全屏）”图标启动。",
        ],
      },
      {
        h2: "练习数据",
        paras: [
          "节奏闯关会记录每次练习的时间、速度、拍号、节奏型、准确率与平均偏差，最多保留三十条。",
          "点击“导出 CSV”可以把记录保存成表格文件，用 Excel 打开后即可做统计，适合课堂前后测的数据分析。",
        ],
      },
      {
        tip: "戴耳机练习可以让节拍声不被麦克风收进去，判定会更准确；使用蓝牙耳机时，记得用“延迟校准”抵消延迟。",
      },
    ],
  },
  {
    file: "wiki-master-pattern.html",
    icon: "🎹",
    title: "核心音程模式",
    intro: "全全半全全全半，这一条串起了音阶、和弦与调性",
    sections: [
      {
        h2: "先认识全音与半音",
        paras: [
          "半音是音与音之间最小的距离，钢琴上相邻的两个键（包括黑键）就是一个半音，例如 E 到 F、B 到 C、C 到 C#。",
          "两个半音合起来是一个全音，例如 C 到 D、D 到 E。",
        ],
      },
      {
        h2: "大调音阶的模式",
        paras: ["从任意一个音出发，按“全 全 半 全 全 全 半”的顺序往上走，得到的就是大调音阶。"],
        example: "C 大调：C → D → E → F → G → A → B → C（E-F 与 B-C 之间是半音，其余是全音）",
      },
      {
        h2: "换一个主音试试",
        example: "G 大调：G → A → B → C → D → E → F# → G（为了满足模式，第七个音要升高半音）",
        paras: ["这就是为什么不同的调会有不同数量的升号或降号。"],
      },
      {
        h2: "为什么它重要",
        bullets: [
          "所有大调音阶都由它推导出来，调号也由此确定。",
          "大调中的七个自然和弦（I ii iii IV V vi vii°）来自这条音阶。",
          "理解了模式，就不需要死记每个调的音，可以随时推算。",
        ],
      },
    ],
  },
  {
    file: "wiki-building-scales.html",
    icon: "📐",
    title: "构建大调音阶",
    intro: "用一条模式，从任何音出发都能推出正确的大调",
    sections: [
      {
        h2: "三个步骤",
        bullets: [
          "第一步：确定主音，也就是音阶的第一个音。",
          "第二步：按“全 全 半 全 全 全 半”依次向上走。",
          "第三步：检查音级之间是否与该模式一致，不一致就加上升号或降号。",
        ],
      },
      {
        h2: "示例",
        example: "D 大调：D → E → F# → G → A → B → C# → D",
        paras: ["如果没有把 F 升到 F#、C 升到 C#，音程关系就不是全全半全全全半了。"],
      },
      {
        h2: "练习建议",
        paras: [
          "每天挑一个调，在键盘上从主音走到高八度，边走边说出音名。",
          "熟练后换成不看键盘，先在心里推算，再用手验证。",
        ],
      },
    ],
  },
  {
    file: "wiki-chromatic-scale.html",
    icon: "🎼",
    title: "半音阶",
    intro: "把相邻半音的十二个音全部排开",
    sections: [
      {
        h2: "十二个音",
        example: "C → C# → D → D# → E → F → F# → G → G# → A → A# → B → C",
        paras: ["每个音之间都相隔一个半音，一共十二个，走完回到起点正好是一个八度。"],
      },
      {
        h2: "等音",
        paras: ["同一个音高可以用两种写法表示，这叫作等音。例如 C# 与 Db 在键盘上是同一个键，A# 与 Bb 也是。"],
      },
      {
        h2: "自然半音在哪里",
        paras: [
          "E 到 F、B 到 C 之间本来就是半音，不需要黑键，这两处称为自然半音。",
          "掌握它们的位置，能帮助你快速判断键盘上的音名。",
        ],
      },
      {
        h2: "为什么是十二个",
        paras: ["西方音乐把一个八度平均分成十二份，每份一个半音即十二平均律。这样转调时音准关系保持一致，乐器也能通用。"],
      },
    ],
  },
  {
    file: "wiki-circle-of-fifths.html",
    icon: "🔄",
    title: "五度圈",
    intro: "把十二个调排成一个圆，调号与关系调一眼看清",
    sections: [
      {
        h2: "怎么排的",
        paras: ["从 C 出发，每次向上走纯五度，就得到升号方向的调；向下走纯五度，则得到降号方向的调。"],
        example: "升号方向：C → G → D → A → E → B → F#；降号方向：C → F → Bb → Eb → Ab → Db → Gb",
      },
      {
        h2: "升号与降号的顺序",
        bullets: [
          "升号顺序：F# → C# → G# → D# → A# → E# → B#",
          "降号顺序：Bb → Eb → Ab → Db → Gb → Cb → Fb",
          "调号里出现几个升号，就按顺序取前几个。",
        ],
      },
      {
        h2: "关系小调",
        paras: ["每个大调都有一个关系小调，它们使用相同的音与调号。小调主音就在大调主音的下方小三度，例如 C 大调与 a 小调。"],
      },
      {
        h2: "有什么用",
        bullets: [
          "快速判断调号，不用逐个音去数。",
          "理解和弦进行中为什么会用到某些和弦。",
          "转调时，找相邻的调最容易自然衔接。",
        ],
      },
    ],
  },
  {
    file: "wiki-relative-pitch.html",
    icon: "🎯",
    title: "相对音感",
    intro: "把音听成调里的角色，而不是孤立的音高",
    sections: [
      {
        h2: "什么是相对音感",
        paras: [
          "相对音感指在明确的调性中辨认每个音的功能，也就是听出一个音是 do、re 还是 mi，是稳定还是需要解决。",
          "它和绝对音感不同：绝对音感要求直接说出音名，相对音感依赖参照音，绝大多数人都可以通过训练获得。",
        ],
      },
      {
        h2: "为什么先练它",
        bullets: [
          "实际演奏中，我们更多是在判断音与音之间的关系。",
          "转调、听和弦、听旋律，依靠的都是相对音感。",
          "训练路径清晰，进步可以被测量。",
        ],
      },
      {
        h2: "怎么练",
        bullets: [
          "先建立主音：听一段 I-IV-V-I 的终止式，让耳朵记住这个调的中心。",
          "判断音级：听一个音，先判断它与主音的关系。",
          "唱出来再验证：把判断的音唱出来，用软件的“音高识别”对照。",
          "逐步加难：从主音与三音、五音开始，再到完整音阶，最后加入变化音。",
        ],
        tip: "每天十分钟比周末练一小时更有效；错误要当场纠正，让耳朵建立正确印象。",
      },
    ],
  },
  {
    file: "wiki-building-chords.html",
    icon: "🎵",
    title: "构建自然和弦",
    intro: "隔一个取一个，从音阶里直接取和弦",
    sections: [
      {
        h2: "隔一个取一个",
        paras: ["从音阶的某个音出发，隔一个音取一个，连续取三个音就构成一个三和弦，也就是 1、3、5 三个音级。"],
        example: "C 大调音阶 C D E F G A B：从 C 出发取 C、E、G，得到 C 大三和弦",
      },
      {
        h2: "三种常见性质",
        bullets: [
          "大三和弦：根音 + 大三度 + 纯五度（4 个半音 + 3 个半音），例如 C-E-G",
          "小三和弦：根音 + 小三度 + 纯五度（3 个半音 + 4 个半音），例如 A-C-E",
          "减和弦：根音 + 小三度 + 减五度（3 个半音 + 3 个半音），例如 B-D-F",
        ],
      },
      {
        h2: "大调里的七个自然和弦",
        example: "C 大调：C、Dm、Em、F、G、Am、Bdim，对应 I ii iii IV V vi vii°",
        paras: ["它们全部由音阶内的音构成，所以在歌曲里出现得最多。"],
      },
    ],
  },
  {
    file: "wiki-chord-inversions.html",
    icon: "🔄",
    title: "和弦转位",
    intro: "同一个和弦，换一个低音，连接就更顺",
    sections: [
      {
        h2: "三种位置",
        bullets: [
          "原位：根音在最低处，例如 C-E-G。",
          "第一转位：三音在最低处，例如 E-G-C。",
          "第二转位：五音在最低处，例如 G-C-E。",
        ],
        paras: ["三种位置用到的音完全相同，只是排列顺序不同，因此听起来功能相同、色彩略有差别。"],
      },
      {
        h2: "为什么要用转位",
        bullets: [
          "让低音线条更平滑，避免大幅跳跃。",
          "伴奏时减少手部移动，弹奏更轻松。",
          "为旋律让步，让内声部更自然。",
        ],
      },
      {
        h2: "如何判断转位",
        paras: ["看最低音是哪一个：最低音是根音就是原位，是三音就是第一转位，是五音就是第二转位。"],
        example: "C 和弦：C 在最低 → 原位；E 在最低 → 第一转位；G 在最低 → 第二转位",
      },
      {
        h2: "练习方法",
        paras: ["在“和弦练习”里打开“转位闯关”，选择一个和弦，按提示依次弹出原位、第一转位与第二转位，程序会记录用时并给出最佳成绩。"],
      },
    ],
  },
  {
    file: "wiki-natural-chords.html",
    icon: "🎶",
    title: "认识自然和弦",
    intro: "只用音阶里的音构成的和弦",
    sections: [
      {
        h2: "定义",
        paras: ["如果一个和弦的所有音都在当前调的音阶内，它就是自然和弦，也叫调内和弦。"],
      },
      {
        h2: "大调中的固定模式",
        example: "I 大三 · ii 小三 · iii 小三 · IV 大三 · V 大三 · vi 小三 · vii° 减三",
        paras: ["这个“大小小大大小”的顺序在所有大调中都成立，只是音名不同。"],
      },
      {
        h2: "怎么判断",
        bullets: [
          "把和弦的三个音与调的音阶对照，都在音阶内就是自然和弦。",
          "如果出现了音阶外的音，通常是从同主音小调借来的和弦。",
          "用“和弦推演”可以逐步查看每个和弦的构成音。",
        ],
      },
    ],
  },
  {
    file: "wiki-diminished-chords.html",
    icon: "🔻",
    title: "减和弦",
    intro: "听起来紧张，负责把音乐推回主和弦",
    sections: [
      {
        h2: "结构",
        paras: ["减和弦由根音、小三度与减五度组成，音程是两个小三度叠置，符号是 °。"],
        example: "B 减和弦：B-D-F（B→D 三个半音，D→F 三个半音）",
      },
      {
        h2: "出现在哪里",
        bullets: ["大调音阶的第七级，例如 C 大调中的 Bdim（vii°）。", "自然小调音阶的第二级，例如 a 小调中的 Bdim（ii°）。"],
      },
      {
        h2: "怎么用",
        paras: [
          "减和弦有强烈的倾向性，常放在主和弦前面作为过渡，形成 vii° → I 的进行。",
          "在流行与爵士中，它也常作为经过和弦，让低音线条更连贯。",
        ],
      },
    ],
  },
  {
    file: "wiki-borrowed-chords.html",
    icon: "🎨",
    title: "借用和弦",
    intro: "从同主音小调借来的和弦，给音乐增加色彩",
    sections: [
      {
        h2: "什么是借用和弦",
        paras: ["借用和弦指不属于当前调的自然和弦，通常是从同主音的小调（或大调）中借来的，因此也叫调式交替和弦。"],
      },
      {
        h2: "常见的几个",
        bullets: ["bVII：在 C 大调中是 Bb 和弦，常用于摇滚与流行。", "bVI：Ab 和弦，色彩柔和。", "iv：把原来的 IV 换成小三和弦，情绪立刻变得忧郁。", "bIII：Eb 和弦，常用于转调。"],
      },
      {
        h2: "怎么弹",
        paras: ["借用和弦的构成音不在原调音阶内，所以不能再用“隔一个取一个”的方法，需要按音程公式计算，例如大三和弦是 4 + 3 个半音。"],
        tip: "在“和弦推演”里输入包含借用和弦的进行，程序会用橙色标出并说明它的构成方式。",
      },
    ],
  },
  {
    file: "wiki-minor-scales.html",
    icon: "🌙",
    title: "小调音阶",
    intro: "与大调相对的另一种常用音阶",
    sections: [
      {
        h2: "自然小调的模式",
        paras: ["从主音出发，按“全 半 全 全 半 全 全”排列，得到自然小调音阶。"],
        example: "a 自然小调：A → B → C → D → E → F → G → A",
      },
      {
        h2: "关系大小调",
        paras: ["a 小调与 C 大调使用完全相同的音，只是主音不同，因此它们互为关系大小调。小调主音在大调主音下方小三度。"],
      },
      {
        h2: "小调里的自然和弦",
        example: "i 小三 · ii° 减三 · III 大三 · iv 小三 · v 小三 · VI 大三 · VII 大三",
        paras: ["常见进行有 i-VI-III-VII、i-iv-VII-VI 等，听感偏深沉、内敛。"],
      },
    ],
  },
  {
    file: "wiki-ghost-notes.html",
    icon: "👻",
    title: "幽灵音",
    intro: "很轻的一击，让节奏变得连贯",
    sections: [
      {
        h2: "什么是幽灵音",
        paras: [
          "幽灵音是音量明显低于主拍的击点，通常落在弱拍或十六分音符的空隙里。它不抢主拍的位置，却让律动显得更密、更顺。",
          "在鼓组、贝斯与放克吉他中都很常见。",
        ],
      },
      {
        h2: "怎么练",
        bullets: [
          "先把节拍器调到 60 到 80，只打四分音符，保持每一拍音量一致。",
          "加入八分音符，把落在弱位的那一下打轻，形成强—弱—强—弱的对比。",
          "保持手腕放松，幽灵音靠手指与手腕的细微控制，而不是整条手臂。",
          "熟练后尝试在十六分音符中随机加入幽灵音，注意不要影响主拍的稳定。",
        ],
      },
      {
        h2: "用软件检查",
        paras: [
          "打开“节奏闯关”，选择八分音符节奏型，先把每一击都打在正点上。",
          "再尝试把弱位打轻，观察准确率与平均偏差是否仍然稳定；如果偏差变大，说明音量变化影响了你的时间感，需要放慢速度重练。",
        ],
      },
    ],
  },
  {
    file: "wiki-pro-tips.html",
    icon: "💡",
    title: "练习建议",
    intro: "让练习真正有效的几条原则",
    sections: [
      {
        h2: "慢练优先",
        paras: ["把速度降到能完全做对的程度，再逐步加快。错误的速度练得越多，错误的动作越牢固。"],
      },
      {
        h2: "短时高频",
        paras: ["每天十五到二十分钟，比一周集中练两小时更有效。节奏与听辨都依赖长期的耳朵记忆。"],
      },
      {
        h2: "用数据说话",
        bullets: [
          "用节拍基准固定速度，避免越练越快。",
          "在节奏闯关里每次只关注一个指标，例如先把平均偏差控制在 30 毫秒以内，再追求准确率。",
          "把成绩导出为 CSV，隔一周对比一次，能看到真实进步。",
        ],
      },
      {
        h2: "常见误区",
        bullets: ["只练自己熟悉的调，遇到升降号就回避。", "跳过基本功直接练曲子。", "练琴时开着节拍器却不去听它。", "只追求速度，不检查准确性。"],
      },
    ],
  },
  {
    file: "wiki-roman-numerals.html",
    icon: "Ⅰ",
    title: "罗马数字记法",
    intro: "用级数表示和弦，换调也不用重新学",
    sections: [
      {
        h2: "怎么写",
        bullets: ["大写表示大三和弦：I、IV、V。", "小写表示小三和弦：ii、iii、vi。", "加 ° 表示减和弦：vii°。"],
      },
      {
        h2: "七个级数",
        example: "C 大调：I=C，ii=Dm，iii=Em，IV=F，V=G，vi=Am，vii°=Bdim",
      },
      {
        h2: "常见进行",
        bullets: ["I-V-vi-IV：最流行的进行之一。", "ii-V-I：爵士中最基本的终止式。", "I-vi-IV-V：五六十年代的老歌常用。", "i-VI-III-VII：小调中常见的进行。"],
        paras: ["用级数记录进行，换到别的调时只需要把级数对应到新调的和弦即可。"],
      },
    ],
  },
  {
    file: "wiki-scales.html",
    icon: "🪜",
    title: "音阶",
    intro: "音阶是旋律与和弦的素材库",
    sections: [
      {
        h2: "什么是音阶",
        paras: ["音阶是按照一定音程关系排列的一组音，通常从主音开始，向上走到高八度。"],
      },
      {
        h2: "常见类型",
        bullets: ["大调音阶：明亮、稳定，是最常用的音阶。", "自然小调音阶：柔和、内敛。", "五声音阶：去掉半音关系，常用于民歌与流行旋律。", "布鲁斯音阶：在五声音阶中加入变化音，味道独特。"],
      },
      {
        h2: "音级与功能",
        example: "1 主音 · 2 上主音 · 3 中音 · 4 下属音 · 5 属音 · 6 下中音 · 7 导音",
        paras: ["主音最稳定，属音与导音有强烈的倾向性，理解这些功能有助于判断旋律的走向。"],
      },
      {
        h2: "如何构成和弦",
        paras: ["在音阶上隔一个取一个音，就得到该调的自然和弦。这也是“和弦推演”模块演示的过程。"],
      },
    ],
  },
];

export function renderPage(page) {
  const parts = [];
  parts.push("<!DOCTYPE html>");
  parts.push('<html lang="zh-CN">');
  parts.push("<head>");
  parts.push('    <meta charset="UTF-8">');
  parts.push('    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
  parts.push('    <meta name="theme-color" content="#0b0f14">');
  parts.push('    <meta name="apple-mobile-web-app-capable" content="yes">');
  parts.push(`    <title>${page.title} - 乐感工坊</title>`);
  parts.push('    <link rel="manifest" href="manifest.json">');
  parts.push('    <link rel="stylesheet" href="styles.css">');
  parts.push('    <link rel="stylesheet" href="guide-styles.css">');
  parts.push('    <script src="page-memory.js"></script>');
  parts.push("</head>");
  parts.push("<body>");
  parts.push('    <nav class="main-nav"></nav>');
  parts.push('    <div class="guide-container">');
  parts.push('        <header style="text-align: center; margin-bottom: 26px;">');
  parts.push(`            <div class="header-icon" style="font-size: 2.2rem;">${page.icon}</div>`);
  parts.push(`            <h1 style="margin: 0 0 8px 0; font-size: 1.7rem;">${page.title}</h1>`);
  parts.push(`            <p class="subtitle" style="margin: 0;">${page.intro}</p>`);
  parts.push("        </header>");

  for (const section of page.sections) {
    parts.push('        <section class="guide-section">');
    if (section.h2) parts.push(`            <h2>${section.h2}</h2>`);
    for (const text of section.paras ?? []) {
      parts.push(`            <p>${text}</p>`);
    }
    if (section.bullets) {
      parts.push('            <ul class="step-list">');
      for (const item of section.bullets) parts.push(`                <li>${item}</li>`);
      parts.push("            </ul>");
    }
    if (section.example) {
      parts.push(`            <div class="example-box"><strong>示例：</strong>${section.example}</div>`);
    }
    if (section.tip) {
      parts.push(`            <div class="tip-box"><strong>提示：</strong>${section.tip}</div>`);
    }
    parts.push("        </section>");
  }

  parts.push('        <div class="back-nav" style="margin-top: 30px;">');
  parts.push('            <a href="wiki.html" class="back-link">← 返回乐理手册</a>');
  parts.push("        </div>");
  parts.push("    </div>");
  parts.push("</body>");
  parts.push("</html>");
  return parts.join("\n");
}
