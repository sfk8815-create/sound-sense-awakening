# -*- coding: utf-8 -*-
"""结构性校验说明书 DOCX。"""

import os
import zipfile
from docx import Document
from docx.shared import Pt

PATH = "outputs/乐感工坊_软件说明书_V1.0.docx"

print(f"文件存在: {os.path.exists(PATH)}")
print(f"文件大小: {os.path.getsize(PATH)} 字节")

with zipfile.ZipFile(PATH) as archive:
    bad = archive.testzip()
    print(f"压缩包完整性: {'正常' if bad is None else '损坏 -> ' + str(bad)}")
    print(f"包含文件数: {len(archive.namelist())}")

doc = Document(PATH)
print(f"段落总数: {len(doc.paragraphs)}")
print(f"表格总数: {len(doc.tables)}")

print("\n--- 标题结构 ---")
for paragraph in doc.paragraphs:
    style = paragraph.style.name
    text = paragraph.text.strip()
    if not text:
        continue
    if style.startswith("Heading") or style == "Title":
        print(f"[{style}] {text}")

print("\n--- 表格概况 ---")
for index, table in enumerate(doc.tables, start=1):
    header = " | ".join(cell.text.strip() for cell in table.rows[0].cells)
    print(f"表 {index}: {len(table.rows)} 行 x {len(table.columns)} 列 -> {header}")

print("\n--- 空白段落检查 ---")
empty = sum(1 for p in doc.paragraphs if not p.text.strip())
print(f"空白段落数: {empty}（用于分隔与 spacing，属正常）")

print("\n--- 字体抽查 ---")
checked = 0
for paragraph in doc.paragraphs:
    if paragraph.text.strip() and paragraph.runs:
        run = paragraph.runs[0]
        size = run.font.size.pt if run.font.size else "继承"
        print(f"「{paragraph.text.strip()[:18]}」 字号={size}")
        checked += 1
        if checked >= 6:
            break

sections = doc.sections
print(f"\n页面尺寸: {sections[0].page_width.cm:.1f} x {sections[0].page_height.cm:.1f} cm")
print(f"页边距: 上 {sections[0].top_margin.cm:.1f} / 下 {sections[0].bottom_margin.cm:.1f} / 左 {sections[0].left_margin.cm:.1f} / 右 {sections[0].right_margin.cm:.1f} cm")
