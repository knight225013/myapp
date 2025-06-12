'use client';
import { useState } from 'react';
import { ExtraFeeRule } from '@components/ExtraFeeRule/types';
import Dialog from '../ui/Dialog';
import { TemplatePreviewCard } from '@/components/smart-template/TemplatePreviewCard';
import { ExtraFeeRuleCard } from '@/components/smart-template/fee-rules/ExtraFeeRuleCard';
import { FeeRule } from '@/components/smart-template/fee-rules/types';
interface ExtraFeeTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (rules: ExtraFeeRule[]) => void;
  templates: ExtraFeeRule[];
  initialSelected?: ExtraFeeRule[];
}

export default function ExtraFeeTemplateModal({
  open,
  onClose,
  onConfirm,
  templates,
  initialSelected = [],
}: ExtraFeeTemplateModalProps) {
  const [selected, setSelected] = useState<ExtraFeeRule[]>(initialSelected);

  const toggleSelect = (template: ExtraFeeRule) => {
    setSelected((prev) =>
      prev.find((t) => t.id === template.id)
        ? prev.filter((t) => t.id !== template.id)
        : [...prev, template],
    );
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  return (
    <Dialog isOpen={open} onClose={onClose} title="选择附加费模板">
      <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-2">
        {templates.map((rule) => (
          <div
            key={rule.id}
            className={`
              border rounded-lg cursor-pointer p-4
              ${selected.some((t) => t.id === rule.id) ? 'ring-2 ring-indigo-500' : 'hover:shadow'}
            `}
            onClick={() => toggleSelect(rule)}
          >
            <ExtraFeeRuleCard rule={rule as unknown as FeeRule} />

          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4 gap-2">
        <button
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          onClick={onClose}
        >
          取消
        </button>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={handleConfirm}
        >
          确定添加
        </button>
      </div>
    </Dialog>
  );
}
