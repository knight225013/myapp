import { useState } from 'react';
import { templates } from '@/components/smart-template/rule-templates/index';
import { Rule, Template } from '@/components/smart-template/rule-templates/types';
import { useRuleReducer } from '@/components/smart-template/rule-templates/hooks/useRuleReducer';
import { TemplateRuleCard } from '@/components/smart-template/rule-templates/TemplateRuleCard';

export default function TemplateEditorPanel({ onSubmit }: { onSubmit: (rules: Rule[]) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { rules, updateRule, addRules, removeRule } = useRuleReducer([]);

  const categories = Array.from(new Set(templates.map((t) => t.category)));
  const filteredTemplates = templates.filter((t) => t.category === selectedCategory);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    addRules(template.rules);
  };

  return (
    <div className="flex h-[80vh] overflow-hidden">
      {/* 左侧分类与模板列表 */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto border-r">
        <h2 className="text-lg font-semibold mb-2">模板分类</h2>
        <ul className="space-y-2 mb-4">
          {categories.map((category) => (
            <li
              key={category}
              className={`cursor-pointer px-3 py-1 rounded ${selectedCategory === category ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-semibold mb-2">模板列表</h2>
        <ul className="space-y-2">
          {filteredTemplates.map((template) => (
            <li
              key={template.id}
              className={`cursor-pointer px-3 py-2 border rounded ${selectedTemplate?.id === template.id ? 'bg-indigo-100 border-indigo-400' : 'hover:bg-white'}`}
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="font-semibold">{template.name}</div>
              <div className="text-sm text-gray-500">{template.description}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* 右侧模板编辑区 */}
      <div className="w-2/3 p-6 overflow-y-auto">
        {selectedTemplate ? (
          <>
            <h2 className="text-xl font-semibold mb-4">{selectedTemplate.name} 设置</h2>
            <div className="space-y-4">
              {rules.map((rule) => (
                <TemplateRuleCard
                  key={rule.id}
                  rule={rule}
                  onUpdate={updateRule}
                  onRemove={removeRule}
                />
              ))}
            </div>
            <button
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() => onSubmit(rules)}
            >
              保存并继续选择
            </button>
          </>
        ) : (
          <p className="text-gray-500">请先在左侧选择模板</p>
        )}
      </div>
    </div>
  );
}
