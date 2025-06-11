// components/channel-extra-fee/TemplateCategorySection.tsx
'use client';

import { Template } from '../smart-template/rule-templates/types';

interface TemplateCategorySectionProps {
  title: string;
  templates: Template[];
  onSelect: (template: Template) => void;
  onApply: (template: Template) => void;
}

export default function TemplateCategorySection({
  title,
  templates,
  onSelect,
  onApply,
}: TemplateCategorySectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          >
            <h4 className="text-md font-medium text-gray-700">{template.name}</h4>
            <p className="text-sm text-gray-500">{template.description}</p>
            <div className="mt-2 flex justify-between">
              <button
                className="text-sm text-indigo-600 hover:underline"
                onClick={() => onSelect(template)}
              >
                编辑
              </button>
              <button
                className="text-sm text-green-600 hover:underline"
                onClick={() => onApply(template)}
              >
                应用
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
