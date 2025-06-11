# -*- coding: utf-8 -*-
import sys
import io
import os
import fitz  # PyMuPDF
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_last_page_data(pdf_path):
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    page = doc.load_page(total_pages - 1)
    lines = page.get_text("text").split("\n")
    lines = [line.strip() for line in lines if line.strip()]
    text = "\n".join(lines)

    to_address = ""
    from_address = ""
    to_country = ""
    from_country = ""

    if "目的地" in text:
        to_block = text.split("目的地", 1)[-1]
        to_lines = []
        for line in to_block.strip().split("\n"):
            line = line.strip()
            if "日本" in line:
                to_country = "日本"
                break
            to_lines.append(line.lstrip("：:").strip())
        to_address = "\n".join(to_lines)

    if "发货地" in text:
        from_block = text.split("发货地", 1)[-1]
        from_lines = []
        found_end = False
        for line in from_block.strip().split("\n"):
            line = line.strip()
            if found_end:
                continue
            elif any(kw in line.lower() for kw in ["sku", "件数", "数量", "商品"]):
                continue
            elif "中国" in line or "china" in line.lower():
                from_country = "中国"
                found_end = True
            else:
                from_lines.append(line.lstrip("：:").strip())
        from_address = "\n".join(from_lines)

    return {
        "文件名": os.path.basename(pdf_path),
        "箱数": total_pages,
        "发货地址": from_address,
        "收货地址": to_address,
        "发货国家": from_country,
        "收货国家": to_country
    }

if __name__ == "__main__":
    file_path = sys.argv[1]  # 前端上传后传给 Python 的路径
    result = extract_last_page_data(file_path)
    print(json.dumps(result, ensure_ascii=False))
