/**
 * Chord Progression Database
 * Contains pre-defined chord progressions with moods and descriptions
 */

const CHORD_PROGRESSIONS = [
    {
        name: "经典流行进行",
        progression: ["I", "V", "vi", "IV"],
        mood: ["happy", "uplifting"],
        keyMode: "major",
        description: "流行音乐中最常见的四和弦进行，明亮好记，大量华语与欧美流行歌都在使用。"
    },
    {
        name: "抒情叙事",
        progression: ["vi", "IV", "I", "V"],
        mood: ["sad", "melancholic"],
        keyMode: "major",
        description: "从小调六级开始，情绪内敛，适合抒情慢歌与叙事段落。"
    },
    {
        name: "史诗小调",
        progression: ["i", "VI", "III", "VII"],
        mood: ["sad", "melancholic"],
        keyMode: "minor",
        description: "小调中的强力进行，推进感明显，常见于影视与摇滚的高潮段落。"
    },
    {
        name: "五十年代老歌",
        progression: ["I", "vi", "IV", "V"],
        mood: ["happy", "uplifting"],
        keyMode: "major",
        description: "怀旧甜美，是早期摇滚与老式情歌的常用套路。"
    },
    {
        name: "小调布鲁斯",
        progression: ["i", "iv", "VII", "VI"],
        mood: ["melancholic", "sad"],
        keyMode: "minor",
        description: "带有布鲁斯色彩的小调进行，忧郁中带着洒脱。"
    },
    {
        name: "明亮温暖",
        progression: ["I", "IV", "vi", "V"],
        mood: ["happy", "uplifting"],
        keyMode: "major",
        description: "乐观舒展，常用于民谣与轻快的流行歌曲。"
    },
    {
        name: "梦幻流动",
        progression: ["I", "iii", "vi", "IV"],
        mood: ["dreamy", "uplifting"],
        keyMode: "major",
        description: "和声柔和流动，适合氛围音乐、清新风格与慢节奏作品。"
    },
    {
        name: "爵士终止式",
        progression: ["ii", "V", "I"],
        mood: ["uplifting"],
        keyMode: "major",
        description: "爵士中最基本的二五一终止，是即兴伴奏的核心句型。"
    },
    {
        name: "电影感小调",
        progression: ["i", "III", "VII", "iv"],
        mood: ["melancholic", "epic"],
        keyMode: "minor",
        description: "小调和声层层推进，画面感强。"
    },
    {
        name: "安达卢西亚终止",
        progression: ["i", "VII", "VI", "V"],
        mood: ["unsettling"],
        keyMode: "minor",
        hasBorrowedChords: true,
        description: "源自西班牙弗拉门戈的下行进行，民族色彩鲜明。"
    },
    {
        name: "激昂大调",
        progression: ["I", "V", "IV", "V"],
        mood: ["happy", "uplifting"],
        keyMode: "major",
        description: "气势开阔，常用于副歌与励志主题。"
    },
    {
        name: "忧郁下行",
        progression: ["i", "VI", "iv", "V"],
        mood: ["sad", "melancholic"],
        keyMode: "minor",
        hasBorrowedChords: true,
        description: "低音级进下行，情绪逐渐下沉。"
    },
    {
        name: "神秘氛围",
        progression: ["i", "III", "VI", "VII"],
        mood: ["unsettling"],
        keyMode: "minor",
        description: "和声色彩暧昧，适合悬疑与氛围段落。"
    },
    {
        name: "推进动力",
        progression: ["I", "IV", "I", "V"],
        mood: ["happy", "uplifting"],
        keyMode: "major",
        description: "和声与节奏都带有前进感，适合中快板作品。"
    },
    {
        name: "紧张悬疑",
        progression: ["i", "ii", "V", "i"],
        mood: ["unsettling"],
        keyMode: "minor",
        hasBorrowedChords: true,
        description: "和声张力明显，适合制造紧张场面。"
    },
    {
        name: "庄重进行",
        progression: ["I", "IV", "V", "IV"],
        mood: ["uplifting"],
        keyMode: "major",
        description: "大气庄重，常见于典礼音乐与史诗风格。"
    },
    {
        name: "苦甜交织",
        progression: ["I", "vi", "ii", "V"],
        mood: ["dreamy", "melancholic"],
        keyMode: "major",
        description: "明亮与忧郁并存，情绪层次丰富。"
    },
    {
        name: "半音下行",
        progression: ["I", "VII", "VI", "V"],
        mood: ["unsettling"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "低音以半音级进下行，色彩浓烈。"
    },
    {
        name: "减和弦张力",
        progression: ["i", "vii°", "VI", "vii°"],
        mood: ["uncomfortable"],
        keyMode: "minor",
        description: "大量使用减和弦，制造强烈的不稳定感。"
    },
    {
        name: "三全音替代",
        progression: ["I", "II", "I", "II"],
        mood: ["uncomfortable"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "爵士常用手法，用降二级和弦替代原来的属和弦。"
    },
    {
        name: "半音中音关系",
        progression: ["I", "III", "I", "III"],
        mood: ["unsettling"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "远关系转调，色彩瞬间变化。"
    },
    {
        name: "平行小调借用",
        progression: ["I", "iv", "I", "iv"],
        mood: ["uncomfortable"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "从同主音小调借用和弦，音乐立刻转暗。"
    },
    {
        name: "增和弦惊悚",
        progression: ["I", "III", "VI", "ii"],
        mood: ["uncomfortable"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "增和弦带来悬疑与不安的听感。"
    },
    {
        name: "全音漂浮",
        progression: ["I", "II", "III", "IV"],
        mood: ["dreamy", "uncomfortable"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "全音音阶造成漂浮、失重的效果。"
    },
    {
        name: "弗里几亚阴暗",
        progression: ["i", "II", "i", "II"],
        mood: ["unsettling"],
        keyMode: "minor",
        hasBorrowedChords: true,
        description: "弗里几亚调式特有的异域与压抑色彩。"
    },
    {
        name: "欺骗进行",
        progression: ["I", "vi", "VII", "III"],
        mood: ["uncomfortable"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "用六级和弦代替主和弦，产生看似没有结束的效果。"
    },
    {
        name: "半音噩梦",
        progression: ["i", "II", "III", "iv"],
        mood: ["uncomfortable"],
        keyMode: "minor",
        hasBorrowedChords: true,
        description: "高度半音化，和声极不稳定。"
    },
    {
        name: "利底亚奇异",
        progression: ["I", "II", "I", "vii°"],
        mood: ["uncomfortable"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "升四级带来的利底亚色彩，明亮中透出奇异。"
    },
    {
        name: "非功能漂移",
        progression: ["I", "VII", "IV", "III"],
        mood: ["unsettling"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "不遵循传统的和声功能逻辑，和声自由漂移。"
    },
    {
        name: "洛克里亚混沌",
        progression: ["i°", "II", "III", "iv"],
        mood: ["uncomfortable"],
        keyMode: "minor",
        hasBorrowedChords: true,
        description: "以最不稳定的洛克里亚调式为基础，听感尖锐。"
    },
    {
        name: "半音平行",
        progression: ["I", "i", "VII", "vii°"],
        mood: ["unsettling"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "和弦整体平行移动，形成色块式的音响效果。"
    },
    {
        name: "借用和弦冲击",
        progression: ["I", "IV", "iv", "I"],
        mood: ["uncomfortable"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "密集使用借用和弦，色彩强烈。"
    },
    {
        name: "自然小调忧伤",
        progression: ["i", "iv", "i", "V"],
        mood: ["sad", "melancholic"],
        keyMode: "minor",
        hasBorrowedChords: true,
        description: "最直接的小调悲伤色彩。"
    },
    {
        name: "绝望小调",
        progression: ["i", "iv", "v", "i"],
        mood: ["sad", "melancholic"],
        keyMode: "minor",
        description: "低音下行叠加小调和声，情绪压抑。"
    },
    {
        name: "悲伤起伏",
        progression: ["i", "VII", "III", "VI"],
        mood: ["sad", "melancholic"],
        keyMode: "minor",
        description: "和声如波浪起伏，情绪层层推进。"
    },
    {
        name: "暗色游移",
        progression: ["i", "v", "VI", "VII"],
        mood: ["sad", "melancholic"],
        keyMode: "minor",
        description: "调性模糊，带有迷失与徘徊的感觉。"
    },
    {
        name: "黑暗旅程",
        progression: ["i", "VI", "VII", "III"],
        mood: ["sad", "melancholic"],
        keyMode: "minor",
        description: "缓慢推进的暗色和声，叙事感强。"
    },
    {
        name: "静思小调",
        progression: ["I", "vi", "iii", "IV"],
        mood: ["melancholic", "dreamy"],
        keyMode: "major",
        description: "适合安静、自省的段落。"
    },
    {
        name: "渴望解决",
        progression: ["vi", "ii", "V", "I"],
        mood: ["melancholic", "uplifting"],
        keyMode: "major",
        description: "悬置的和声最终回到主音，情绪得到释放。"
    },
    {
        name: "克瑞普式进行",
        progression: ["I", "IV", "iv", "I"],
        mood: ["melancholic", "uncomfortable"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "因歌曲《Creep》而闻名：先用大三和弦，再用小三和弦，情绪骤然转折。"
    },
    {
        name: "三和弦摇滚",
        progression: ["I", "IV", "V"],
        mood: ["happy", "uplifting"],
        keyMode: "major",
        description: "只用三个和弦的经典摇滚套路，简单直接。"
    },
    {
        name: "伊奥利亚循环",
        progression: ["i", "VII", "VI", "VII"],
        mood: ["melancholic", "dreamy"],
        keyMode: "minor",
        description: "建立在自然小调上的循环进行，适合即兴。"
    },
    {
        name: "混合利底亚循环",
        progression: ["I", "VII", "IV", "I"],
        mood: ["uplifting", "dreamy"],
        keyMode: "major",
        hasBorrowedChords: true,
        description: "降七级带来布鲁斯与摇滚色彩，适合长时间循环。"
    }
];
