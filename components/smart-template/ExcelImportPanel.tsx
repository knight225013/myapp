'use client';

import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { TemplateInfo } from '@/types/template';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, templateName: string) => void;
  title: string;
}

export default function ExcelImportPanel({ isOpen, onClose, onUpload, title }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  if (!isOpen) return null;

  const templates = JSON.parse(localStorage.getItem('excelTemplates') || '[]') as TemplateInfo[];

  const handleUpload = (file: File, templateName: string) => {
    const template = templates.find((t) => t.name === templateName);
    if (template?.type !== 'FBA') {
      alert('请选择 FBA 模板');
      return;
    }
    onUpload(file, templateName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex justify-end">
      <div className="w-[400px] h-full bg-white shadow-xl px-6 py-8 relative">
        <button className="absolute right-4 top-4 text-gray-500 hover:text-black" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-6">{title}</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-gray-500 mb-1">选择模板</h3>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="border p-2 w-full rounded-xl"
            >
              <option value="">请选择模板</option>
              {templates.map((template) => (
                <option key={template.id} value={template.name}>
                  {template.name} ({template.type})
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div>
              <h3 className="text-sm text-gray-500 mb-1">模板下载</h3>
              <a
                href={templates.find((t) => t.name === selectedTemplate)?.filePath || '#'}
                download
                className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
              >
                下载 Excel 模板
              </a>
            </div>
          )}

          <div>
            <h3 className="text-sm text-gray-500 mb-1">导入文件</h3>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && selectedTemplate) {
                  handleUpload(file, selectedTemplate);
                } else {
                  alert('请先选择模板');
                }
              }}
              className="block w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-100 file:text-indigo-700
              hover:file:bg-indigo-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
