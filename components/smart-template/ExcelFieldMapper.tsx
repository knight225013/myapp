'use client';
import { useState } from 'react';

interface Props {
  columns: string[];
  onConfirm: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

export default function ExcelFieldMapper({ columns, onConfirm, onCancel }: Props) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({}); // 每列的搜索关键词

  const SYSTEM_FIELDS = [
    { value: 'waybillNumber', label: '运单号' },
    { value: 'clientCode', label: '客户单号' },
    { value: 'weight', label: '总重量' },
    { value: 'length', label: '总长' },
    { value: 'width', label: '总宽' },
    { value: 'height', label: '总高' },
    { value: 'productName', label: '产品名称' },
    { value: 'productNameEn', label: '产品英文名' },
    { value: 'productNameCn', label: '产品中文名' },
    { value: 'material', label: '产品材质' },
    { value: 'sku', label: 'SKU' },
    { value: 'hsCode', label: '海关编码' },
    { value: 'usage', label: '用途' },
    { value: 'brand', label: '品牌' },
    { value: 'model', label: '型号' },
    { value: 'asin', label: 'ASIN' },
    { value: 'fnsku', label: 'FNSKU' },
    { value: 'company', label: '公司名称' },
    { value: 'phone', label: '电话' },
    { value: 'store', label: '店铺' },
    { value: 'vat', label: 'VAT号' },
    { value: 'ioss', label: 'IOSS号' },
    { value: 'eori', label: 'EORI号' },
    { value: 'notes', label: '备注' },
    { value: 'hasBattery', label: '是否带电' },
    { value: 'hasMagnetic', label: '是否带磁' },
    { value: 'hasDangerous', label: '是否危险品' },
    { value: 'hasLiquid', label: '是否液体' },
    { value: 'hasPowder', label: '是否粉末' },
    { value: 'declaredValue', label: '申报价值' },
    { value: 'declaredQuantity', label: '申报数量' },
    { value: 'channelName', label: '物流渠道' },
    { value: 'country', label: '国家' },
    { value: 'warehouse', label: '仓库地址' },
    { value: 'boxCount', label: '件数' },
    { value: 'recipient', label: '收件人姓名' },
    { value: 'address1', label: '收件人地址一' },
    { value: 'address2', label: '收件人地址二' },
    { value: 'address3', label: '收件人地址三' },
    { value: 'city', label: '城市' },
    { value: 'state', label: '省份/州' },
    { value: 'postalCode', label: '邮编' },
    { value: 'email', label: '邮箱' },
    { value: 'ref1', label: '参考号一' },
    { value: 'currency', label: '申报币种' },
    { value: 'insurance', label: '是否购买保险' },
    // 箱子相关字段，支持动态映射
    { value: 'boxes.code', label: '箱号 (code)' },
    { value: 'boxes.fullCode', label: '箱号编码 (fullCode)' },
    { value: 'boxes.weight', label: '箱子重量 (weight)' },
    { value: 'boxes.length', label: '箱子长 (length)' },
    { value: 'boxes.width', label: '箱子宽 (width)' },
    { value: 'boxes.height', label: '箱子高 (height)' },
    { value: 'boxes.hasBattery', label: '是否带电 (hasBattery)' },
  ];

  // 过滤字段选项
  const filterFields = (col: string) => {
    const search = searchTerms[col]?.toLowerCase() || '';
    return SYSTEM_FIELDS.filter(
      (field) =>
        field.label.toLowerCase().includes(search) || field.value.toLowerCase().includes(search),
    );
  };

  return (
    <div className="fixed inset-0 bg-white p-8 z-50 shadow-xl overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">字段匹配</h2>
      {columns.map((col) => (
        <div className="mb-3" key={col}>
          <label className="text-sm">{col}</label>
          {/* 搜索输入框 */}
          <input
            type="text"
            placeholder="搜索字段..."
            value={searchTerms[col] || ''}
            onChange={(e) => setSearchTerms({ ...searchTerms, [col]: e.target.value })}
            className="border p-2 w-full rounded-xl mb-2"
          />
          <select
            className="border p-2 w-full rounded-xl"
            value={mapping[col] || ''}
            onChange={(e) => setMapping({ ...mapping, [col]: e.target.value })}
          >
            <option value="">请选择系统字段</option>
            {filterFields(col).map((sysField) => (
              <option key={sysField.value} value={sysField.value}>
                {sysField.label} ({sysField.value})
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className="mt-6 flex gap-4">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
          onClick={() => onConfirm(mapping)}
        >
          确定导入
        </button>
        <button className="bg-gray-300 px-4 py-2 rounded-xl" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}
