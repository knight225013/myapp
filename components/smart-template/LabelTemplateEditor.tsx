// components/LabelTemplateEditor.tsx

'use client';
import { useState, useEffect } from 'react';
import { useEditor, Editor } from '@tiptap/react'; // Correct import
import StarterKit from '@tiptap/starter-kit';
import { createPortal } from 'react-dom';

interface LabelTemplate {
  id?: string;
  name: string;
  description?: string;
  content: string;
  width: number;
  height: number;
  priority?: number;
  remark?: string;
}

interface LabelTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: LabelTemplate;
  onSubmitSuccess?: () => void;
}

const availableFields = [
  { key: 'waybillNumber', label: '运单号' },
  { key: 'recipient', label: '收件人' },
  { key: 'country', label: '国家' },
  { key: 'address1', label: '地址1' },
  { key: 'phone', label: '电话' },
  { key: 'senderName', label: '发件人' },
  { key: 'trackingNumber', label: '跟踪号' },
];

export default function LabelTemplateEditor({
  isOpen,
  onClose,
  initialData,
  onSubmitSuccess,
}: LabelTemplateEditorProps) {
  const [formData, setFormData] = useState<LabelTemplate>({
    name: '',
    description: '',
    content: '<div>{{waybillNumber}}</div>',
    width: 100,
    height: 50,
    priority: 1,
    remark: '',
    ...initialData,
  });
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content,
    onUpdate: ({ editor }: { editor: Editor }) => {
      // Explicit type
      setFormData({ ...formData, content: editor.getHTML() });
    },
  });

  const handleInsertField = (key: string) => {
    editor?.commands.insertContent(`{{${key}}}`);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.content || !formData.width || !formData.height) {
      setError('请填写必填字段：模板名称、内容、宽度、高度');
      return;
    }

    try {
      const isEdit = !!initialData?.id;
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const url = isEdit
        ? `${API_BASE}/api/templates/${initialData.id}`
        : `${API_BASE}/api/templates`;

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        alert(isEdit ? '模板更新成功！' : '模板创建成功！');
        onSubmitSuccess?.();
        onClose();
      } else {
        setError('提交失败：' + result.error);
      }
    } catch (error) {
      setError('提交失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed top-0 right-0 h-full w-[70vw] bg-white shadow-2xl z-[1000] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {initialData?.id ? '编辑标签模板' : '创建标签模板'}
        </h2>
        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">模板名称</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">宽度 (mm)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">高度 (mm)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">可用字段</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {availableFields.map((field) => (
                <button
                  key={field.key}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded"
                  onClick={() => handleInsertField(field.key)}
                >
                  {field.label}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">模板内容</label>
            <div className="border rounded p-2 min-h-[200px]">
              {editor && (
                <div>
                  <button onClick={() => editor.commands.toggleBold()}>加粗</button>
                  <button onClick={() => editor.commands.toggleItalic()}>斜体</button>
                  {/* Add more toolbar buttons as needed */}
                  <div className="prose" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded" onClick={handleSubmit}>
            {initialData?.id ? '更新' : '保存'}
          </button>
          <button className="bg-gray-300 text-gray-700 px-6 py-3 rounded" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
