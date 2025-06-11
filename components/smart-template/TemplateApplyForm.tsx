'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { templates, TemplateRuleCard, useRuleReducer } from './rule-templates/index';
import { Rule } from './rule-templates/types';

export function TemplateApplyForm({
  templateId,
  onSubmit,
}: {
  templateId: string;
  onSubmit: (updatedRules: Rule[]) => void;
}) {
  const router = useRouter();
  const template = templates.find((t) => t.id === templateId);
  const { rules, updateRule, addRules } = useRuleReducer([]);

  // 加载模板规则
  React.useEffect(() => {
    if (template?.rules) {
      addRules([]); // 清空旧规则
      addRules(template.rules); // 直接添加，不再去重
    }
  }, [template, addRules]);

  const handleSubmit = () => {
    try {
      onSubmit(rules);
    } catch (error: any) {
      alert(`提交失败：${error.message}`);
    }
  };

  const handleBack = () => {
    router.back(); // 或 router.push('/smart-template') 跳指定路径
  };

  return (
    <div className="space-y-6">
      {/* 标题 + 返回按钮 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{template?.name || '套用模板'}</h2>
        <button
          onClick={handleBack}
          className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-700"
        >
          ← 返回
        </button>
      </div>

      {/* 模板规则展示区域 */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <TemplateRuleCard
            key={rule.id}
            rule={rule}
            onUpdate={updateRule}
            onRemove={(id) => {
              console.log(`Remove rule ${id}`);
            }}
          />
        ))}
      </div>

      {/* 保存按钮 */}
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        保存
      </button>
    </div>
  );
}
