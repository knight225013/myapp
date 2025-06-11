import { useState, useMemo, useCallback } from 'react';
import { FeeRule } from './types';
import { X } from 'lucide-react';
import { modules } from './config';

interface Props {
  rules: FeeRule[];
  onDelete: (id: string) => void;
  onUpdate: (updatedRule: FeeRule) => void;
  formComponents: Record<string, React.ComponentType<any>>;
}

export default function FeeRuleCardList({ rules, onDelete, onUpdate, formComponents }: Props) {
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
      const conditionUnitCn = p.conditionUnit ? (unitMap[p.conditionUnit] ?? p.conditionUnit) : '';
      const min = p.min;
      const max = p.max !== undefined ? p.max : '∞';
      return `${rule.name}：${min}~${max}${conditionUnitCn}，收取费用：${p.price}元/${chargeUnitCn}`;
    }
    return rule.params?.label || rule.name || '未知规则';
  };

  const getFormProps = (rule: FeeRule) => {
    const module = modules.find((m) => m.id === rule.module);
    const type = module?.types.find((t) => t.id === rule.type);
    const formProps = type && 'formProps' in type ? type.formProps : {};
    console.log('getFormProps:', { rule, module, type, formProps });
    return formProps;
  };

  const handleUpdate = useCallback(
    (updatedRule: FeeRule) => {
      if (!updatedRule?.id || !updatedRule?.type) {
        console.error('Invalid updated rule:', updatedRule);
        return;
      }
      onUpdate(updatedRule);
      setExpandedId(null);
    },
    [onUpdate],
  );

  if (!Array.isArray(rules)) {
    console.error('Rules is not an array:', rules);
    return <div className="text-red-600">规则数据无效</div>;
  }

  const ruleComponents = useMemo(() => {
    return rules.map((rule) => {
      const FormComponent = formComponents[rule.type];
      const formProps = getFormProps(rule);
      if (!FormComponent) {
        console.warn(`Form component not found for rule type: ${rule.type}`, rule);
      }
      console.log('rule:', rule, 'FormComponent:', FormComponent, 'formProps:', formProps);
      return (
        <div
          key={rule.id}
          className="border p-3 mb-3 rounded bg-white relative hover:shadow-md transition"
          style={{ minWidth: '300px', maxWidth: '320px', flex: '1 1 calc(33.333% - 1rem)' }}
        >
          <button
            className="absolute top-2 right-2 text-red-400 hover:text-red-600 z-10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(rule.id);
            }}
          >
            <X size={16} />
          </button>
          <div
            className="cursor-pointer"
            onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}
          >
            <div className="font-medium">{rule.name}</div>
            <div className="text-sm text-gray-600 mt-1">详情: {getSummary(rule)}</div>
          </div>
          {expandedId === rule.id && FormComponent ? (
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
          ) : expandedId === rule.id ? (
            <div className="mt-2 text-red-600">表单组件未找到</div>
          ) : null}
        </div>
      );
    });
  }, [rules, expandedId, formComponents, onDelete, handleUpdate]);

  console.log('formComponents:', formComponents);
  console.log('rules:', rules);

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
