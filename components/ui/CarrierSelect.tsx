import { useEffect, useState } from 'react';

interface Carrier {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
}

interface CarrierSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CarrierSelect({ value, onChange }: CarrierSelectProps) {
  const [carriers, setCarriers] = useState<Carrier[]>([]);

  useEffect(() => {
    fetch('/api/carriers')
      .then(res => res.json())
      .then(({ success, data, error }) => {
        if (success) {
          setCarriers(data);
        } else {
          console.error('获取物流商失败:', error);
        }
      })
      .catch(error => console.error('获取物流商失败:', error));
  }, []);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none"
      >
        <option value="">请选择物流商</option>
        {carriers.map((carrier) => (
          <option key={carrier.id} value={carrier.code}>
            {carrier.name}
          </option>
        ))}
      </select>
      {value && carriers.find((c) => c.code === value)?.logoUrl && (
        <img
          src={carriers.find((c) => c.code === value)?.logoUrl}
          alt="Carrier Logo"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6"
        />
      )}
    </div>
  );
}
