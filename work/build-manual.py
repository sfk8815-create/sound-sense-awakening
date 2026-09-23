# -*- coding: utf-8 -*-
"""生成《音感觉醒软件说明书》DOCX。"""

import os
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

LATIN_FONT = "Segoe UI"
CJK_FONT = "微软雅黑"

HEADER_FILL = "1F3B4D"
ALT_ROW_FILL = "F2F5F7"
BORDER_COLOR = "D9D9D9"

OUT_PATH = "outputs/音感觉醒_软件说明书_V2.0.docx"


def set_run_font(run, size=None, bold=None, color="000000", latin=LATIN_FONT, cjk=CJK_FONT):
    run.font.name = latin
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.get_or_add_rFonts()
    rfonts.set(qn("w:ascii"), latin)
    rfonts.set(qn("w:hAnsi"), latin)
    rfonts.set(qn("w:eastAsia"), cjk)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.font.bold = bold
    if color:
        run.font.color.rgb = RGBColor.from_string(color)


def clear_paragraph_borders(paragraph):
    ppr = paragraph._p.get_or_add_pPr()
    for bdr in ppr.findall(qn("w:pBdr")):
        ppr.remove(bdr)


def configure_styles(doc):
    normal = doc.styles["Normal"]
    normal.font.name = LATIN_FONT
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = RGBColor.from_string("000000")
    normal.element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:eastAsia"), CJK_FONT)
    normal.paragraph_format.line_spacing = 1.5
    normal.paragraph_format.space_after = Pt(6)

    title = doc.styles["Title"]
    title.font.name = LATIN_FONT
    title.font.size = Pt(26)
    title.font.bold = True
    title.font.color.rgb = RGBColor.from_string("000000")
    title.element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:eastAsia"), CJK_FONT)
    ppr = title.element.get_or_add_pPr()
    for bdr in ppr.findall(qn("w:pBdr")):
        ppr.remove(bdr)

    heading_specs = [("Heading 1", 16, 18, 8), ("Heading 2", 13, 14, 6), ("Heading 3", 11.5, 10, 4)]
    for name, size, before, after in heading_specs:
        style = doc.styles[name]
        style.font.name = LATIN_FONT
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string("000000")
        style.element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:eastAsia"), CJK_FONT)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True
        ppr = style.element.get_or_add_pPr()
        for bdr in ppr.findall(qn("w:pBdr")):
            ppr.remove(bdr)


def add_body(doc, text, size=10.5, space_after=6, indent=False):
    paragraph = doc.add_paragraph()
    paragraph.paragraph_format.space_after = Pt(space_after)
    paragraph.paragraph_format.line_spacing = 1.5
    if indent:
        paragraph.paragraph_format.left_indent = Cm(0.6)
    run = paragraph.add_run(text)
    set_run_font(run, size=size)
    return paragraph


def add_bullet(doc, text, size=10.5):
    paragraph = doc.add_paragraph(style="List Bullet")
    paragraph.paragraph_format.space_after = Pt(3)
    paragraph.paragraph_format.line_spacing = 1.4
    run = paragraph.add_run(text)
    set_run_font(run, size=size)
    return paragraph


def shade_cell(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_table_borders(table):
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        element = OxmlElement(f"w:{edge}")
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), "6")
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), BORDER_COLOR)
        borders.append(element)
    tbl_pr.append(borders)


def set_cell_margins(table, top=80, bottom=80, left=120, right=120):
    tbl_pr = table._tbl.tblPr
    margins = OxmlElement("w:tblCellMar")
    for name, value in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        element = OxmlElement(f"w:{name}")
        element.set(qn("w:w"), str(value))
        element.set(qn("w:type"), "dxa")
        margins.append(element)
    tbl_pr.append(margins)


def add_table(doc, headers, rows, widths, header_fill=HEADER_FILL, font_size=9.5, alt_rows=True):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    set_cell_margins(table)

    header_row = table.rows[0]
    repeat = OxmlElement("w:tblHeader")
    header_row._tr.get_or_add_trPr().append(repeat)

    for index, text in enumerate(headers):
        cell = header_row.cells[index]
        cell.width = Cm(widths[index])
        shade_cell(cell, header_fill)
        cell.vertical_alignment = 1
        paragraph = cell.paragraphs[0]
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.space_after = Pt(2)
        paragraph.paragraph_format.line_spacing = 1.25
        run = paragraph.add_run(text)
        set_run_font(run, size=font_size, bold=True, color="FFFFFF")

    for row_index, row in enumerate(rows):
        cells = table.add_row().cells
        for col_index, text in enumerate(row):
            cell = cells[col_index]
            cell.width = Cm(widths[col_index])
            cell.vertical_alignment = 1
            if alt_rows and row_index % 2 == 1:
                shade_cell(cell, ALT_ROW_FILL)
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT if col_index != 0 else WD_ALIGN_PARAGRAPH.LEFT
            paragraph.paragraph_format.space_after = Pt(2)
            paragraph.paragraph_format.line_spacing = 1.25
            run = paragraph.add_run(text)
            set_run_font(run, size=font_size, bold=(col_index == 0))

    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return table


def add_caption(doc, text):
    paragraph = doc.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.space_before = Pt(2)
    paragraph.paragraph_format.space_after = Pt(10)
    run = paragraph.add_run(text)
    set_run_font(run, size=9, color="595959")
    return paragraph


def build():
    doc = Document()
    configure_styles(doc)

    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.4)
    section.bottom_margin = Cm(2.2)
    section.left_margin = Cm(2.6)
    section.right_margin = Cm(2.6)

    # ---------------- 封面 ----------------
    for _ in range(3):
        doc.add_paragraph()

    title = doc.add_paragraph("音感觉醒软件说明书", style="Title")
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    clear_paragraph_borders(title)
    for run in title.runs:
        set_run_font(run, size=26, bold=True, color="000000")

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.paragraph_format.space_after = Pt(24)
    run = subtitle.add_run("面向音乐课堂的节奏、听音与乐理训练工具")
    set_run_font(run, size=13, color="404040")

    add_table(
        doc,
        ["项目", "内容"],
        [
            ["软件名称", "音感觉醒"],
            ["版本号", "V2.0"],
            ["本次更新", "补入作业练习范围、作业单与成绩的导出导入、教师视角进入确认（2026 年 9 月）"],
            ["文档类型", "用户操作说明书"],
            ["运行平台", "Windows 10 及以上；Microsoft Edge 或 Google Chrome 浏览器"],
            ["开发完成日期", "2026 年 9 月"],
            ["软件语言", "简体中文"],
            ["原始项目", "Chordz（MIT 许可开源项目，本项目在其基础上二次开发）"],
            ["开发者", "马荣寰"],
        ],
        widths=[3.6, 11.6],
        font_size=10,
    )

    doc.add_page_break()

    # ---------------- 目录 ----------------
    doc.add_paragraph("目录", style="Heading 1")
    contents = [
        "1  软件概述",
        "2  运行环境",
        "3  安装、启动与停止",
        "4  界面结构",
        "5  节奏闯关",
        "6  乐理考题",
        "7  和弦练习",
        "8  视奏训练",
        "9  练习工具",
        "10  学习资料",
        "11  显示模式",
        "12  教学功能",
        "13  数据备份与迁移",
        "14  数据存储与隐私",
        "15  常见问题",
        "16  版权与开源声明",
        "附录 A  快捷键",
        "附录 B  主要文件清单",
    ]
    for item in contents:
        paragraph = doc.add_paragraph()
        paragraph.paragraph_format.space_after = Pt(4)
        paragraph.paragraph_format.left_indent = Cm(0.4)
        run = paragraph.add_run(item)
        set_run_font(run, size=11)

    doc.add_page_break()

    # ---------------- 1 软件概述 ----------------
    doc.add_paragraph("1  软件概述", style="Heading 1")

    doc.add_paragraph("1.1  用途与定位", style="Heading 2")
    add_body(
        doc,
        "音感觉醒是一款在本地运行的音乐训练工具，把节拍、节奏、听音与乐理练习集中在一个界面里。"
        "它面向中小学音乐课堂、音乐专业视唱练耳教学以及个人日常练习三种场景，"
        "既可以在课堂上由教师投屏演示，也可以让学生在电脑上自主完成练习并留下练习记录。",
    )
    add_body(
        doc,
        "软件的节奏闯关模块使用麦克风识别击打时机，把每一次敲击与节拍网格对照，"
        "实时标出“准”“偏早”“偏晚”，并在练习结束后给出准确率、平均偏差和等级评价。"
        "这使节奏训练从“凭感觉”变成可以量化、可以记录、可以对比的过程。",
    )

    doc.add_paragraph("1.2  目标用户", style="Heading 2")
    add_bullet(doc, "中小学音乐教师：课堂演示、节奏与听音训练、学生练习数据记录。")
    add_bullet(doc, "音乐专业学生：视唱练耳、节奏稳定性、和弦与音阶的日常练习。")
    add_bullet(doc, "业余音乐学习者：识谱、听音、节拍与和弦进行的入门练习。")

    doc.add_paragraph("1.3  主要特点", style="Heading 2")
    add_bullet(doc, "本地运行：不需要联网、不需要注册账号，练习数据保存在本机。")
    add_bullet(doc, "量化反馈：节奏练习给出毫秒级偏差，听音练习给出对错与统计。")
    add_bullet(doc, "零依赖部署：本地服务由 Windows 自带组件提供，无需安装额外运行库。")
    add_bullet(doc, "课堂适配：提供全屏、专注、浅色、大屏四种显示模式，适配投影环境。")
    add_bullet(doc, "数据可导出：练习记录可导出为 CSV 文件，便于教学分析与研究。")
    add_bullet(doc, "教学闭环：教师可建立学生名单、布置作业、查看达标情况，并生成前后测进步报告。")
    add_bullet(doc, "内容对齐课堂：乐理考题按音乐课与艺考笔试的常考题型组织，覆盖音值组合、音程、和弦、调号与调式。")

    # ---------------- 2 运行环境 ----------------
    doc.add_paragraph("2  运行环境", style="Heading 1")
    add_table(
        doc,
        ["项目", "要求"],
        [
            ["操作系统", "Windows 10 或更高版本（当前启动脚本面向 Windows）"],
            ["浏览器", "Microsoft Edge 或 Google Chrome，建议使用最新版本"],
            ["音频设备", "麦克风（使用节奏闯关、音高识别功能时需要）"],
            ["扩展设备", "和弦类练习需要能发出准确音高的声源，可用钢琴、电子琴、口风琴、竖笛或人声；也可以直接点击页面下方的虚拟键盘，无需任何乐器"],
            ["网络", "不需要联网，离线可用"],
            ["磁盘占用", "约 5 MB"],
            ["运行依赖", "无需安装 Node.js、Python 或其他运行库"],
        ],
        widths=[3.2, 12.0],
        font_size=10,
    )
    add_caption(doc, "表 2-1  运行环境要求")

    # ---------------- 3 安装、启动与停止 ----------------
    doc.add_paragraph("3  安装、启动与停止", style="Heading 1")

    doc.add_paragraph("3.1  安装", style="Heading 2")
    add_body(
        doc,
        "本软件为绿色免安装程序。将软件目录整体复制到电脑任意位置即可完成安装，"
        "不需要运行安装向导，也不写入系统注册表。建议将目录放在磁盘固定位置，不要随意移动。",
    )

    doc.add_paragraph("3.2  启动", style="Heading 2")
    add_body(doc, "提供三种启动方式，任选一种即可：")
    add_table(
        doc,
        ["方式", "操作", "说明"],
        [
            ["桌面快捷方式", "双击桌面上的“音感觉醒”图标", "推荐方式，以应用模式打开，没有地址栏和标签页"],
            ["应用模式脚本", "双击目录中的“启动应用.bat”", "与桌面图标效果相同"],
            ["浏览器方式", "双击目录中的“启动.bat”", "在默认浏览器中打开，便于同时浏览其他网页"],
        ],
        widths=[3.0, 6.2, 6.0],
        font_size=9.5,
    )
    add_caption(doc, "表 3-1  启动方式")
    add_body(
        doc,
        "启动后，程序会自动在本机开启一个微型服务，并打开工作台首页。"
        "本地服务的作用是让浏览器可以使用麦克风功能，因为浏览器要求麦克风只能在受信任的本地地址下工作。",
    )

    doc.add_paragraph("3.3  停止本地服务", style="Heading 2")
    add_body(
        doc,
        "关闭窗口不会影响本地服务，服务会在后台安静运行，占用资源很小。"
        "如需彻底停止，双击目录中的“停止服务.bat”即可。",
    )

    # ---------------- 4 界面结构 ----------------
    doc.add_paragraph("4  界面结构", style="Heading 1")

    doc.add_paragraph("4.1  工作台", style="Heading 2")
    add_body(
        doc,
        "打开软件后首先进入工作台。工作台顶部是软件名称与两个主入口按钮，"
        "其中“继续练习”按钮会根据最近一次练习记录，直接打开上次练习的模块。"
        "工作台中部显示当前进度、最近练习记录，下方是三个核心训练入口。",
    )
    add_table(
        doc,
        ["区域", "内容"],
        [
            ["顶部", "软件名称、 “继续练习” 与 “我的作业” 两个入口"],
            ["当前进度", "节奏闯关关数与解锁进度、乐理考题最近一次正确率、作业数量、累积练习次数"],
            ["最近练习", "按时间列出最近的练习记录，包含模块名称、成绩与练习时间"],
            ["核心训练", "节奏闯关、乐理考题、我的作业三个主要入口"],
        ],
        [3.0, 12.0],
    )

    doc.add_paragraph("4.2  左侧导航", style="Heading 2")
    add_body(doc, "左侧导航栏固定显示，按使用场景分为四组，功能入口如下表所示。")
    add_table(
        doc,
        ["分组", "功能入口", "主要用途"],
        [
            ["练习", "节奏闯关", "麦克风识别击打时机，训练节奏稳定性"],
            ["练习", "视奏训练", "导入乐谱，逐音判定音高与节奏是否准确"],
            ["练习", "乐理考题", "按考试题型随机出题，覆盖音值组合、音程、和弦、调性等"],
            ["练习", "和弦练习", "和弦转位、速弹、和弦弹奏、调内和弦四类练习"],
            ["工具", "节拍基准", "可调速度、拍号与音色的节拍器"],
            ["工具", "进行曲库", "按调性与情绪查找常用和弦进行"],
            ["工具", "音高识别", "用麦克风识别单音并记录"],
            ["工具", "听音辨调", "听一段旋律，判断它属于什么调，答完立即判分"],
            ["工具", "和弦找音", "由音阶逐步推出和弦构成"],
            ["知识", "乐理手册", "音阶、和弦、五度圈、相对音感等专题文章"],
            ["知识", "上手引导", "从零开始了解各模块的使用方法"],
            ["教学", "班级管理", "建立学生名单并汇总每人的练习情况"],
            ["教学", "作业布置", "布置练习任务，自动判定学生是否达标"],
            ["教学", "前后测报告", "对比训练前后的成绩，量化进步幅度"],
            ["教学", "数据备份", "导出或导入全部数据，用于备份与换机迁移"],
        ],
        widths=[2.0, 3.6, 9.6],
        font_size=9.5,
    )
    add_caption(doc, "表 4-1  功能模块一览")

    doc.add_paragraph("4.3  悬浮控制", style="Heading 2")
    add_body(
        doc,
        "页面右下角固定显示“模式”和“全屏”两个按钮。前者用于切换显示模式，后者用于进入或退出全屏，"
        "两者在软件的所有页面中都可用。",
    )

    # ---------------- 5 节奏闯关 ----------------
    doc.add_paragraph("5  节奏闯关", style="Heading 1")

    doc.add_paragraph("5.1  功能说明", style="Heading 2")
    add_body(
        doc,
        "节奏闯关是本软件的核心练习模块。程序先播放节拍并给出预备拍，随后进入练习区间；"
        "练习者用手拍手、敲桌面或敲击电子鼓垫发出声音，麦克风捕捉到声音后，"
        "程序把这一次击打与应当发生的时间点比对，计算毫秒级偏差，并在节拍网格上实时显示结果。"
        "练习结束后自动统计全部击打，生成评分与改进建议。",
    )
    add_body(
        doc,
        "如果没有麦克风，也可以使用空格键或点击屏幕上的敲击区完成练习，评分逻辑完全一致。",
    )
    add_body(
        doc,
        "练习过程中，节拍网格用颜色表示每一次击打的判定结果：淡紫色表示这一拍应当敲击，"
        "绿色表示在允许范围内敲准，黄色表示偏差较大，红色表示明显偏早或偏晚，红色底表示漏敲。"
        "网格下方附有颜色图例，方便第一次使用时对照。",
    )

    doc.add_paragraph("5.2  参数设置", style="Heading 2")
    add_table(
        doc,
        ["参数", "取值范围", "说明"],
        [
            ["速度", "40 至 240 BPM", "每分钟节拍数，可用滑块拖动或直接输入数字"],
            ["拍号", "4/4、3/4、2/4、6/8、3/8", "决定每小节的拍数与以何种音符为一拍"],
            ["节奏型", "六种预设 + 自定义", "预设为四分音符、八分音符、四分与八分交替、十六分音符、附点节奏、含休止符；自定义可自行绘制"],
            ["练习长度", "2、4、8 小节", "练习区间的小节数量"],
            ["节拍提示", "全程给节拍、隔小节给节拍、只在预备拍给节拍", "后两种逐步撤除提示，用于训练内心节拍感"],
            ["麦克风灵敏度", "1 至 10", "数值越高越容易触发，环境嘈杂时可适当调低"],
            ["延迟校准", "-80 至 80 毫秒", "用于抵消蓝牙耳机或外接音响造成的判定偏移"],
        ],
        widths=[2.8, 4.2, 8.2],
        font_size=9.5,
    )
    add_caption(doc, "表 5-1  节奏闯关参数说明")

    doc.add_paragraph("5.3  操作步骤", style="Heading 2")
    add_body(doc, "1. 进入“节奏闯关”，依次设置速度、拍号、节奏型与练习长度。")
    add_body(doc, "2. 点击“开始训练”，浏览器弹出麦克风授权提示时选择“允许”。")
    add_body(doc, "3. 听到四拍预备拍后开始敲击，尽量与节拍网格上的标记对齐。")
    add_body(doc, "4. 练习结束自动停止，页面显示准确率、平均偏差、漏敲与多余敲击次数以及等级评价。")
    add_body(doc, "5. 如需保留数据，点击“导出 CSV”保存本次及历史练习记录。")

    doc.add_paragraph("5.4  判定与评分", style="Heading 2")
    add_table(
        doc,
        ["指标", "判定标准", "含义"],
        [
            ["准", "偏差不超过 70 毫秒", "击打时间与目标时间基本重合"],
            ["偏差", "偏差在 70 至 150 毫秒之间", "击打略早或略晚，仍计入有效命中"],
            ["偏早", "早于目标时间 70 毫秒以上", "抢拍"],
            ["偏晚", "晚于目标时间 70 毫秒以上", "拖拍"],
            ["漏敲", "目标时间点没有出现击打", "未完成该音符"],
            ["多余敲击", "没有对应目标点、且不属于同一次击打重复触发的击打", "多打或误触；同一次击打被识别两次时不计入"],
            ["准确率", "“准”计满分，“偏差”计六成，两者相加除以目标音符总数", "评分前会自动扣除设备延迟，并按本人击打习惯对齐"],
            ["平均偏差", "全部有效击打偏差的平均值", "击打整体偏早或偏晚的趋势"],
            ["得分", "准确率减去多余敲击的扣分，每次扣 1 分、最多扣 30 分", "综合表现分数"],
            ["等级", "得分 90 以上为 S，78 以上为 A，62 以上为 B，45 以上为 C，其余为 D", "并给出对应的练习建议"],
        ],
        widths=[2.6, 6.0, 6.6],
        font_size=9.5,
    )
    add_caption(doc, "表 5-2  节奏闯关判定与评分指标")

    doc.add_paragraph("5.5  练习记录与导出", style="Heading 2")
    add_body(
        doc,
        "每次练习结束后，程序自动记录练习时间、速度、拍号、节奏型、准确率、平均偏差与得分，"
        "保存在本机浏览器中，最多保留三十条。点击“导出 CSV”会生成一个表格文件，"
        "可以直接用 Excel 打开，用于统计学生练习前后的变化。",
    )
    add_body(
        doc,
        "记录区域上方提供进步曲线，用折线显示最近若干次练习的准确率与得分变化，"
        "便于教师和学生直观看到练习效果的走向。",
    )

    doc.add_paragraph("5.6  关卡进度", style="Heading 2")
    add_body(
        doc,
        "练习内容按难度划分为十二个关卡，从 60 BPM 的四分音符逐步过渡到 100 BPM 的十六分音符与内化节拍训练。"
        "每关设定固定的速度、节奏型、小节数与提示方式，学生连续两次达到 B 级以上即可解锁下一关，"
        "已完成与未解锁的关卡在进度条上有不同标记，进度保存在本机，下次打开自动回到当前关卡。",
    )

    doc.add_paragraph("5.7  成绩单与诊断建议", style="Heading 2")
    add_body(
        doc,
        "练习结束后生成一张成绩单，包含等级、准确率、平均偏差、漏敲与多余敲击次数，"
        "并以柱状图显示击打偏差的分布。点击“保存成绩单图片”可以把成绩单保存为图片，"
        "方便发送给教师或家长。",
    )
    add_body(
        doc,
        "系统同时根据本次数据给出诊断建议：漏敲较多时提示放慢速度，出现多余敲击时提示避免重复触发，"
        "整体偏早或偏晚时提示调整延迟校准；当某一拍的偏差明显大于其他拍时，"
        "会指出具体是第几拍容易抢拍或拖拍，便于有针对性地练习。",
    )

    doc.add_paragraph("5.8  击打偏差图", style="Heading 2")
    add_body(
        doc,
        "练习结束后，系统把每一个应当敲击的音按顺序排列在横轴上，把实际击打的偏差绘制在纵轴上，"
        "“准”的范围用绿色带标出，偏早的点在带下方、偏晚的点在带上方，漏敲的音用叉号标出。"
        "教师可以据此判断学生的偏差是随机分布还是集中在某几拍，比单纯的分数更直观。",
    )

    doc.add_paragraph("5.9  自定义节奏型", style="Heading 2")
    add_body(
        doc,
        "在节奏型中选择“自定义”后，页面会出现一个十六格编辑器，按每拍四个十六分位置排列。"
        "点击格子即可切换有音或休止，编辑结果自动保存并循环用于练习。"
        "教师可以用它出题，学生也可以自己编创节奏型再练习。",
    )

    doc.add_paragraph("5.10  按学生记录与班级统计", style="Heading 2")
    add_body(
        doc,
        "练习记录区提供“练习者”输入框，填写姓名后，每次练习的成绩都会记录在该学生名下；"
        "下方自动生成按学生的统计表，显示每人的练习次数、平均准确率与平均得分。"
        "导出的 CSV 文件包含练习者一列，教师可以直接在 Excel 中做班级层面的比较。",
    )

    doc.add_paragraph("5.11  MIDI 设备输入", style="Heading 2")
    add_body(
        doc,
        "连接电子鼓、电钢琴等支持 MIDI 的设备后，点击“MIDI 设备”按钮即可启用。"
        "使用 MIDI 输入时，程序直接接收设备发出的音信号，不必经过麦克风采集，"
        "判定精度高于麦克风方式，也不会受环境噪声影响。"
        "和弦类练习页面的虚拟键盘同样提供 MIDI 连接按钮，弹奏乐器即可作答。",
    )

    doc.add_paragraph("5.12  回放你的击打", style="Heading 2")
    add_body(
        doc,
        "练习结束后点击“听一遍我的击打”，程序会先播放标准节拍网格，再把你当时的每一次击打按实际时间播放出来，"
        "两种声音音色不同，方便对照听出自己是在抢拍还是拖拍。",
    )

    doc.add_paragraph("5.13  练习周报", style="Heading 2")
    add_body(
        doc,
        "点击“生成本周周报”，程序统计最近七天的练习次数、平均准确率、平均得分、最高得分与平均偏差，"
        "并用柱状图显示每次练习的准确率变化，最后给出一句练习建议。周报可以保存为图片，"
        "用于课堂反馈或家长沟通。",
    )

    # ---------------- 6 练习中心 ----------------
    doc.add_paragraph("6  乐理考题", style="Heading 1")
    add_body(
        doc,
        "乐理考题按音乐课堂测验与艺术类招生考试的笔试题型组织，覆盖音值组合与时值、"
        "拍号与节拍、音程、和弦、调号与调性、音阶与调式、记谱法基础、音乐术语与记号八类内容。"
        "题目由程序随机生成，答案与判断依据由乐理规则计算得出，不依赖固定题库。",
    )
    add_table(
        doc,
        ["题型", "考查内容", "典型题目"],
        [
            ["音值组合与时值", "音符时值换算、附点与复附点、三连音、小节填充", "复附点四分音符等于几拍；4/4 拍小节中还缺什么时值"],
            ["拍号与节拍", "拍号含义、单拍子与复拍子、强弱规律", "6/8 拍每小节有几个八分音符；4/4 拍的强弱规律"],
            ["音程", "音程名称、转位、协和性分类", "从 F 到 B 是什么音程；大三度转位后是什么"],
            ["和弦", "三和弦性质、原位与转位、调内和弦构成", "B—D♯—F♯ 属于哪种三和弦；G 大调 IV 级三和弦"],
            ["调号与调性", "调号数量、关系大小调、同主音大小调", "♭A 大调有几个降号；D 大调的关系小调"],
            ["音阶与调式", "大小调音阶、和声小调、五声调式", "E 和声小调的音阶；以某音为主音的徵调式"],
            ["记谱法基础", "谱号、音的分组、等音、休止符换算", "中央 C 的记法；低音谱号又称什么谱号"],
            ["音乐术语与记号", "速度与力度术语、反复记号", "Allegro、pp、cresc.、D.C. 的含义"],
        ],
        [2.4, 5.6, 7.0],
    )
    add_body(doc, "练习开始前可选择题量（10、20、30 题）与题型范围，也可以只练某一类专项。")
    add_bullet(doc, "即时判定：选择答案后立即显示对错，并给出本题的判断依据。")
    add_bullet(doc, "错题回顾：每轮结束后列出全部错题与正确答案，可点“只练错题”重做。")
    add_bullet(doc, "成绩记录：保存正确率、答题用时与题型分布，可导出并在前后测报告中汇总。")

    doc.add_paragraph("7  和弦练习", style="Heading 1")
    add_body(doc, "和弦练习包含四个模块，均以“限时完成、即时反馈、记录成绩”的方式组织。节奏训练在单独的“节奏闯关”模块中完成。")
    add_table(
        doc,
        ["模块", "练习内容", "反馈方式"],
        [
            ["转位闯关", "按顺序弹出指定和弦的各类转位", "完成后显示用时与最佳成绩"],
            ["60 秒速弹", "在一分钟内尽可能快地找到并弹出显示的音", "实时计分，结束显示总分"],
            ["和弦弹奏", "完整弹出屏幕上显示的和弦", "检测到音高后自动判定并计分"],
            ["调内和弦挑战", "在指定调性中写出全部七个自然和弦", "逐项判定对错并可查看答案"],
        ],
        widths=[3.0, 7.4, 4.8],
        font_size=9.5,
    )
    add_caption(doc, "表 6-1  和弦练习模块")
    add_body(
        doc,
        "转位闯关、60 秒速弹与和弦弹奏三个模块默认通过麦克风识别音高，需要乐器或人声作答。"
        "页面下方提供屏幕虚拟键盘，点击琴键即可完成作答，并会发出对应音高；"
        "没有乐器时可以使用这种方式练习和弦的构成与位置，琴键范围可用“低八度”“高八度”切换。",
    )

    # ---------------- 7 练习工具 ----------------
    doc.add_paragraph("8  视奏训练", style="Heading 1")
    add_body(
        doc,
        "视奏训练用于跟着乐谱演奏的练习。模块支持导入 MusicXML 与 MIDI 两种乐谱文件，"
        "程序解析出每个音符的音高、起始位置与时值，绘制成钢琴卷帘式的谱面轨道；"
        "学生演奏时，程序用麦克风逐音判断音高是否正确、时值是否准确，并在轨道上实时着色，"
        "演奏结束后给出音准准确率、节奏准确率、综合得分与等级。",
    )
    add_table(
        doc,
        ["功能", "说明"],
        [
            ["乐谱导入", "支持 MusicXML（.xml、.musicxml）与 MIDI（.mid、.midi）；可用 MuseScore 等打谱软件导出"],
            [
                "内置曲目",
                "分三组共十一首：儿歌（小星星、两只老虎、玛丽有只小羊羔、生日歌、铃儿响叮当）、"
                "经典旋律（欢乐颂、平安夜、致爱丽丝开头）、基础练习（C 大调音阶、低音谱表练习、节奏综合练习）",
            ],
            ["手动输入", "按“音名:拍数”的格式直接输入旋律，例如 C4:1 D4:1 E4:2"],
            ["判定内容", "可选择同时判定音高与节奏，或只判其中一项"],
            ["节拍器", "可选择演奏时给节拍、只在预备拍给节拍，或完全不给节拍"],
            ["谱面显示", "钢琴卷帘视图，横轴为时间、纵轴为音高，当前演奏位置有指示线"],
            ["显示方式", "可在钢琴卷帘与五线谱之间切换；五线谱视图绘制谱号、小节线、音符、符干、符尾与加线"],
            ["谱号", "高音谱号、低音谱号可选，也可按曲目音域自动判断"],
            ["MIDI 输入", "可连接 MIDI 键盘或电钢琴演奏，音高由设备直接给出，判定比麦克风更准确"],
            ["评分", "音准准确率、节奏准确率、综合得分与 S 至 D 等级，并给出练习建议"],
            ["练习记录", "记录保存在本机，可导出 CSV"],
        ],
        widths=[3.0, 12.2],
        font_size=9.5,
    )
    add_caption(doc, "表 7-1  视奏训练功能说明")
    add_body(
        doc,
        "说明：音高判定依赖麦克风采集单音，适合单声部旋律；和弦等多声部内容无法由麦克风分离，"
        "建议使用和弦练习模块。照片或扫描的乐谱需要光学识别（OMR），浏览器离线环境无法完成，"
        "可先用打谱软件转为 MusicXML 文件，或使用手动输入方式建立练习内容。",
    )

    doc.add_paragraph("9  练习工具", style="Heading 1")

    doc.add_paragraph("9.1  节拍基准", style="Heading 2")
    add_body(
        doc,
        "提供可调节的节拍器。速度支持 40 至 240 BPM，可用按钮微调或直接输入数字，"
        "拍号可选 2/4 至 7/8，音色可在电子咔哒、木鱼、电子音、牛铃之间切换，"
        "并支持“点击定速”：连续点击按钮，程序根据点击间隔自动推算速度。",
    )

    doc.add_paragraph("9.2  进行曲库", style="Heading 2")
    add_body(
        doc,
        "收录常用和弦进行，可按调性、大调或小调、情绪标签以及是否使用借用和弦筛选。"
        "每条进行都可以查看它在所选调中的具体和弦与需要弹奏的音，也可以收藏常用条目。",
    )

    doc.add_paragraph("9.3  音高识别", style="Heading 2")
    add_body(
        doc,
        "通过麦克风识别单个音高，适合检测演唱或乐器单音的准确性。模块会记录识别历史，"
        "并按得分或演奏顺序排列，便于观察音准稳定性。",
    )

    doc.add_paragraph("9.4  听音辨调", style="Heading 2")
    add_body(
        doc,
        "在键盘上选择若干音，程序判断这些音最可能属于哪种音阶，"
        "也可以使用麦克风逐个检测音符后自动选择，用于音阶与调性的听辨训练。",
    )

    doc.add_paragraph("9.5  和弦找音", style="Heading 2")
    add_body(
        doc,
        "输入调性与和弦进行编号，程序从音阶出发，逐步展示每个和弦的构成音、"
        "级数含义以及对应的琴键位置，适合讲解和声构成原理。",
    )

    # ---------------- 8 学习资料 ----------------
    doc.add_paragraph("10  学习资料", style="Heading 1")
    add_body(
        doc,
        "乐理手册收录音阶、音程、和弦、五度圈、相对音感、练习方法等专题文章，"
        "每篇文章都有独立的标题层级与知识点小节；上手引导则从零开始介绍各个模块的用法，"
        "适合第一次接触本软件的用户。",
    )

    # ---------------- 9 显示模式 ----------------
    doc.add_paragraph("11  显示模式", style="Heading 1")
    add_body(doc, "点击右下角“模式”按钮可以打开模式面板，其中包含三种显示模式，可与全屏组合使用。")
    add_table(
        doc,
        ["模式", "效果", "适用场景"],
        [
            ["全屏", "隐藏浏览器界面，内容占满屏幕，按 F 键可快速切换", "课堂投影、演示"],
            ["专注模式", "收起左侧导航栏，鼠标移到屏幕左边缘时自动滑出", "需要更大显示面积的讲解"],
            ["浅色模式", "界面切换为浅色配色", "明亮的教室、强光环境"],
            ["大屏模式", "整体界面放大 15%", "教室后排观看"],
        ],
        widths=[2.6, 7.0, 5.6],
        font_size=9.5,
    )
    add_caption(doc, "表 9-1  显示模式")
    add_body(doc, "以上设置会被自动记住，切换页面或下次打开软件时仍然保持。")

    # ---------------- 12 教学功能 ----------------
    doc.add_paragraph("12  教学功能", style="Heading 1")
    add_body(
        doc,
        "教学功能面向教师使用，把“布置练习—学生完成—数据反馈”连成一条完整流程，"
        "入口集中在左侧导航的“教学”分组。",
    )
    add_table(
        doc,
        ["功能", "作用", "使用方式"],
        [
            ["班级管理", "建立学生名单，汇总每名学生的练习次数、平均准确率、平均得分与最好成绩", "输入姓名添加，或粘贴整份名单批量导入；可导出全班成绩表"],
            ["作业布置", "为学生布置练习任务并自动判定是否达标", "设置作业类型、练习范围、达标正确率、题量要求与截止日期，可布置给全班或指定学生"],
            ["作业完成情况", "按学生列出达标状态与成绩", "在作业清单中展开名单查看，或导出 CSV 表格"],
            ["前后测报告", "对比训练前后的成绩变化，量化教学效果", "设定分界日期与统计对象，程序自动生成前测、后测与进步幅度，可打印或导出"],
        ],
        [3.0, 6.2, 5.8],
    )

    doc.add_paragraph("12.1  布置作业与练习范围", style="Heading 2")
    add_body(
        doc,
        "布置作业时可以一并指定“练什么”，学生打开作业就能看到具体要求，不用教师在课上重复交代。",
    )
    add_table(
        doc,
        ["作业字段", "说明"],
        [
            ["作业标题", "给这次作业起一个名字，例如“音程与和弦专项练习”"],
            ["作业类型", "乐理考题、节奏闯关或自由练习"],
            ["练习范围", "乐理考题可选题型（综合卷或八类题型之一）；节奏闯关可填关卡区间，填 1 到 12 表示不限；自由练习无范围"],
            ["达标正确率", "50% 至 100%，默认 90%"],
            ["题量要求", "乐理考题专用，例如不少于 20 题；填 0 表示不限"],
            ["截止日期", "到期后学生端显示“已逾期”，仍可继续练习"],
            ["给学生的提示", "例如“重点复习音程转位与调号顺序”，随作业一起显示给学生"],
            ["布置对象", "默认全班，也可以只勾选部分学生"],
        ],
        [3.4, 11.6],
    )
    add_caption(doc, "表 12-1  作业字段")

    doc.add_paragraph("12.2  达标判定规则", style="Heading 2")
    add_body(
        doc,
        "作业的达标判定不需要教师手工核对：学生完成练习后，程序读取该次布置之后产生的练习记录，"
        "按练习范围、达标准确率与题量要求自动给出“达标”或“未达标”。",
    )
    add_table(
        doc,
        ["作业类型", "判定依据"],
        [
            ["乐理考题", "布置时间之后的记录、学生姓名一致、题型在指定范围内、完成题量达到要求且正确率达到达标线"],
            ["节奏闯关", "布置时间之后的记录、学生姓名一致、关卡在指定范围内、正确率达到达标线"],
            ["自由练习", "由学生自行点击“标记完成”"],
        ],
        [3.0, 12.0],
    )
    add_caption(doc, "表 12-2  三类作业的判定依据")
    add_body(
        doc,
        "当学生练过但还差条件时，作业卡会直接说明原因，例如“已练 3 次，但都不是「音程」题型”"
        "或“已练 2 次，但都不在指定关卡”，方便学生判断下一步该练什么。",
    )

    doc.add_paragraph("12.3  把作业发给学生：作业单与作业码", style="Heading 2")
    add_body(
        doc,
        "作业保存在教师电脑本机，不会自动同步到学生电脑。教师端提供两种把作业交出去的方式，"
        "都只需要把一段内容或一个文件交给学生。",
    )
    add_table(
        doc,
        ["操作", "位置", "说明"],
        [
            ["导出作业单", "教师面板的“发给学生 / 收学生成绩”", "生成一个作业单文件，包含全部作业，适合整批发给学生"],
            ["作业码", "作业清单中每条作业的“作业码”按钮", "生成一段短码，可直接复制到班级群逐条发"],
        ],
        [3.0, 5.4, 6.6],
    )
    add_caption(doc, "表 12-3  教师端发放作业的两种方式")
    add_body(
        doc,
        "作业单与作业码里只有作业要求（标题、类型、范围、达标线、题量、截止日期、提示与布置名单），"
        "不包含题目内容，也不包含其他学生的练习数据。重复导入同一份作业单时，程序会按作业编号"
        "更新已有作业，不会产生重复条目。",
    )

    doc.add_paragraph("12.4  学生在自己的设备上完成", style="Heading 2")
    add_body(doc, "学生端与教师端是同一个软件，学生按下面的顺序操作即可。")
    add_bullet(doc, "第一步：在自己的电脑上打开软件，进入“作业布置”页面。页面默认是学生视角。")
    add_bullet(doc, "第二步：在“收老师发的作业”里选择老师给的作业单文件，或把作业码粘贴到输入框后点击“导入作业码”。")
    add_bullet(doc, "第三步：在“我是谁”里选择或输入自己的名字。这一步不能跳过，练习记录按姓名归档。")
    add_bullet(doc, "第四步：作业卡片上会显示题型或关卡要求，点“去完成”直接进入对应练习；乐理页会自动选好题型与题量，节奏页会自动切到指定关卡。")
    add_bullet(doc, "第五步：练完回到作业页，卡片会显示“已完成”或“待完成”，以及当前成绩。")
    add_bullet(doc, "第六步：点击“导出我的成绩”，生成一个成绩文件交给老师。")

    doc.add_paragraph("12.5  收学生成绩", style="Heading 2")
    add_body(
        doc,
        "教师在教师面板点击“导入学生成绩”，选择学生交回的成绩文件即可。程序会把该学生的练习记录"
        "合并进本机记录，作业清单随即更新达标状态与人数。成绩文件之间互不影响，可以逐个学生导入；"
        "同一份文件重复导入不会重复计数。若文件格式不符，程序会提示导入失败并保持原有数据不变。",
    )

    doc.add_paragraph("12.6  教师视角的进入确认", style="Heading 2")
    add_body(
        doc,
        "打开“作业布置”页面时默认落在学生视角。每次点击“教师：布置与检查”都会弹出一次确认，"
        "确认后才进入教师视角；点击“学生：我的作业”可以随时切回学生视角，不需要确认。"
        "这项设置的目的是避免学生在自己的电脑上误改名单或误删作业。",
    )

    # ---------------- 13 数据备份与迁移 ----------------
    doc.add_paragraph("13  数据备份与迁移", style="Heading 1")
    add_body(
        doc,
        "练习记录、作业与班级名单都保存在本机。更换电脑或更换浏览器之前，"
        "在“数据备份”页面导出一次即可完整迁移。",
    )
    add_table(
        doc,
        ["操作", "说明"],
        [
            ["导出全部数据", "生成 JSON 备份文件，包含全部模块的记录与设置，是完整备份"],
            ["导出成绩汇总", "生成 CSV 文件，可用 Excel 或 WPS 打开，适合放入教学材料"],
            ["导入备份", "读取备份文件并写入本机，可选“合并”保留现有记录或“覆盖”先清空再写入"],
            ["清空数据", "删除本机全部记录与名单，需要手动输入确认文字后才会执行"],
        ],
        [4.0, 11.0],
    )

    # ---------------- 14 数据存储与隐私 ----------------
    doc.add_paragraph("14  数据存储与隐私", style="Heading 1")
    add_body(
        doc,
        "所有练习记录都保存在本机浏览器的本地存储空间中，不会上传到任何服务器，"
        "软件也不收集账号信息与使用行为数据。麦克风采集的声音只在本地即时分析，"
        "分析完成后立即丢弃，不会被录制或保存。",
    )
    add_body(
        doc,
        "如需清空记录，可在各练习页面点击“清空”，或在“数据备份”页面一次性清空；"
        "如需保留或迁移数据，请先在“数据备份”页面导出备份文件。",
    )
    add_body(
        doc,
        "作业单与成绩文件由使用者自行传递，例如通过班级群发送或使用移动存储拷贝，"
        "软件本身不会联网传输这些内容，也不包含任何自动上传通道。",
    )

    # ---------------- 11 常见问题 ----------------
    doc.add_paragraph("15  常见问题", style="Heading 1")
    add_table(
        doc,
        ["现象", "原因", "处理方法"],
        [
            ["双击桌面图标没有反应", "快捷方式指向的目录被移动", "直接双击软件目录中的“启动应用.bat”"],
            ["提示无法使用麦克风", "未授权或浏览器限制", "允许麦克风权限；使用本软件的启动脚本打开，不要直接双击网页文件"],
            ["敲击没有被识别", "灵敏度偏低", "在节奏闯关页面调高麦克风灵敏度，并靠近麦克风"],
            ["学生在自己电脑上看不到老师布置的作业", "作业保存在老师电脑本机，不会自动同步", "老师在教师面板导出作业单，或复制某条作业的作业码，交给学生导入"],
            ["学生练完仍提示“已练多次，但都不是某某题型”", "练习的题型不在作业指定的范围内", "让学生按作业卡上写明的题型重新练习"],
            ["作业一直显示“未开始”", "学生练习时没有选择自己的名字，记录被记到“本人”名下", "让学生在“我是谁”里填上姓名后重新练习"],
            ["判定整体偏早或偏晚", "音频输出存在延迟", "使用蓝牙设备时调整“延迟校准”参数"],
            ["页面提示服务已占用", "软件已在运行", "直接打开浏览器访问本地地址即可"],
            ["换电脑后记录消失", "记录保存在本机", "在原电脑导出 CSV，在新电脑上重新建立记录"],
            ["全屏后无法退出", "停留在全屏状态", "按 F 键或 Esc 键退出全屏"],
        ],
        widths=[3.6, 4.4, 7.2],
        font_size=9.5,
    )
    add_caption(doc, "表 11-1  常见问题与处理方法")

    # ---------------- 12 版权与开源声明 ----------------
    doc.add_paragraph("16  版权与开源声明", style="Heading 1")
    add_body(
        doc,
        "本软件基于开源项目 Chordz 二次开发。原项目采用 MIT 许可证发布，"
        "允许使用、修改与再发布，软件目录中保留了原始许可证文件与修改说明。",
    )
    add_body(doc, "二次开发与新增内容主要包括：")
    add_bullet(doc, "整体界面中文化，包括导航、按钮、提示语与页面标题。")
    add_bullet(doc, "品牌名称、图标与整体视觉风格重新设计。")
    add_bullet(doc, "新增节奏闯关模块，包含节拍网格、击打判定、评分与记录导出功能。")
    add_bullet(doc, "新增专注、浅色、大屏与全屏四种显示模式。")
    add_bullet(doc, "新增本地服务脚本与启动脚本，实现免安装、免联网运行。")
    add_bullet(doc, "将声音合成组件改为本地引用，保证离线可用。")
    add_body(
        doc,
        "软件中的音色与节拍声均由程序实时合成，未使用任何第三方录音、乐谱图片或版权素材。",
    )
    add_body(doc, "版权与作者：")
    add_body(
        doc,
        "© 西南大学·音乐声学实验室 · 西南大学·艺术人类学研究所 · 西南大学·中国音乐心理健康研究所",
    )
    add_body(doc, "作者：马荣寰 —— 324737404+mading686-dotcom@users.noreply.github.com")
    add_body(
        doc,
        "本软件由缙云声智维护。主站 https://sfk8815-create.github.io ｜ "
        "副站 https://acouscope.vercel.app ｜ GitHub https://github.com/sfk8815-create",
    )

    # ---------------- 附录 ----------------
    doc.add_page_break()
    doc.add_paragraph("附录 A  快捷键", style="Heading 1")
    add_table(
        doc,
        ["按键", "功能"],
        [
            ["F", "进入或退出全屏"],
            ["Esc", "退出全屏"],
            ["空格", "节奏闯关中的敲击键"],
        ],
        widths=[3.4, 11.8],
        font_size=10,
    )
    add_caption(doc, "表 A-1  快捷键一览")

    doc.add_paragraph("附录 B  主要文件清单", style="Heading 1")
    add_table(
        doc,
        ["文件或目录", "作用"],
        [
            ["home.html", "工作台首页"],
            ["rhythm-training.html", "节奏闯关模块"],
            ["theory-practice.html", "乐理考题模块"],
            ["score-training.html", "视奏训练模块"],
            ["training.html", "和弦练习入口"],
            ["metronome.html", "节拍基准"],
            ["chord-progressions.html", "进行曲库"],
            ["find-note.html", "音高识别"],
            ["find-scale.html", "听音辨调"],
            ["calculate-chords.html", "和弦找音"],
            ["wiki.html 及 wiki-*.html", "乐理手册文章"],
            ["guide.html", "上手引导"],
            ["class-manage.html", "班级管理"],
            ["homework.html", "作业布置与学生查看"],
            ["pretest-report.html", "前后测报告"],
            ["data-backup.html", "数据备份与迁移"],
            ["theme.css", "品牌配色与显示模式样式"],
            ["modes.js", "显示模式与全屏控制"],
            ["server.ps1", "本地服务脚本"],
            ["启动应用.bat", "应用模式启动"],
            ["启动.bat", "浏览器方式启动"],
            ["停止服务.bat", "停止本地服务"],
            ["manifest.json、sw.js、icons", "应用图标与离线缓存配置"],
        ],
        widths=[5.4, 9.8],
        font_size=9.5,
    )
    add_caption(doc, "表 B-1  主要文件清单")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    doc.save(OUT_PATH)
    print(f"已生成：{OUT_PATH}")


if __name__ == "__main__":
    build()
