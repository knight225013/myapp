// components/smart-template/fee-rules/FeeRuleCardList.tsx

'use client';

import { useState, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import { FeeRule } from './types';
import { modules } from './config';

interface Props {
  /** 要展示的规则列表 */
  rules: FeeRule[];
  /** 删除某条规则时调用 */
  onDelete: (id: string) => void;
  /** 更新某条规则时调用 */
  onUpdate: (updatedRule: FeeRule) => void;
  /** 每种规则类型对应的表单组件 */
  formComponents: Record<string, React.ComponentType<any>>;
  /** 如果为 true，点击卡片不展开编辑表单，仅作静态展示 */
  readOnly?: boolean;
}

export default function FeeRuleCardList({
  rules,
  onDelete,
  onUpdate,
  formComponents,
  readOnly = false,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unitMap: Record<string, string> = {
    box: '箱',
    ticket: '票',
    kg: '公斤',
    cbm: '立方米',
  };

  const getSummary = (rule: FeeRule) => {
    const p = rule.params;
    if (p?.field && typeof p.min === 'number' && typeof p.price === 'number') {
      const chargeUnitCn = p.chargeUnit ? (unitMap[p.chargeUnit] ?? p.chargeUnit) : '';
      const conditionUnitCn = p.conditionUnit
        ? (unitMap[p.conditionUnit] ?? p.conditionUnit)
        : '';
      const min = p.min;
      const max = p.max !== undefined ? p.max : '∞';
      return `${rule.name}：${min}~${max}${conditionUnitCn}，收取费用：${p.price}元/${chargeUnitCn}`;
    }
    return p?.label || rule.name || '未知规则';
  };

  const getFormProps = (rule: FeeRule) => {
    const module = modules.find((m) => m.id === rule.module);
    const typeInfo = module?.types.find((t) => t.id === rule.type);
    const formProps = typeInfo && 'formProps' in typeInfo ? typeInfo.formProps : {};
    return formProps;
  };

  const handleUpdate = useCallback(
    (updatedRule: FeeRule) => {
      onUpdate(updatedRule);
      setExpandedId(null);
    },
    [onUpdate]
  );

  if (!Array.isArray(rules)) {
    return <div className="text-red-600">规则数据无效</div>;
  }

  const ruleComponents = useMemo(() => {
    return rules.map((rule) => {
      const FormComponent = formComponents[rule.type];
      const formProps = getFormProps(rule);

      return (
        <div
          key={rule.id}
          className="border p-3 mb-3 rounded bg-white relative hover:shadow-md transition"
          style={{ minWidth: '300px', maxWidth: '320px', flex: '1 1 calc(33.333% - 1rem)' }}
          onClick={() => {
            if (!readOnly) {
              setExpandedId(expandedId === rule.id ? null : rule.id);
            }
          }}
        >
          {/* 删除按钮 */}
          <button
            className="absolute top-2 right-2 text-red-400 hover:text-red-600 z-10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(rule.id);
            }}
          >
            <X size={16} />
          </button>

          {/* 规则摘要 */}
          <div className="cursor-pointer">
            <div className="font-medium">{rule.name}</div>
            <div className="text-sm text-gray-600 mt-1">详情: {getSummary(rule)}</div>
          </div>

          {/* 编辑表单，仅在非 readOnly 模式且展开时显示 */}
          {!readOnly && expandedId === rule.id && FormComponent && (
            <div className="mt-2 p-1">
              <FormComponent
                key={rule.id}
                module={rule.module}
                editingRule={rule}
                onSubmit={handleUpdate}
                {...formProps}
                onClose={() => setExpandedId(null)}
              />
            </div>
          )}
          {/* 展开但找不到表单组件时的提示 */}
          {!readOnly && expandedId === rule.id && !FormComponent && (
            <div className="mt-2 text-red-600">表单组件未找到</div>
          )}
        </div>
      );
    });
  }, [rules, expandedId, formComponents, onDelete, handleUpdate, readOnly]);

  return (
    <div className="w-full flex-1 border-l p-4 bg-gray-50 overflow-auto">
      {rules.length === 0 ? (
        <div className="text-gray-500">暂无规则</div>
      ) : (
        <div className="flex flex-row flex-wrap gap-4">{ruleComponents}</div>
      )}
    </div>
  );
}
