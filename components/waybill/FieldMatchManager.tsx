'use client';

import { useState } from 'react';
import { X, Edit, Trash } from 'lucide-react';
import { TemplateInfo } from '@/types/template';

interface Props {
  onEdit: (template: TemplateInfo) => void;
  onClose: () => void;
}

export default function FieldMatchManager({ onEdit, onClose }: Props) {
  const [templates, setTemplates] = useState<TemplateInfo[]>(
    JSON.parse(localStorage.getItem('excelTemplates') || '[]'),
  );

  const handleDelete = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('excelTemplates', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 bg-white p-8 z-50 shadow-xl overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">模板管理</h2>
        <button className="text-gray-500 hover:text-black" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-gray-500 mb-1">已有模板</h3>
          {templates.length === 0 ? (
            <p className="text-sm text-gray-500">暂无模板</p>
          ) : (
            <div className="border p-4 rounded-xl bg-gray-50">
              {templates.map((template) => (
                <div key={template.id} className="flex justify-between items-center mb-2">
                  <span>
                    {template.name} ({template.mode}, {template.type})
                  </span>
                  <div className="flex gap-2">
                    <button className="text-indigo-600 text-sm" onClick={() => onEdit(template)}>
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-500 text-sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
            onClick={() => onEdit({} as TemplateInfo)}
          >
            新建模板
          </button>
        </div>
      </div>
    </div>
  );
}
