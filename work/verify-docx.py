# -*- coding: utf-8 -*-
"""通用 DOCX 结构校验。"""

import os
import sys
import zipfile
from docx import Document

path = sys.argv[1]

print(f"文件: {os.path.basename(path)}")
print(f"存在: {os.path.exists(path)}，大小: {os.path.getsize(path)} 字节")

with zipfile.ZipFile(path) as archive:
    print(f"压缩包完整性: {'正常' if archive.testzip() is None else '损坏'}")

doc = Document(path)
print(f"段落数: {len(doc.paragraphs)}，表格数: {len(doc.tables)}")

print("\n--- 标题结构 ---")
for paragraph in doc.paragraphs:
    text = paragraph.text.strip()
    if text and (paragraph.style.name.startswith("Heading") or paragraph.style.name == "Title"):
        print(f"[{paragraph.style.name}] {text}")

print("\n--- 表格 ---")
for index, table in enumerate(doc.tables, start=1):
    header = " | ".join(cell.text.strip() for cell in table.rows[0].cells)
    print(f"表 {index}: {len(table.rows)} 行 x {len(table.columns)} 列 -> {header}")
