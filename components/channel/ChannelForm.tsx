'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { v4 as uuid } from 'uuid';
import FeeRuleSelectorDialog from '@/components/smart-template/fee-rules/FeeRuleSelectorDialog';
import FeeRuleCardList from '@/components/smart-template/fee-rules/FeeRuleCardList';
import { FeeRule } from '@/components/smart-template/fee-rules/types';
import { modules } from '@/components/smart-template/fee-rules/config';
import { FormData, ChannelFormProps, WaybillRule } from '@/components/channelTypes';

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>;
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        className="w-full p-2 border rounded"
        value={value ?? ''}
        onChange={onChange}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        className="w-full p-2 border rounded"
        value={value ?? ''}
        onChange={onChange}
      />
    </div>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: string[] | WaybillRule[] | { label: string; value: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select className="w-full p-2 border rounded" value={value ?? ''} onChange={onChange}>
        <option value="">请选择</option>
        {options.map((option) =>
          typeof option === 'string' ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : 'id' in option ? (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
    </div>
  );
}

function CheckboxInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
        checked={value}
        onChange={onChange}
      />
      <label className="ml-2 text-sm text-gray-700">{label}</label>
    </div>
  );
}

export default function ChannelForm({
  isOpen,
  onClose,
  initialData,
  onSubmitSuccess,
}: ChannelFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    type: '',
    country: undefined,
    warehouse: undefined,
    origin: undefined,
    currency: 'CNY',
    decimal: undefined,
    method: undefined,
    rounding: undefined,
    compareMode: 'round_then_compare',
    volRatio: undefined,
    cubeRatio: undefined,
    splitRatio: undefined,
    chargeMethod: undefined,
    minCharge: undefined,
    ticketPrecision: undefined,
    boxPrecision: undefined,
    sizePrecision: undefined,
    minPieces: undefined,
    maxPieces: undefined,
    minBoxRealWeight: undefined,
    minBoxMaterialWeight: undefined,
    minBoxChargeWeight: undefined,
    minBoxAvgWeight: undefined,
    minTicketChargeWeight: undefined,
    maxTicketChargeWeight: undefined,
    minTicketRealWeight: undefined,
    maxTicketRealWeight: undefined,
    minBoxRealWeightLimit: undefined,
    maxBoxRealWeight: undefined,
    minBoxChargeWeightLimit: undefined,
    maxBoxChargeWeight: undefined,
    minDeclareValue: undefined,
    maxDeclareValue: undefined,
    aging: undefined,
    waybillRule: undefined,
    labelCode: undefined,
    assignedUser: undefined,
    userLevel: undefined,
    declareCurrency: undefined,
    defaultDeclareCurrency: undefined,
    sender: undefined,
    showWeight: false,
    showSize: false,
    requireWeight: false,
    requireSize: false,
    requirePhone: false,
    requireEmail: false,
    requirePackingList: false,
    verifySalesLink: false,
    verifyImageLink: false,
    requireVAT: false,
    requireVATFiling: false,
    requireEORI: false,
    enableBilling: false,
    showBilling: false,
    controlBilling: false,
    controlReceivingFee: false,
    promptUnderpayment: false,
    modifyVolRatio: false,
    showSupplierData: false,
    orderBySKULibrary: false,
    allowCancel: false,
    noAutoCancelAPIFail: false,
    allowChannelChange: false,
    allowEdit: false,
    allowTrackingEntry: false,
    allowLabelUpload: false,
    hideCarrier: false,
    refundOnReturn: false,
    noRefundOnCancel: false,
    showInWMS: false,
    enableCOD: false,
    restrictWarehouseCode: false,
    roundBeforeSplit: false,
    feeRules: [],
    rates: [],
    chargeWeight: undefined,
    chargeVolume: undefined,
    chargePrice: undefined,
    unitType: 'KG',
    ...(initialData && {
      ...initialData,
      feeRules: Array.isArray(initialData.feeRules) ? initialData.feeRules : [],
      rates: Array.isArray(initialData.rates) ? initialData.rates : [],
    }),
  });
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [waybillRules, setWaybillRules] = useState<WaybillRule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formComponents = Object.fromEntries(
    modules.flatMap((m) => m.types.map((t) => [t.id, t.formComponent])),
  );

  useEffect(() => {
    const fetchWaybillRules = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${API_BASE_URL}/api/channels/waybill-rules`);
        const result = await response.json();
        if (result.success) {
          setWaybillRules(result.data);
        } else {
          setError('读取运单规则失败');
        }
      } catch (error) {
        setError('读取运单规则失败');
      }
    };
    fetchWaybillRules();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!formData.name || !formData.code || !formData.type || !formData.currency) {
        setError('请填写必填字段：渠道名称、代码、类型、币种');
        return;
      }

      const cleanedData = {
        ...formData,
        ...Object.fromEntries(
          Object.entries(formData).map(([key, value]) => [
            key,
            typeof value === 'string' && value === '' ? undefined : value,
          ]),
        ),
      };

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const isEdit = !!initialData?.id;
      const channelUrl = isEdit
        ? `${API_BASE_URL}/api/channels/${initialData.id}`
        : `${API_BASE_URL}/api/channels`;
      const channelMethod = isEdit ? 'PUT' : 'POST';

      const channelResponse = await fetch(channelUrl, {
        method: channelMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      const channelResult = await channelResponse.json();
      if (!channelResult.success) {
        setError('提交渠道失败：' + channelResult.error);
        return;
      }

      alert(isEdit ? '渠道更新成功！' : '渠道创建成功！');
      onSubmitSuccess?.();
      onClose();
    } catch (error) {
      setError('提交失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed top-0 right-0 h-full w-[70vw] bg-white shadow-2xl z-[1000] overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {initialData?.id ? '编辑渠道' : '创建渠道'}
        </h2>
        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
        <div className="space-y-8">
          <div>
            <SectionTitle title="基础信息" />
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="渠道名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextInput
                label="渠道代码"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
              <SelectInput
                label="渠道类型"
                value={formData.type}
                options={['快递', '海运', '空运']}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <TextInput
                label="国家"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
              <TextInput
                label="仓库"
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
              />
              <TextInput
                label="起始地"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
              <SelectInput
                label="币种"
                value={formData.currency}
                options={['CNY', 'USD', 'EUR']}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
              <SelectInput
                label="计费重小数位"
                value={formData.decimal}
                options={['0', '1', '2', '3']}
                onChange={(e) => setFormData({ ...formData, decimal: e.target.value })}
              />
              <SelectInput
                label="计费方式"
                value={formData.method}
                options={['按票', '按箱']}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              />
              <SelectInput
                label="进位方式"
                value={formData.rounding}
                options={['四舍五入', '向上取整', '向下取整']}
                onChange={(e) => setFormData({ ...formData, rounding: e.target.value })}
              />
              <SelectInput
                label="收费重计算方式"
                value={formData.compareMode}
                options={[
                  { label: '先进位再对比', value: 'round_then_compare' },
                  { label: '先对比再进位', value: 'compare_then_round' },
                ]}
                onChange={(e) => setFormData({ ...formData, compareMode: e.target.value })}
              />
              <NumberInput
                label="计泡系数"
                value={formData.volRatio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    volRatio: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="计方系数"
                value={formData.cubeRatio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cubeRatio: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="分泡比例"
                value={formData.splitRatio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    splitRatio: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <SelectInput
                label="收费重方式"
                value={formData.chargeMethod}
                options={['实重', '泡重', '综合']}
                onChange={(e) => setFormData({ ...formData, chargeMethod: e.target.value })}
              />
              <NumberInput
                label="收费价格"
                value={formData.chargePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chargePrice: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <SelectInput
                label="计费单位"
                value={formData.unitType}
                options={['KG', 'CBM']}
                onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
              />
            </div>
          </div>

          <div>
            <SectionTitle title="阶梯运费配置" />
            {formData.rates.map((rate, idx) => (
              <div key={rate.id || idx} className="grid grid-cols-5 gap-4 items-end mb-2">
                <NumberInput
                  label="最小重量"
                  value={rate.minWeight}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    const newRates = [...formData.rates];
                    newRates[idx].minWeight = v;
                    setFormData({ ...formData, rates: newRates });
                  }}
                />
                <NumberInput
                  label="最大重量"
                  value={rate.maxWeight}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    const newRates = [...formData.rates];
                    newRates[idx].maxWeight = v;
                    setFormData({ ...formData, rates: newRates });
                  }}
                />
                <NumberInput
                  label="基础费率"
                  value={rate.baseRate}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    const newRates = [...formData.rates];
                    newRates[idx].baseRate = v;
                    setFormData({ ...formData, rates: newRates });
                  }}
                />
                <SelectInput
                  label="计费单位"
                  value={rate.weightType}
                  options={['KG', 'CBM']}
                  onChange={(e) => {
                    const newRates = [...formData.rates];
                    newRates[idx].weightType = e.target.value;
                    setFormData({ ...formData, rates: newRates });
                  }}
                />
                <div className="flex flex-col">
                  <NumberInput
                    label="优先级"
                    value={rate.priority}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 1;
                      const newRates = [...formData.rates];
                      newRates[idx].priority = v;
                      setFormData({ ...formData, rates: newRates });
                    }}
                  />
                  <button
                    className="mt-1 text-red-500 text-sm"
                    onClick={() => {
                      const newRates = formData.rates.filter((_, i) => i !== idx);
                      setFormData({ ...formData, rates: newRates });
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="bg-green-500 text-white px-4 py-1 rounded"
              onClick={() => {
                const newRate = {
                  id: uuid(),
                  minWeight: 0,
                  maxWeight: 0,
                  baseRate: 0,
                  weightType: 'KG',
                  divisor: formData.volRatio || 0,
                  taxRate: 0,
                  extraFee: 0,
                  otherFee: 0,
                  priority: formData.rates.length + 1,
                  sideRule: '',
                };
                setFormData({ ...formData, rates: [...formData.rates, newRate] });
              }}
            >
              添加阶梯
            </button>
          </div>

          <div>
            <SectionTitle title="限制与计费设置" />
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="最低应收运费"
                value={formData.minCharge}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minCharge: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="票计重精度"
                value={formData.ticketPrecision}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ticketPrecision: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="箱计重精度"
                value={formData.boxPrecision}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    boxPrecision: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="尺寸精度"
                value={formData.sizePrecision}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sizePrecision: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最小件数"
                value={formData.minPieces}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minPieces: parseInt(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最大件数"
                value={formData.maxPieces}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxPieces: parseInt(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最低箱实重"
                value={formData.minBoxRealWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minBoxRealWeight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最低箱材重"
                value={formData.minBoxMaterialWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minBoxMaterialWeight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最低箱收费重"
                value={formData.minBoxChargeWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minBoxChargeWeight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最低箱均重"
                value={formData.minBoxAvgWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minBoxAvgWeight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最低票收费重量"
                value={formData.minTicketChargeWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minTicketChargeWeight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最大票收费重量"
                value={formData.maxTicketChargeWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxTicketChargeWeight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最小票实重"
                value={formData.minTicketRealWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minTicketRealWeight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最大票实重"
                value={formData.maxTicketRealWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxTicketRealWeight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最小箱实重限制"
                value={formData.minBoxRealWeightLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minBoxRealWeightLimit: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最大箱实重"
                value={formData.maxBoxRealWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxBoxRealWeight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最小箱收费重限制"
                value={formData.minBoxChargeWeightLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minBoxChargeWeightLimit: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="最大箱收费重"
                value={formData.maxBoxChargeWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxBoxChargeWeight: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="产品最小申报价值"
                value={formData.minDeclareValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minDeclareValue: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <NumberInput
                label="产品最大申报价值"
                value={formData.maxDeclareValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDeclareValue: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <TextInput
                label="时效"
                value={formData.aging}
                onChange={(e) => setFormData({ ...formData, aging: e.target.value })}
              />
              <SelectInput
                label="运单号规则"
                value={formData.waybillRule}
                options={waybillRules}
                onChange={(e) => setFormData({ ...formData, waybillRule: e.target.value })}
              />
              <TextInput
                label="标签代码"
                value={formData.labelCode}
                onChange={(e) => setFormData({ ...formData, labelCode: e.target.value })}
              />
            </div>
          </div>

          <div>
            <SectionTitle title="关联设置" />
            <div className="grid grid-cols-2 gap-4">
              <SelectInput
                label="指定用户"
                value={formData.assignedUser}
                options={['用户A', '用户B', '用户C']}
                onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value })}
              />
              <SelectInput
                label="用户等级"
                value={formData.userLevel}
                options={['普通', '高级', 'VIP']}
                onChange={(e) => setFormData({ ...formData, userLevel: e.target.value })}
              />
              <SelectInput
                label="申报币种"
                value={formData.declareCurrency}
                options={['CNY', 'USD', 'EUR']}
                onChange={(e) => setFormData({ ...formData, declareCurrency: e.target.value })}
              />
              <SelectInput
                label="默认申报币种"
                value={formData.defaultDeclareCurrency}
                options={['CNY', 'USD', 'EUR']}
                onChange={(e) =>
                  setFormData({ ...formData, defaultDeclareCurrency: e.target.value })
                }
              />
              <SelectInput
                label="发件人"
                value={formData.sender}
                options={['发件人A', '发件人B', '发件人C']}
                onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
              />
            </div>
          </div>

          <div>
            <SectionTitle title="附加费规则" />
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mb-3"
              onClick={(e) => {
                e.stopPropagation();
                setShowFeeDialog(true);
              }}
            >
              配置附加费（已选 {formData.feeRules.length} 项）
            </button>
            <FeeRuleCardList
              rules={formData.feeRules}
              onDelete={() => {}}
              onUpdate={() => {}}
              formComponents={formComponents}
            />
          </div>

          <div>
            <SectionTitle title="高级控制" />
            {/* 已清空所有复选框内容 */}
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            className="bg-indigo-600 text-white px-6 py-3 rounded disabled:bg-indigo-300"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : initialData?.id ? '更新' : '保存'}
          </button>
          <button className="bg-gray-300 text-gray-700 px-6 py-3 rounded" onClick={onClose}>
            {initialData?.id ? '关闭' : '取消'}
          </button>
        </div>
      </div>
      <FeeRuleSelectorDialog
        isOpen={showFeeDialog}
        initialRules={formData.feeRules}
        onClose={() => setShowFeeDialog(false)}
        onConfirm={(rules) => {
          setFormData((prev) => ({
            ...prev,
            feeRules: Array.isArray(rules) ? rules : [],
          }));
          setShowFeeDialog(false);
        }}
      />
    </div>,
    document.body,
  );
}
