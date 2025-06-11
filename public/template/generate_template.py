import pandas as pd

# 字段别名（系统字段 -> Excel 列名）
FIELD_ALIASES = {
    "clientCode": "客户订单号",
    "channel": "服务*",
    "warehouse": "地址库编码",
    "recipient": "收件人姓名*",
    "company": "收件人公司",
    "address1": "收件人地址一*",
    "address2": "收件人地址二",
    "address3": "收件人地址三",
    "city": "收件人城市*",
    "state": "收件人省份/州",
    "postalCode": "收件人邮编*",
    "country": "收件人国家代码(二字代码)*",
    "phone": "收件人电话",
    "email": "收件人邮箱",
    "vat": "VAT号*",
    "ref1": "参考号一",
    "ref2": "参考号二",
    "notes": "备注",
    "poNumber": "PO Number",
    "insurance": "购买保险",
    "insuranceValue": "保价",
    "insuranceCurrency": "投保币种",
    "boxCount": "箱数",
    "waybillNumber": "货箱编号*",
    "weight": "货箱重量(KG)*",
    "length": "货箱长度(CM)*",
    "width": "货箱宽度(CM)*",
    "height": "货箱高度(CM)*",
    "productNameEn": "产品英文品名*",
    "productNameCn": "产品中文品名*",
    "declaredValue": "产品申报单价*",
    "declaredQuantity": "产品申报数量*",
    "material": "产品材质*",
    "hsCode": "产品海关编码*",
    "usage": "产品用途*",
    "brand": "产品品牌*",
    "model": "产品型号*",
    "salesLink": "产品销售链接",
    "salesPrice": "产品销售价格",
    "imageLink": "产品图片链接",
    "productWeight": "产品重量(kg)",
    "asin": "产品ASIN",
    "fnsku": "产品FNSKU",
    "sku": "产品SKU",
    "hasBattery": "带电*",
    "hasMagnetic": "带磁*",
    "hasLiquid": "液体*",
    "hasPowder": "粉末*",
    "hasDangerous": "危险品*",
    "customsDeclaration": "报关方式*",
    "customsClearance": "清关方式",
    "taxMethod": "交税方式",
    "deliveryTerms": "交货条款",
    "deliveryMethod": "派送方式",
    "store": "店铺",
    "senderAddressCode": "发件人地址编码",
    "senderName": "发件人姓名",
    "senderCompany": "发件人公司",
    "senderAddress1": "发件人地址一",
    "senderAddress2": "发件人地址二",
    "senderAddress3": "发件人地址三",
    "senderCity": "发件人城市",
    "senderState": "发件人省份/州",
    "senderPostalCode": "发件人邮编",
    "senderCountry": "发件人国家代码(二字代码)",
    "senderPhone": "发件人电话",
    "senderEmail": "发件人邮箱"
}

def generate_template(output_path: str = "public/template/单票导入模版.xlsx"):
    """
    生成单票导入模板 Excel 文件。
    
    Args:
        output_path (str): 输出 Excel 文件路径
    """
    try:
        # 创建空 DataFrame，列名为 FIELD_ALIASES 的值
        columns = list(FIELD_ALIASES.values())
        df = pd.DataFrame(columns=columns)
        
        # 设置默认值（示例数据，实际模板可为空）
        default_row = {
            "带电*": "否",
            "带磁*": "否",
            "液体*": "否",
            "粉末*": "否",
            "危险品*": "否",
            "购买保险": "否"
        }
        df.loc[0] = pd.Series(default_row)
        
        # 保存到 Excel
        df.to_excel(output_path, index=False, engine='openpyxl')
        print(f"模板已生成: {output_path}")
        
    except Exception as e:
        print(f"生成模板失败: {str(e)}")

if __name__ == "__main__":
    generate_template()