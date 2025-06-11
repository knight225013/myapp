import { X } from 'lucide-react';

interface Props {
  data: Record<string, any>;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ShipmentPreviewConfirm({ data, onConfirm, onCancel }: Props) {
  const displayFields = [
    { key: 'waybillNumber', label: '运单号' },
    { key: 'channel', label: '物流渠道' },
    { key: 'weight', label: '重量 (kg)' },
    { key: 'volumetricWeight', label: '材积重 (kg)' },
    { key: 'chargeWeight', label: '计费重 (kg)' },
    { key: 'recipient', label: '收件人' },
    { key: 'country', label: '国家' },
    { key: 'address1', label: '地址一' },
    { key: 'city', label: '城市' },
    { key: 'postalCode', label: '邮编' },
    { key: 'productName', label: '产品名称' },
    { key: 'boxCount', label: '件数' },
    {
      key: 'boxes',
      label: '箱子申报价值',
      transform: (boxes: any[]) =>
        boxes?.map((box: any) => box.declaredValue)?.join(', ') || '未填写',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex justify-end">
      <div className="w-[400px] h-full bg-white shadow-xl px-6 py-8 relative">
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-black"
          onClick={onCancel}
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-6">请确认导入内容</h2>
        <div className="space-y-4">
          {displayFields.map(({ key, label, transform }) => (
            <div key={key} className="flex justify-between">
              <span className="text-sm text-gray-500">{label}:</span>
              <span className="text-sm text-gray-700">
                {transform ? transform(data[key]) : (data[key] ?? '未填写')}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-4">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl" onClick={onConfirm}>
            确认提交
          </button>
          <button className="bg-gray-300 px-4 py-2 rounded-xl" onClick={onCancel}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
