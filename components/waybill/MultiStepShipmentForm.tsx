// components/MultiStepShipmentForm.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Checkbox from '@/components/ui/Checkbox';
import { applyChannelRules } from '@/utils/channelCalc';
import { useSearchParams } from 'next/navigation';
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
  currency: string;
  country?: string;
  type: string;
}

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
  senderName: string;
  senderAddress: string;
  type: string;
};

interface MultiStepShipmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (formData: FormData) => void;
  initialData?: Partial<FormData>;
}

export default function MultiStepShipmentForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
}: MultiStepShipmentFormProps) {
  const defaultData: FormData = {
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
    senderName: '',
    senderAddress: '',
    type: 'FBA',
  };

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({ ...defaultData, ...initialData });
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:4000/api/channels');
        if (!response.ok) throw new Error(`HTTP 错误: ${response.status}`);
        const result = await response.json();
        console.log('Channels API response:', result);
        if (result.success) {
          setChannels(result.data);
          if (result.data.length === 0) {
            setError('无可用渠道，请在渠道管理中添加');
          } else {
            const defaultChannel =
              result.data.find((c: Channel) => c.id === initialData.channel) || result.data[0];
            setFormData((prev) => ({
              ...prev,
              channel: defaultChannel?.id || '',
              country: defaultChannel?.country || prev.country,
            }));
            setSelectedChannel(defaultChannel);
          }
        } else {
          setError('获取渠道失败: ' + result.error);
        }
      } catch (error) {
        setError('获取渠道失败: ' + (error instanceof Error ? error.message : '未知错误'));
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, [initialData.channel]);

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

  useEffect(() => {
    // 初始化时应用 initialData
    setFormData((prev) => ({
      ...prev,
      ...initialData,
      boxes: initialData.boxCount
        ? Array.from({ length: initialData.boxCount || 1 }, (_, i) => ({
            code: `${i + 1}`,
            fullCode: `BX${String(i + 1).padStart(6, '0')}`,
            weight: '',
            length: '',
            width: '',
            height: '',
            hasBattery: false,
            declaredValue: '',
          }))
        : prev.boxes,
    }));
  }, [initialData]);

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
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get('initialData');
    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        setFormData(parsed);
      } catch (e) {
        console.error('初始化数据解析失败', e);
      }
    }
  }, []);
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

  const clearField = (field: 'channel' | 'country') => {
    setFormData((prev) => ({
      ...prev,
      [field]: '',
    }));
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
    senderName: '发件人姓名',
    senderAddress: '发件人地址',
  };

  const handleSubmit = async () => {
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
      const payload = {
        waybillNumber: `WB${Date.now()}`,
        channelId: formData.channel,
        country: formData.country,
        warehouse: formData.warehouse,
        boxCount: formData.boxCount.toString(),
        boxes: formData.boxes.map((box) => ({
          code: box.code,
          fullCode: box.fullCode,
          weight: parseFloat(box.weight) || 0,
          length: parseFloat(box.length) || null,
          width: parseFloat(box.width) || null,
          height: parseFloat(box.height) || null,
          hasBattery: box.hasBattery,
          declaredValue: parseFloat(box.declaredValue || '0') || null,
        })),
        weight: parseFloat(formData.weight) || 0,
        volume: parseFloat(formData.volume) || 0,
        volumetricWeight: parseFloat(formData.volumetricWeight) || 0,
        chargeWeight: parseFloat(formData.chargeWeight) || 0,
        length: parseFloat(formData.length) || 0,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
        hasBattery: formData.hasBattery,
        hasMagnetic: false,
        hasDangerous: false,
        clientCode: formData.clientCode,
        company: formData.company,
        recipient: formData.recipient,
        address1: formData.address1,
        address2: formData.address2,
        address3: formData.address3,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        phone: formData.phone,
        email: formData.email,
        store: formData.store,
        ref1: formData.ref1,
        vat: formData.vat,
        ioss: formData.ioss,
        eori: formData.eori,
        senderName: formData.senderName,
        currency: formData.currency,
        productName: formData.productName,
        attrs: formData.attrs,
        notes: formData.notes,
        insurance: formData.insurance,
        type: formData.type,
        declaredValue: formData.boxes.reduce(
          (sum, box) => sum + (parseFloat(box.declaredValue || '0') || 0),
          0,
        ),
      };

      const response = await fetch('http://localhost:4000/api/waybills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'MultiStepShipmentForm',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Waybill creation response:', result);
      if (!response.ok) throw new Error(result.error || `HTTP 错误: ${response.status}`);

      if (result.success) {
        setSubmitStatus('✅ 运单创建成功！');
        if (onSubmit) onSubmit(formData);
        setTimeout(() => {
          setFormData(defaultData);
          onClose();
        }, 1000);
      } else {
        throw new Error(result.error || '创建运单失败');
      }
    } catch (error) {
      setSubmitStatus(`❌ 创建失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(s - 1, 0));

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed right-0 top-0 h-full w-[70vw] bg-white z-50 shadow-lg p-6">
        <h2 className="text-lg font-bold">创建运单</h2>
        <p className="text-gray-500 mt-4">加载渠道中...</p>
        <button className="btn mt-4" onClick={onClose}>
          关闭
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed right-0 top-0 h-full w-[70vw] bg-white z-50 shadow-lg p-6">
        <h2 className="text-lg font-bold">创建运单</h2>
        <p className="text-red-500 mt-4">{error}</p>
        {error.includes('无可用渠道') && (
          <a href="/channel-management" className="text-blue-500 underline ml-2">
            前往渠道管理
          </a>
        )}
        <button className="btn mt-4" onClick={onClose}>
          关闭
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[70vw] bg-white z-50 shadow-lg overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">创建 FBA 运单</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {submitStatus && (
          <div
            className={`mb-4 p-2 rounded ${
              submitStatus.includes('成功')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {submitStatus}
          </div>
        )}

        {step === 0 && (
          <div>
            <label className="font-medium">请选择运单类型：</label>
            <div className="mt-2 flex gap-4">
              <button
                className={`btn ${formData.type === 'FBA' ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, type: 'FBA' }))}
              >
                FBA
              </button>
              <button
                className={`btn ${formData.type === '传统大货' ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, type: '传统大货' }))}
              >
                传统大货
              </button>
            </div>
            <div className="mt-6 text-right">
              <button className="btn-primary" onClick={next} disabled={formData.type !== 'FBA'}>
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <SearchableSelect
              label="渠道"
              name="channel"
              value={formData.channel}
              onChange={(e) => {
                const selected = channels.find((c) => c.id === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  channel: e.target.value,
                  country: selected?.country || prev.country,
                }));
              }}
              options={channels.map((channel) => ({
                value: channel.id,
                label: `${channel.name}（${channel.type}）`,
              }))}
              required
              disabled={loading || channels.length === 0}
            />
            <button className="text-sm text-red-500 mb-4" onClick={() => clearField('channel')}>
              ❌ 清除渠道
            </button>

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
              disabled={!!formData.channel}
            />
            <button
              className="text-sm text-red-500 mb-4"
              onClick={() => clearField('country')}
              disabled={!!formData.channel}
            >
              ❌ 清除国家
            </button>

            <div className="mt-6 flex justify-between">
              <button className="btn" onClick={back}>
                上一步
              </button>
              <button
                className="btn-primary"
                onClick={next}
                disabled={!formData.channel || !formData.country}
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <Input
              label="发件人姓名"
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
            />
            <Input
              label="发件人地址"
              name="senderAddress"
              value={formData.senderAddress}
              onChange={handleChange}
            />
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
            <div className="mt-6 flex justify-between">
              <button className="btn" onClick={back}>
                上一步
              </button>
              <button className="btn-primary" onClick={next}>
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
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
            <SearchableSelect
              label="仓库地址"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleChange}
              options={[
                { value: 'Amazon JFK1', label: 'Amazon JFK1' },
                { value: 'Amazon LAX3', label: 'Amazon LAX3' },
                { value: 'Amazon NRT5', label: 'Amazon NRT5' },
              ]}
              required
            />
            <div className="mt-6 flex justify-between">
              <button className="btn" onClick={back}>
                上一步
              </button>
              <button
                className="btn-primary"
                onClick={next}
                disabled={!formData.recipient || !formData.warehouse}
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
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
            <div className="col-span-2 border border-gray-300 rounded p-3 mt-4">
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
            <div className="mt-6 flex justify-between">
              <button className="btn" onClick={back}>
                上一步
              </button>
              <button
                className={`btn-primary ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSubmit}
                disabled={submitting || !formData.boxCount}
              >
                {submitting ? '提交中...' : '提交'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
