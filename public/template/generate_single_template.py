import openpyxl
from pathlib import Path

# 定义字段表头
headers = [
    "客户订单号", "是否带电", "是否带磁", "是否液体", "是否粉末", "是否危险品", "服务", "地址库编码",
    "收件人姓名", "收件人公司", "收件人地址一", "收件人地址二", "收件人地址三", "收件人城市",
    "收件人省份/州", "收件人邮编", "收件人国家代码", "收件人电话", "收件人邮箱", "店铺",
    "参考号一", "VAT号", "备注", "购买保险", "箱数", "货箱编号", "货箱重量(KG)", "货箱长度(CM)",
    "货箱宽度(CM)", "货箱高度(CM)", "产品英文品名", "产品中文品名", "产品申报单价", "产品申报数量",
    "产品材质", "产品海关编码", "产品用途", "产品品牌", "产品型号", "产品SKU", "产品ASIN", "产品FNSKU"
]

# 示例数据
sample_data = [
    "CC001", "是", "否", "否", "否", "否", "专线速运", "ADDR001", "Tom", "ABC Corp",
    "Am Wald 1", "", "", "Oranienburg", "Brandenburg", "16515", "DE", "+1234567890",
    "example@domain.com", "Store001", "REF001", "VAT123456", "Handle with care", "是", 1,
    "BOX001", 10.5, 50, 30, 20, "Phone Case", "手机壳", 3, 30, "PU", "HS123456",
    "Personal Use", "BrandX", "ModelY", "SKU001", "ASIN123", "FNSKU123"
]

# 创建 Excel 文件
def create_excel_template(output_path):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "单票运单导入模板"

    # 写入表头
    ws.append(headers)

    # 写入示例数据
    ws.append(sample_data)

    # 调整列宽
    for col in ws.columns:
        max_length = 0
        column = col[0].column_letter
        for cell in col:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 2) * 1.2
        ws.column_dimensions[column].width = adjusted_width

    # 保存文件
    wb.save(output_path)
    print(f"Excel 模板已生成：{output_path}")

# 输出路径
output_dir = Path("public/template")
output_dir.mkdir(parents=True, exist_ok=True)
output_path = output_dir / "单票运单导入模板.xlsx"

# 生成文件
create_excel_template(output_path)