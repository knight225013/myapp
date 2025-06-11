'use client';
import { useTemplateDraftStore } from '../smart-template/rule-templates/hooks/useTemplateDraftStore';

export default function ExtraFeeBadgeList() {
  const { rules, removeRule } = useTemplateDraftStore(); // 获取规则和删除方法

  if (!rules.length) return <p className="text-gray-500">未选择附加费模板</p>;

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-700 mb-2">已选附加费模板 ({rules.length})</p>
      <div className="flex flex-wrap gap-2">
        {rules.map((rule) => (
          <span
            key={rule.id}
            className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
          >
            {rule.label}
            <button
              className="ml-2 text-red-500 hover:text-red-700"
              onClick={() => removeRule(rule.id)} // 删除指定规则
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
