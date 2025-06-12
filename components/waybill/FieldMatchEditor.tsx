'use client';

import { useState, useEffect } from 'react';
import { parseExcel } from '@/utils/parseExcelGeneric';
import { X } from 'lucide-react';
import { TemplateInfo, TemplateMode, FieldAreaBinding } from '@/types/template';

interface Props {
  template?: TemplateInfo;
  onSave: (template: TemplateInfo) => void;
  onCancel: () => void;
}

interface EditingBinding {
  cell: string;
  field: string;
  direction: 'horizontal' | 'vertical';
  length: number;
  isEditing: boolean;
  index?: number;
}

export default function FieldMatchEditor({ template, onSave, onCancel }: Props) {
  const [name, setName] = useState(template?.name || '');
  const [mode, setMode] = useState<TemplateMode>(template?.mode || 'grid');
  const [type, setType] = useState<'FBA' | '传统'>(template?.type || 'FBA'); // 新增 type 状态
  const [startRow, setStartRow] = useState(template?.startRow || 1);
  const [bindings, setBindings] = useState<FieldAreaBinding[]>(template?.bindings || []);
  const [columns, setColumns] = useState<string[]>(template?.columns || []);
  const [grid, setGrid] = useState<(string | number | undefined)[][]>([]);
  const [cells, setCells] = useState<Record<string, string | number | undefined>>({});
  const [file, setFile] = useState<File | null>(null);
  const [editingBinding, setEditingBinding] = useState<EditingBinding | null>(null);
  const [fieldSearch, setFieldSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // 系统字段定义，与 FBA 运单一致
  const SYSTEM_FIELDS = [
    { value: 'waybillNumber', label: '运单号' },
    { value: 'clientCode', label: '客户单号' },
    { value: 'ref1', label: '参考号一' },
    { value: 'ref2', label: '参考号二' },
    { value: 'poNumber', label: 'PO号' },
    { value: 'channel', label: '物流渠道' },
    { value: 'country', label: '国家' },
    { value: 'warehouse', label: '仓库地址' },
    { value: 'recipient', label: '收件人' },
    { value: 'address1', label: '地址一' },
    { value: 'address2', label: '地址二' },
    { value: 'address3', label: '地址三' },
    { value: 'city', label: '城市' },
    { value: 'state', label: '省份/州' },
    { value: 'postalCode', label: '邮编' },
    { value: 'phone', label: '电话' },
    { value: 'email', label: '邮箱' },
    { value: 'sender', label: '发件人姓名' },
    { value: 'company', label: '公司名称' },
    { value: 'senderAddress1', label: '发件人地址一' },
    { value: 'senderAddress2', label: '发件人地址二' },
    { value: 'senderAddress3', label: '发件人地址三' },
    { value: 'senderCity', label: '发件人城市' },
    { value: 'senderState', label: '发件人省份/州' },
    { value: 'senderPostalCode', label: '发件人邮编' },
    { value: 'senderCountry', label: '发件人国家' },
    { value: 'senderPhone', label: '发件人电话' },
    { value: 'senderEmail', label: '发件人邮箱' },
    { value: 'senderAddressCode', label: '发件人地址编码' },
    { value: 'boxCount', label: '件数' },
    { value: 'weight', label: '总重量' },
    { value: 'length', label: '总长' },
    { value: 'width', label: '总宽' },
    { value: 'height', label: '总高' },
    { value: 'chargeWeight', label: '计费重量' },
    { value: 'volumetricWeight', label: '材积重' },
    { value: 'volume', label: '总体积' },
    { value: 'billingPrecision', label: '计费精度' },
    { value: 'boxCode', label: '箱号' },
    { value: 'boxFullCode', label: '箱子完整编码' },
    { value: 'boxWeight', label: '箱子重量' },
    { value: 'boxLength', label: '箱子长' },
    { value: 'boxWidth', label: '箱子宽' },
    { value: 'boxHeight', label: '箱子高' },
    { value: 'boxDeclaredValue', label: '箱子申报价值' },
    { value: 'productName', label: '产品名称' },
    { value: 'productNameEn', label: '产品英文名称' },
    { value: 'productNameCn', label: '产品中文名称' },
    { value: 'material', label: '产品材质' },
    { value: 'sku', label: 'SKU' },
    { value: 'asin', label: 'ASIN' },
    { value: 'fnsku', label: 'FNSKU' },
    { value: 'hsCode', label: '海关编码' },
    { value: 'usage', label: '用途' },
    { value: 'brand', label: '品牌' },
    { value: 'model', label: '型号' },
    { value: 'declaredValue', label: '申报总价值' },
    { value: 'declaredQuantity', label: '申报数量' },
    { value: 'productWeight', label: '产品重量' },
    { value: 'hasBattery', label: '带电' },
    { value: 'hasMagnetic', label: '带磁' },
    { value: 'hasLiquid', label: '液体' },
    { value: 'hasPowder', label: '粉末' },
    { value: 'hasDangerous', label: '危险品' },
    { value: 'store', label: '店铺' },
    { value: 'vat', label: 'VAT号' },
    { value: 'ioss', label: 'IOSS号' },
    { value: 'eori', label: 'EORI号' },
    { value: 'currency', label: '币种' },
    { value: 'salesLink', label: '销售链接' },
    { value: 'salesPrice', label: '销售单价' },
    { value: 'imageLink', label: '图片链接' },
    { value: 'insurance', label: '是否购买保险' },
    { value: 'insuranceValue', label: '保险金额' },
    { value: 'insuranceCurrency', label: '保险币种' },
    { value: 'notes', label: '备注' },
    { value: 'category', label: '品类' },
    { value: 'trackingNumber', label: '跟踪号' },
    { value: 'isCOD', label: '货到付款' },
    { value: 'customsDeclaration', label: '报关方式' },
    { value: 'customsClearance', label: '清关方式' },
    { value: 'taxType', label: '税务类型' },
    { value: 'deliveryTerms', label: '交货条款' },
    { value: 'deliveryMethod', label: '派送方式' },
  ];

  // 加载模板关联的 Excel 文件
  useEffect(() => {
    if (template?.filePath && !file) {
      setIsLoading(true);
      setFileError(null);
      const sanitizedTemplateName = template.name.replace(/[<>:"/\\|?*]/g, '');
      const encodedName = encodeURIComponent(sanitizedTemplateName);
      console.debug(
        '加载模板，原始名称:',
        template.name,
        '清理后名称:',
        sanitizedTemplateName,
        '编码后:',
        encodedName,
      );
      const url = `/api/template-upload?name=${encodedName}`;
      console.debug(`尝试加载模板文件: ${url}`);
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`加载模板文件失败: ${res.status} ${res.statusText}`);
          }
          return res.blob();
        })
        .then((blob) => {
          const file = new File([blob], `${sanitizedTemplateName}.xlsx`, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          setFile(file);
          return parseExcel(file);
        })
        .then(({ grid: parsedGrid, cells: parsedCells }) => {
          setGrid(parsedGrid);
          setCells(parsedCells);
          console.debug('模板文件解析成功，表格数据已加载');
        })
        .catch((error) => {
          console.error('加载模板文件失败:', error);
          setFileError(
            `无法加载模板文件: ${error instanceof Error ? error.message : '未知错误'}。请检查模板名称或重新上传 Excel 文件`,
          );
        })
        .finally(() => {
          setIsLoading(false);
          console.debug('文件加载流程完成');
        });
    }
  }, [template?.filePath, file]);

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsLoading(true);
      setFileError(null);
      try {
        const { grid: parsedGrid, cells: parsedCells } = await parseExcel(selectedFile);
        setGrid(parsedGrid);
        setCells(parsedCells);
        console.debug('新上传的 Excel 文件解析成功');
      } catch (error) {
        setFileError(`解析 Excel 文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
        console.error('解析 Excel 文件失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 上传 Excel 文件到服务器
  const uploadTemplateFile = async (file: File, templateName: string) => {
    const sanitizedTemplateName = templateName.replace(/[<>:"/\\|?*]/g, '');
    console.debug('上传文件，清理后名称:', sanitizedTemplateName);
    if (!sanitizedTemplateName) {
      throw new Error('模板名称无效');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('templateName', sanitizedTemplateName);

    try {
      const response = await fetch('/api/template-upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '上传文件失败');
      }
      console.debug(`文件上传成功，路径: ${result.filePath}`);
      return result.filePath;
    } catch (error) {
      console.error('上传模板文件失败:', error);
      throw error;
    }
  };

  // 保存模板
  const saveTemplate = async () => {
    if (!name || name.trim() === '') {
      alert('模板名称不能为空');
      return;
    }
    const sanitizedTemplateName = name.replace(/[<>:"/\\|?*]/g, '');
    console.debug('原始名称:', name, '清理后名称:', sanitizedTemplateName);
    if (!sanitizedTemplateName) {
      alert('模板名称需包含中文、字母、数字、空格等有效字符');
      return;
    }
    if (mode === 'fixed' && columns.length === 0) {
      alert('请至少配置一列字段');
      return;
    }
    if ((mode === 'grid' || mode === 'directional') && bindings.length === 0) {
      alert('请至少配置一个字段绑定');
      return;
    }
    if (!file && !template?.filePath) {
      alert('请上传 Excel 文件');
      return;
    }

    try {
      let filePath = template?.filePath;
      if (file) {
        filePath = await uploadTemplateFile(file, sanitizedTemplateName);
      }

      const newTemplate: TemplateInfo = {
        id: template?.id || `template_${Date.now()}`,
        name: sanitizedTemplateName,
        mode,
        type,
        startRow,
        bindings: mode === 'fixed' ? undefined : bindings,
        columns: mode === 'fixed' ? columns : undefined,
        filePath,
      };

      const templates = JSON.parse(
        localStorage.getItem('excelTemplates') || '[]',
      ) as TemplateInfo[];
      const existing = templates.find((t) => t.name === name && t.id !== newTemplate.id);
      if (existing) {
        alert('模板名称已存在，请选择其他名称');
        return;
      }

      onSave(newTemplate);
      console.debug('模板保存成功:', newTemplate);
    } catch (error) {
      alert(`保存模板失败: ${error instanceof Error ? error.message : '未知错误'}`);
      console.error('保存模板失败:', error);
    }
  };

  // 生成列字母（A, B, C, ..., Z, AA, AB, ..., AZ）
  const columnLetters = Array.from({ length: 52 }, (_, i) => {
    if (i < 26) return String.fromCharCode(65 + i);
    const first = String.fromCharCode(65 + Math.floor((i - 26) / 26));
    const second = String.fromCharCode(65 + ((i - 26) % 26));
    return first + second;
  });

  // 将列字母转换为索引（A=0, B=1, ..., Z=25, AA=26, AB=27, ...）
  const columnToIndex = (col: string): number => {
    return (
      col
        .split('')
        .reduce(
          (acc, char, i) => acc + (char.charCodeAt(0) - 65 + 1) * Math.pow(26, col.length - i - 1),
          0,
        ) - 1
    );
  };

  // 将索引转换为列字母
  const indexToColumn = (index: number): string => {
    if (index < 26) return String.fromCharCode(65 + index);
    const first = Math.floor(index / 26) - 1;
    const second = index % 26;
    return String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
  };

  // 处理单元格点击
  const handleCellClick = (cellKey: string, bindingIndex?: number) => {
    if (mode === 'fixed') return;

    if (bindingIndex !== undefined) {
      const binding = bindings[bindingIndex];
      setEditingBinding({
        cell: cellKey,
        field: binding.field,
        direction: binding.direction,
        length: binding.length,
        isEditing: true,
        index: bindingIndex,
      });
    } else {
      setEditingBinding({
        cell: cellKey,
        field: '',
        direction: 'vertical',
        length: 1,
        isEditing: false,
      });
    }
  };

  // 处理绑定确认
  const handleBindingConfirm = (
    field: string,
    direction: 'horizontal' | 'vertical',
    length: number,
  ) => {
    if (!editingBinding || !field) {
      setEditingBinding(null);
      return;
    }

    const match = editingBinding.cell.match(/^([A-Z]+)(\d+)$/);
    if (!match) {
      alert('无效的单元格地址');
      return;
    }

    const col = match[1];
    const row = parseInt(match[2], 10);
    const colIndex = columnToIndex(col);
    const rowIndex = row - 1;
    const validLength = Math.max(1, length);

    if (direction === 'vertical' && rowIndex + validLength > 20) {
      alert('绑定范围超出表格行数（最大 20 行）');
      return;
    }
    if (direction === 'horizontal' && colIndex + validLength > 52) {
      alert('绑定范围超出表格列数（最大 52 列）');
      return;
    }

    const newBindings = [...bindings];
    const newBinding: FieldAreaBinding = {
      field,
      from: editingBinding.cell,
      direction,
      length: validLength,
    };

    if (editingBinding.isEditing && editingBinding.index !== undefined) {
      newBindings[editingBinding.index] = newBinding;
    } else {
      newBindings.push(newBinding);
    }

    setBindings(newBindings);
    setEditingBinding(null);
    setFieldSearch('');
  };

  // 删除绑定
  const handleBindingDelete = (index: number) => {
    const newBindings = [...bindings];
    newBindings.splice(index, 1);
    setBindings(newBindings);
  };

  // 处理固定列顺序映射
  const handleFixedColumnMapping = (index: number, field: string) => {
    const newColumns = [...columns];
    newColumns[index] = field || '';
    setColumns(newColumns.filter((col) => col));
  };

  // 判断单元格是否在绑定区域内
  const isCellInBinding = (cellKey: string): { field: string; index: number } | null => {
    const match = cellKey.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    const col = match[1];
    const row = parseInt(match[2], 10);
    const colIndex = columnToIndex(col);
    const rowIndex = row - 1;

    for (let i = 0; i < bindings.length; i++) {
      const binding = bindings[i];
      const { from, direction, length } = binding;
      const fromMatch = from.match(/^([A-Z]+)(\d+)$/);
      if (!fromMatch) continue;
      const fromCol = fromMatch[1];
      const fromRow = parseInt(fromMatch[2], 10);
      const fromColIndex = columnToIndex(fromCol);
      const fromRowIndex = fromRow - 1;

      if (direction === 'horizontal') {
        if (
          fromRowIndex === rowIndex &&
          colIndex >= fromColIndex &&
          colIndex < fromColIndex + length
        ) {
          return { field: binding.field, index: i };
        }
      } else {
        if (
          fromColIndex === colIndex &&
          rowIndex >= fromRowIndex &&
          rowIndex < fromRowIndex + length
        ) {
          return { field: binding.field, index: i };
        }
      }
    }
    return null;
  };

  // 获取字段的中文显示名
  const getFieldLabel = (fieldValue: string): string => {
    const field = SYSTEM_FIELDS.find((f) => f.value === fieldValue);
    return field ? field.label : fieldValue;
  };

  // 过滤字段
  const filteredFields = SYSTEM_FIELDS.filter((f) =>
    fieldSearch
      ? f.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
        f.value.toLowerCase().includes(fieldSearch.toLowerCase())
      : true,
  );

  return (
    <div className="fixed inset-0 bg-white p-8 z-50 shadow-xl overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{template ? '编辑字段绑定配置' : '新建字段绑定配置'}</h2>
        <button className="text-gray-500 hover:text-black" onClick={onCancel}>
          <X className="w-6 h-6" />
        </button>
      </div>
      {isLoading && <div className="text-sm text-gray-500 mb-4">正在加载模板文件...</div>}
      {fileError && <div className="text-sm text-red-500 mb-4">{fileError}</div>}
      <div className="space-y-6">
        {/* 模板名称 */}
        <div>
          <label className="text-sm text-gray-500 mb-1">模板名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded-xl"
            placeholder="请输入模板名称"
          />
        </div>

        {/* 模板类型 */}
        <div>
          <label className="text-sm text-gray-500 mb-1">模板类型</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'FBA' | '传统')}
            className="border p-2 w-full rounded-xl"
          >
            <option value="FBA">FBA</option>
            <option value="传统">传统</option>
          </select>
        </div>

        {/* 文件上传 */}
        <div>
          <label className="text-sm text-gray-500 mb-1">
            上传 Excel（{template ? '可选，替换现有文件' : '必填'}）
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-100 file:text-indigo-700
              hover:file:bg-indigo-200"
          />
          {template?.filePath && !file && (
            <p className="text-sm text-gray-500 mt-1">当前文件：{template.filePath}</p>
          )}
        </div>

        {/* 模式选择 */}
        <div>
          <label className="text-sm text-gray-500 mb-1">模板模式</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                value="grid"
                checked={mode === 'grid'}
                onChange={() => setMode('grid')}
              />
              可视化格子绑定
            </label>
            <label>
              <input
                type="radio"
                value="directional"
                checked={mode === 'directional'}
                onChange={() => setMode('directional')}
              />
              按行/列方向配置
            </label>
            <label>
              <input
                type="radio"
                value="fixed"
                checked={mode === 'fixed'}
                onChange={() => setMode('fixed')}
              />
              固定列顺序绑定
            </label>
          </div>
        </div>

        {/* 起始数据行（仅 fixed 模式） */}
        {mode === 'fixed' && (
          <div>
            <label className="text-sm text-gray-500 mb-1">起始数据行</label>
            <input
              type="number"
              value={startRow}
              onChange={(e) => setStartRow(parseInt(e.target.value) || 1)}
              className="border p-2 w-full rounded-xl"
              min="1"
            />
          </div>
        )}

        {/* 当前绑定状态（grid 和 directional 模式） */}
        {(mode === 'grid' || mode === 'directional') && bindings.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm text-gray-500 mb-1">当前绑定</h3>
            <div className="border p-4 rounded-xl bg-gray-50">
              {bindings.map((binding, index) => {
                const { from, direction, length } = binding;
                const match = from.match(/^([A-Z]+)(\d+)$/);
                if (!match) return null;
                const col = match[1];
                const row = parseInt(match[2], 10);
                const colIndex = columnToIndex(col);
                const endCell =
                  direction === 'horizontal'
                    ? `${indexToColumn(colIndex + length - 1)}${row}`
                    : `${col}${row + length - 1}`;
                return (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span>
                      {getFieldLabel(binding.field)} → {from} ~ {endCell}
                    </span>
                    <button
                      className="text-red-500 text-sm"
                      onClick={() => handleBindingDelete(index)}
                    >
                      移除
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 当前列顺序绑定（fixed 模式） */}
        {mode === 'fixed' && columns.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm text-gray-500 mb-1">当前列顺序绑定</h3>
            <div className="border p-4 rounded-xl bg-gray-50">
              {columns.map((field, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <span>
                    {columnLetters[index]}列 → {getFieldLabel(field)}
                  </span>
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => {
                      const newColumns = [...columns];
                      newColumns.splice(index, 1);
                      setColumns(newColumns);
                    }}
                  >
                    移除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 可视化表格（grid 和 directional 模式） */}
        {(mode === 'grid' || mode === 'directional') && grid.length > 0 && (
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Excel 表格预览</h3>
            <div className="overflow-x-auto">
              <table className="border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100"></th>
                    {columnLetters.slice(0, 20).map((col) => (
                      <th key={col} className="border p-2 bg-gray-100">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="border p-2 bg-gray-100">{rowIndex + 1}</td>
                      {row.map((cell, colIndex) => {
                        const cellKey = `${columnLetters[colIndex]}${rowIndex + 1}`;
                        const bindingInfo = isCellInBinding(cellKey);
                        return (
                          <td
                            key={cellKey}
                            className={`border p-2 hover:bg-indigo-100 cursor-pointer relative ${
                              bindingInfo
                                ? bindingInfo.index % 2 === 0
                                  ? 'bg-gray-200'
                                  : 'bg-blue-200'
                                : ''
                            }`}
                            onClick={() => handleCellClick(cellKey, bindingInfo?.index)}
                          >
                            {cell}
                            {bindingInfo && (
                              <div className="text-xs text-gray-400 absolute bottom-1 right-1">
                                {getFieldLabel(bindingInfo.field)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 固定列顺序绑定配置 */}
        {mode === 'fixed' && (
          <div>
            <h3 className="text-sm text-gray-500 mb-1">固定列顺序绑定</h3>
            <div className="space-y-2">
              {columnLetters.slice(0, 10).map((col, index) => (
                <div key={col} className="flex items-center gap-2">
                  <span>{col}列</span>
                  <select
                    value={columns[index] || ''}
                    onChange={(e) => handleFixedColumnMapping(index, e.target.value)}
                    className="border p-2 rounded-xl"
                  >
                    <option value="">请选择字段</option>
                    {SYSTEM_FIELDS.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* 字段绑定弹窗（grid 和 directional 模式） */}
      {editingBinding && (mode === 'grid' || mode === 'directional') && (
        <div className="fixed top-[200px] left-[500px] bg-white border p-4 shadow-lg rounded-xl z-60">
          <p className="mb-2">当前格子：{editingBinding.cell}</p>
          <div className="space-y-2">
            <div>
              <label className="text-sm">字段名</label>
              <input
                list="field-options"
                placeholder="输入或选择字段"
                className="border p-2 w-full rounded-xl"
                value={fieldSearch}
                onChange={(e) => {
                  setFieldSearch(e.target.value);
                  const matchedField = SYSTEM_FIELDS.find(
                    (f) =>
                      f.label.toLowerCase() === e.target.value.toLowerCase() ||
                      f.value.toLowerCase() === e.target.value.toLowerCase(),
                  );
                  setEditingBinding({
                    ...editingBinding,
                    field: matchedField ? matchedField.value : '',
                  });
                }}
              />
              <datalist id="field-options">
                {filteredFields.map((field) => (
                  <option key={field.value} value={field.label} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-sm">绑定方向</label>
              <div className="flex gap-2">
                <label>
                  <input
                    type="radio"
                    value="vertical"
                    checked={editingBinding.direction === 'vertical'}
                    onChange={() =>
                      setEditingBinding({
                        ...editingBinding,
                        direction: 'vertical',
                      })
                    }
                  />
                  向下
                </label>
                <label>
                  <input
                    type="radio"
                    value="horizontal"
                    checked={editingBinding.direction === 'horizontal'}
                    onChange={() =>
                      setEditingBinding({
                        ...editingBinding,
                        direction: 'horizontal',
                      })
                    }
                  />
                  向右
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm">
                绑定范围（
                {editingBinding.direction === 'vertical' ? '向下几行' : '向右几列'}）
              </label>
              <input
                type="number"
                value={editingBinding.length}
                onChange={(e) =>
                  setEditingBinding({
                    ...editingBinding,
                    length: parseInt(e.target.value) || 1,
                  })
                }
                className="border p-2 w-full rounded-xl"
                min="1"
              />
            </div>
            <p className="text-sm text-gray-500">
              说明：将绑定 {editingBinding.cell} ~{' '}
              {(() => {
                const match = editingBinding.cell.match(/^([A-Z]+)(\d+)$/);
                if (!match) return '无效范围';
                const col = match[1];
                const row = parseInt(match[2], 10);
                const colIndex = columnToIndex(col);
                const length = Math.max(1, editingBinding.length);
                if (editingBinding.direction === 'vertical') {
                  return `${col}${row + length - 1}`;
                } else {
                  return `${indexToColumn(colIndex + length - 1)}${row}`;
                }
              })()}{' '}
              为 {editingBinding.field ? getFieldLabel(editingBinding.field) : '所选字段'}
            </p>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
              onClick={() =>
                handleBindingConfirm(
                  editingBinding.field,
                  editingBinding.direction,
                  editingBinding.length,
                )
              }
            >
              确定
            </button>
            <button
              className="bg-gray-300 px-4 py-2 rounded-xl"
              onClick={() => {
                setEditingBinding(null);
                setFieldSearch('');
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
      <div className="mt-6 flex gap-4">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl" onClick={saveTemplate}>
          保存模板
        </button>
        <button className="bg-gray-300 px-4 py-2 rounded-xl" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}
