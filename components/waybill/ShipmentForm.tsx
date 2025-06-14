'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Checkbox from '@/components/ui/Checkbox';
import MultiCheckbox from '@/components/ui/MultiCheckbox';
import Textarea from '@/components/ui/Textarea';
import Radio from '@/components/ui/Radio';
import { applyChannelRules } from '@/utils/channelCalc';

// 表单数据类型
type FormData = {
  channel: string;
  country: string;
  warehouse: string;
  boxCount: number;
  boxes: {
    code: string;
    fullCode: string;
    weight: string;
    length: string;
    width: string;
    height: string;
    hasBattery: boolean;
    declaredValue?: string;
  }[];
  weight: string;
  length: string;
  width: string;
  height: string;
  hasBattery: boolean;
  clientCode: string;
  company: string;
  phone: string;
  email: string;
  store: string;
  ref1: string;
  vat: string;
  ioss: string;
  eori: string;
  currency: string;
  category: string;
  productName: string;
  attrs: string[];
  notes: string;
  insurance: boolean;
  recipient: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  state: string;
  postalCode: string;
  volume: string;
  volumetricWeight: string;
  chargeWeight: string;
};

// 渠道类型
interface Channel {
  id: string;
  name: string;
  volRatio?: number;
  decimal?: string;
  rounding?: string;
  minCharge?: number;
  requirePhone?: boolean;
  requireEmail?: boolean;
  requireWeight?: boolean;
  requireSize?: boolean;
  minPieces?: number;
  maxPieces?: number;
  minBoxRealWeight?: number;
  maxBoxRealWeight?: number;
  minBoxChargeWeight?: number;
  maxBoxChargeWeight?: number;
  minDeclareValue?: number;
  maxDeclareValue?: number;
}

type FbaShipmentFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (formData: FormData) => void;
};

export default function FbaShipmentForm({ isOpen, onClose, onSubmit }: FbaShipmentFormProps) {
  const [showMore, setShowMore] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    channel: '',
    country: '',
    warehouse: '',
    boxCount: 1,
    boxes: [
      {
        code: '1',
        fullCode: 'BX000001',
        weight: '',
        length: '',
        width: '',
        height: '',
        hasBattery: false,
        declaredValue: '',
      },
    ],
    weight: '',
    length: '',
    width: '',
    height: '',
    hasBattery: false,
    clientCode: '',
    company: '',
    phone: '',
    email: '',
    store: '',
    ref1: '',
    vat: '',
    ioss: '',
    eori: '',
    currency: '',
    category: '',
    productName: '',
    attrs: [],
    notes: '',
    insurance: false,
    recipient: '',
    address1: '',
    address2: '',
    address3: '',
    city: '',
    state: '',
    postalCode: '',
    volume: '',
    volumetricWeight: '',
    chargeWeight: '',
  });
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('/api/channels');
        const { success, data, error } = await response.json();
        if (!success) throw new Error(error);
        setChannels(data);
        if (data.length === 0) {
          setError('无可用渠道，请在渠道管理中添加');
        } else {
          const defaultChannel = data[0];
          setFormData((prev) => ({ ...prev, channel: defaultChannel?.id || '' }));
          setSelectedChannel(defaultChannel);
        }
      } catch (error) {
        console.error('获取渠道失败:', error);
        setError('获取渠道失败: ' + (error instanceof Error ? error.message : '未知错误'));
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  useEffect(() => {
    const channel = channels.find((c) => c.id === formData.channel);
    setSelectedChannel(channel || null);
    recalculateSummary();
  }, [formData.channel, channels]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      boxes: Array.from({ length: prev.boxCount }, (_, i) => {
        const existing = prev.boxes[i];
        return (
          existing ?? {
            code: `${i + 1}`,
            fullCode: `BX${String(i + 1).padStart(6, '0')}`,
            weight: '',
            length: '',
            width: '',
            height: '',
            hasBattery: false,
            declaredValue: '',
          }
        );
      }),
    }));
  }, [formData.boxCount]);

  const recalculateSummary = () => {
    const volRatio = selectedChannel?.volRatio || 6000;
    const boxes = formData.boxes;

    const totalWeight = boxes.reduce((sum, box) => sum + (parseFloat(box.weight) || 0), 0);
    const totalVolume = boxes.reduce((sum, box) => {
      const l = parseFloat(box.length) || 0;
      const w = parseFloat(box.width) || 0;
      const h = parseFloat(box.height) || 0;
      return sum + (l * w * h) / 1000000;
    }, 0);
    const volumetricWeight = boxes.reduce((sum, box) => {
      const l = parseFloat(box.length) || 0;
      const w = parseFloat(box.width) || 0;
      const h = parseFloat(box.height) || 0;
      return sum + (l * w * h) / volRatio;
    }, 0);
    const rawChargeWeight = Math.max(totalWeight, volumetricWeight);
    const chargeWeight = applyChannelRules(rawChargeWeight, selectedChannel);

    setFormData((prev) => ({
      ...prev,
      weight: totalWeight.toFixed(2),
      volume: totalVolume.toFixed(4),
      volumetricWeight: volumetricWeight.toFixed(2),
      chargeWeight: chargeWeight.toFixed(2),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleBoxFieldChange = (index: number, field: keyof FormData['boxes'][0], value: any) => {
    setFormData((prev) => {
      const newBoxes = [...prev.boxes];
      newBoxes[index] = { ...newBoxes[index], [field]: value };
      return { ...prev, boxes: newBoxes };
    });
    recalculateSummary();
  };

  const handleMultiCheckboxChange = (attrs: string[]) => {
    setFormData((prev) => ({ ...prev, attrs }));
  };

  const isEmpty = (value: any): boolean => {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'number' && isNaN(value))
    );
  };

  const fieldNameMap: Partial<Record<keyof FormData, string>> = {
    channel: '渠道',
    country: '国家',
    warehouse: '仓库地址',
    boxCount: '件数',
    recipient: '收件人',
    phone: '电话',
    email: '邮箱',
    weight: '总重量',
    length: '长',
    width: '宽',
    height: '高',
    productName: '主品名',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || submitting) return;

    isSubmittingRef.current = true;
    setSubmitting(true);
    setSubmitStatus(null);

    // 基本必填字段校验
    const requiredFields: (keyof FormData)[] = [
      'channel',
      'country',
      'warehouse',
      'boxCount',
      'recipient',
    ];

    const missingFields = requiredFields.filter((field) => isEmpty(formData[field]));
    if (missingFields.length > 0) {
      const missingLabels = missingFields.map((field) => fieldNameMap[field] || field).join('、');
      setSubmitStatus(`❌ 错误：以下必填字段缺失：${missingLabels}`);
      setSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    // 渠道规则校验
    if (selectedChannel) {
      const validationErrors: string[] = [];

      // 件数限制
      if (selectedChannel.minPieces && formData.boxCount < selectedChannel.minPieces) {
        validationErrors.push(`件数不能少于最小限制：${selectedChannel.minPieces}`);
      }
      if (selectedChannel.maxPieces && formData.boxCount > selectedChannel.maxPieces) {
        validationErrors.push(`件数不能大于最大限制：${selectedChannel.maxPieces}`);
      }

      // 实重限制
      const totalWeight = parseFloat(formData.weight) || 0;
      if (selectedChannel.minBoxRealWeight && totalWeight < selectedChannel.minBoxRealWeight) {
        validationErrors.push(`总重量低于最小限制：${selectedChannel.minBoxRealWeight}kg`);
      }
      if (selectedChannel.maxBoxRealWeight && totalWeight > selectedChannel.maxBoxRealWeight) {
        validationErrors.push(`总重量大于最大限制：${selectedChannel.maxBoxRealWeight}kg`);
      }

      // 收费重限制
      const chargeWeight = parseFloat(formData.chargeWeight) || 0;
      if (selectedChannel.minBoxChargeWeight && chargeWeight < selectedChannel.minBoxChargeWeight) {
        validationErrors.push(`计费重低于最小限制：${selectedChannel.minBoxChargeWeight}kg`);
      }
      if (selectedChannel.maxBoxChargeWeight && chargeWeight > selectedChannel.maxBoxChargeWeight) {
        validationErrors.push(`计费重超过最大限制：${selectedChannel.maxBoxChargeWeight}kg`);
      }

      // 必填字段
      if (selectedChannel.requirePhone && !formData.phone) {
        validationErrors.push('电话为必填');
      }
      if (selectedChannel.requireEmail && !formData.email) {
        validationErrors.push('邮箱为必填');
      }
      if (selectedChannel.requireWeight && !formData.weight) {
        validationErrors.push('总重量为必填');
      }
      if (
        selectedChannel.requireSize &&
        formData.boxes.some((box) => !box.length || !box.width || !box.height)
      ) {
        validationErrors.push('每箱的长宽高必须填写');
      }

      // 申报价值限制
      const totalDeclaredValue = formData.boxes.reduce(
        (sum, box) => sum + (parseFloat(box.declaredValue || '0') || 0),
        0,
      );
      if (selectedChannel.minDeclareValue && totalDeclaredValue < selectedChannel.minDeclareValue) {
        validationErrors.push(`申报价值低于最小限制：${selectedChannel.minDeclareValue}`);
      }
      if (selectedChannel.maxDeclareValue && totalDeclaredValue > selectedChannel.maxDeclareValue) {
        validationErrors.push(`申报价值高于最大限制：${selectedChannel.maxDeclareValue}`);
      }

      if (validationErrors.length > 0) {
        setSubmitStatus(`❌ 错误：${validationErrors.join('；')}`);
        setSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }
    }

    try {
      // 准备发送的数据，将 channel 重命名为 channelId
      const { channel, ...restFormData } = formData;
      const submitData = {
        ...restFormData,
        channelId: channel, // 后端期望 channelId
        type: 'FBA', // 明确指定类型为 FBA
      };

      const response = await fetch('/api/waybills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const { success, data, error } = await response.json();
      
      if (!success) {
        throw new Error(error || '创建运单失败');
      }

      setSubmitStatus('✅ 运单创建成功！');
      if (onSubmit) onSubmit(formData);
      setTimeout(() => {
        setFormData({
          channel: channels[0]?.id || '',
          country: '',
          warehouse: '',
          boxCount: 1,
          boxes: [
            {
              code: '1',
              fullCode: 'BX000001',
              weight: '',
              length: '',
              width: '',
              height: '',
              hasBattery: false,
              declaredValue: '',
            },
          ],
          weight: '',
          length: '',
          width: '',
          height: '',
          hasBattery: false,
          clientCode: '',
          company: '',
          phone: '',
          email: '',
          store: '',
          ref1: '',
          vat: '',
          ioss: '',
          eori: '',
          currency: '',
          category: '',
          productName: '',
          attrs: [],
          notes: '',
          insurance: false,
          recipient: '',
          address1: '',
          address2: '',
          address3: '',
          city: '',
          state: '',
          postalCode: '',
          volume: '',
          volumetricWeight: '',
          chargeWeight: '',
        });
        onClose();
      }, 1000);
    } catch (error) {
      console.error('创建运单失败:', error);
      setSubmitStatus(`❌ 创建失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[70vw] max-w-[100vw] bg-white shadow-xl z-50">
      <div className="p-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">创建 FBA 运单</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {error && (
              <div className="col-span-2 bg-red-100 text-red-700 p-2 rounded">
                {error}
                {error.includes('无可用渠道') && (
                  <a href="/channel-management" className="text-blue-500 underline ml-2">
                    前往渠道管理
                  </a>
                )}
              </div>
            )}
            {loading && <div className="col-span-2 text-gray-500">加载渠道中...</div>}
            {submitStatus && (
              <div
                className={`col-span-2 p-2 rounded ${
                  submitStatus.includes('成功')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {submitStatus}
              </div>
            )}
            <SearchableSelect
              label="渠道"
              name="channel"
              value={formData.channel}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  channel: e.target.value,
                }))
              }
              options={channels.map((channel) => ({
                value: channel.id,
                label: channel.name,
              }))}
              required
              disabled={loading || channels.length === 0}
            />
            <SearchableSelect
              label="国家"
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={[
                { value: '中国', label: '中国' },
                { value: '日本', label: '日本' },
                { value: '韩国', label: '韩国' },
                { value: '美国', label: '美国' },
                { value: '德国', label: '德国' },
                { value: '越南', label: '越南' },
                { value: '马来西亚', label: '马来西亚' },
              ]}
              required
            />
            <SearchableSelect
              label="仓库地址"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleChange}
              options={[
                { value: '仓库A', label: '仓库A' },
                { value: '仓库B', label: '仓库B' },
                { value: '仓库C', label: '仓库C' },
              ]}
              required
            />
            <Input
              label="件数"
              name="boxCount"
              type="number"
              value={formData.boxCount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  boxCount: parseInt(e.target.value) || 1,
                }))
              }
              min={selectedChannel?.minPieces || 1}
              required
            />
            <div className="col-span-2 border border-gray-300 rounded p-3">
              <h3 className="font-semibold mb-2">箱子明细</h3>
              {formData.boxes.map((box, i) => (
                <div key={i} className="grid grid-cols-7 gap-2 mb-2 items-end border-b pb-2">
                  <div className="text-gray-700 text-sm font-medium col-span-1">
                    箱号 {box.code}
                    <br />
                    <span className="text-gray-500 text-xs">{box.fullCode}</span>
                  </div>
                  <Input
                    label="重量(kg)"
                    name={`weight-${i}`}
                    type="number"
                    value={box.weight}
                    onChange={(e) => handleBoxFieldChange(i, 'weight', e.target.value)}
                    step="0.01"
                    min={selectedChannel?.minBoxRealWeight}
                    required={selectedChannel?.requireWeight}
                  />
                  <Input
                    label="长(cm)"
                    name={`length-${i}`}
                    type="number"
                    value={box.length}
                    onChange={(e) => handleBoxFieldChange(i, 'length', e.target.value)}
                    step="0.01"
                    required={selectedChannel?.requireSize}
                  />
                  <Input
                    label="宽(cm)"
                    name={`width-${i}`}
                    type="number"
                    value={box.width}
                    onChange={(e) => handleBoxFieldChange(i, 'width', e.target.value)}
                    step="0.01"
                    required={selectedChannel?.requireSize}
                  />
                  <Input
                    label="高(cm)"
                    name={`height-${i}`}
                    type="number"
                    value={box.height}
                    onChange={(e) => handleBoxFieldChange(i, 'height', e.target.value)}
                    step="0.01"
                    required={selectedChannel?.requireSize}
                  />
                  <Input
                    label="申报价值"
                    name={`declaredValue-${i}`}
                    type="number"
                    value={box.declaredValue || ''}
                    onChange={(e) => handleBoxFieldChange(i, 'declaredValue', e.target.value)}
                    step="0.01"
                    min={selectedChannel?.minDeclareValue}
                  />
                  <Checkbox
                    label="带电"
                    name={`hasBattery-${i}`}
                    checked={box.hasBattery}
                    onChange={(e) => handleBoxFieldChange(i, 'hasBattery', e.target.checked)}
                  />
                </div>
              ))}
            </div>
            <table className="w-full border mt-4 text-sm text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th>箱号</th>
                  <th>编码</th>
                  <th>重量(kg)</th>
                  <th>长(cm)</th>
                  <th>宽(cm)</th>
                  <th>高(cm)</th>
                  <th>申报价值</th>
                  <th>带电</th>
                </tr>
              </thead>
              <tbody>
                {formData.boxes.map((box, i) => (
                  <tr key={i} className="border-t">
                    <td>{box.code}</td>
                    <td>{box.fullCode}</td>
                    <td>{box.weight || '-'}</td>
                    <td>{box.length || '-'}</td>
                    <td>{box.width || '-'}</td>
                    <td>{box.height || '-'}</td>
                    <td>{box.declaredValue || '-'}</td>
                    <td>{box.hasBattery ? '是' : '否'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Input
              label="总重量 (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              step="0.01"
              readOnly
              required={selectedChannel?.requireWeight}
            />
            <Input
              label="总体积 (m³)"
              name="volume"
              type="number"
              value={formData.volume}
              onChange={handleChange}
              step="0.0001"
              readOnly
            />
            <Input
              label="材积重 (kg)"
              name="volumetricWeight"
              type="number"
              value={formData.volumetricWeight}
              onChange={handleChange}
              step="0.01"
              readOnly
            />
            <Input
              label="计费重 (kg)"
              name="chargeWeight"
              type="number"
              value={formData.chargeWeight}
              onChange={handleChange}
              step="0.01"
              readOnly
            />
            <Input
              label="总长 (cm)"
              name="length"
              type="number"
              value={formData.length}
              onChange={handleChange}
              step="0.01"
              required={selectedChannel?.requireSize}
            />
            <Input
              label="总宽 (cm)"
              name="width"
              type="number"
              value={formData.width}
              onChange={handleChange}
              step="0.01"
              required={selectedChannel?.requireSize}
            />
            <Input
              label="总高 (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              step="0.01"
              required={selectedChannel?.requireSize}
            />
            <div className="col-span-2">
              <Checkbox
                label="是否带电"
                name="hasBattery"
                checked={formData.hasBattery}
                onChange={handleChange}
              />
            </div>
            <Input
              label="收件人姓名"
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
              required
            />
            <Input
              label="收件人地址一"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
            />
            <Input
              label="收件人地址二"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
            />
            <Input
              label="收件人地址三"
              name="address3"
              value={formData.address3}
              onChange={handleChange}
            />
            <Input label="收件人城市" name="city" value={formData.city} onChange={handleChange} />
            <Input
              label="收件人省份/州"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
            <Input
              label="收件人邮编"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>

          <button
            type="button"
            className="text-indigo-600 hover:underline mt-4 flex items-center"
            onClick={() => setShowMore((prev) => !prev)}
          >
            更多字段 {showMore ? '▲' : '▼'}
          </button>
          {showMore && (
            <div className="grid grid-cols-2 gap-4 mt-4 border-2 border-red-500 p-4">
              <Input
                label="客户代码"
                name="clientCode"
                value={formData.clientCode}
                onChange={handleChange}
              />
              <Input label="公司" name="company" value={formData.company} onChange={handleChange} />
              <Input
                label="电话"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required={selectedChannel?.requirePhone}
              />
              <Input
                label="邮箱"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required={selectedChannel?.requireEmail}
              />
              <Input label="店铺" name="store" value={formData.store} onChange={handleChange} />
              <Input label="参考代码" name="ref1" value={formData.ref1} onChange={handleChange} />
              <Input label="VAT号" name="vat" value={formData.vat} onChange={handleChange} />
              <Input label="IOSS号" name="ioss" value={formData.ioss} onChange={handleChange} />
              <Input label="EORI号" name="eori" value={formData.eori} onChange={handleChange} />
              <SearchableSelect
                label="申报币种"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                options={[
                  { value: 'CNY', label: 'CNY' },
                  { value: 'USD', label: 'USD' },
                ]}
              />
              <SearchableSelect
                label="品名分类"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={[
                  { value: '电子产品', label: '电子产品' },
                  { value: '服装', label: '服装' },
                  { value: '食品', label: '食品' },
                ]}
              />
              <Input
                label="主品名"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
              />
              <MultiCheckbox
                label="物品属性"
                name="attrs"
                options={[
                  '带电',
                  '带磁',
                  '危险品',
                  '液体',
                  '粉末',
                  '膏体',
                  '敏感货',
                  '木制品',
                  '纺织品',
                ]}
                value={formData.attrs}
                onChange={handleMultiCheckboxChange}
              />
              <Textarea label="备注" name="notes" value={formData.notes} onChange={handleChange} />
              <Radio
                label="是否需要保险"
                name="insurance"
                options={['是', '否']}
                value={formData.insurance ? '是' : '否'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    insurance: e.target.value === '是',
                  }))
                }
              />
            </div>
          )}

          <div className="flex justify-end mt-6 gap-4">
            <button
              type="submit"
              className={`gradient-btn px-6 py-2 rounded-xl text-white ${
                !formData.channel || !formData.recipient.trim() || submitting
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={!formData.channel || !formData.recipient.trim() || submitting}
            >
              {submitting ? '提交中...' : '提交'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 px-6 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
              disabled={submitting}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
