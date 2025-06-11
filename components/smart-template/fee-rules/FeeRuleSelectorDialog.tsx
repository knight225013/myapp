'use client';

import { useState, useEffect } from 'react';
import Dialog from '@/components/ui/Dialog';
import FeeRuleModuleSidebar from './FeeRuleModuleSidebar';
import FeeRuleTypeSelector from './FeeRuleTypeSelector';
import FeeRuleCardList from './FeeRuleCardList';
import { FeeRule, generateRuleId } from './types';
import { modules } from './config';

interface Props {
  isOpen: boolean;
  initialRules: FeeRule[];
  onClose: () => void;
  onConfirm: (rules: FeeRule[]) => void;
}

export default function FeeRuleSelectorDialog({ isOpen, initialRules, onClose, onConfirm }: Props) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0].id);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [rules, setRules] = useState<FeeRule[]>(initialRules);
  const [editingRule, setEditingRule] = useState<FeeRule | null>(null);

  const formComponents = Object.fromEntries(
    modules.flatMap((m) => m.types.map((t) => [t.id, t.formComponent])),
  );

  useEffect(() => {
    setSelectedTypeId(null);
    setEditingRule(null);
    console.log('Selected module:', selectedModuleId, 'Rules:', rules);
  }, [selectedModuleId]);

  const handleAddRule = (rule: Omit<FeeRule, 'id'>) => {
    const newRule = { ...rule, id: generateRuleId() };
    setRules((prev) => {
      const updatedRules = [...prev, newRule];
      console.log('Added rule:', newRule, 'Updated rules:', updatedRules);
      return updatedRules;
    });
    setEditingRule(null);
  };

  const currentModule = modules.find((m) => m.id === selectedModuleId);
  const currentType = currentModule?.types.find((t) => t.id === selectedTypeId);
  const FormComponent = currentType?.formComponent;
  const formProps = currentType && 'formProps' in currentType ? (currentType as any).formProps : {};

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="附加费设置">
      <div className="flex h-[80vh] w-full">
        <div className="w-[200px] border-r p-4 bg-white">
          <FeeRuleModuleSidebar
            modules={modules}
            selectedModuleId={selectedModuleId}
            onSelect={setSelectedModuleId}
          />
        </div>
        <div className="w-[200px] border-r p-4 bg-gray-50">
          <FeeRuleTypeSelector
            types={currentModule?.types || []}
            selectedTypeId={selectedTypeId}
            onSelect={setSelectedTypeId}
            vertical
          />
        </div>
        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          <div className="bg-white rounded-xl shadow-md p-6 mb-4 min-h-[200px]">
            {FormComponent ? (
              <FormComponent
                module={currentModule?.name || ''}
                onSubmit={handleAddRule}
                editingRule={editingRule}
                {...formProps}
              />
            ) : (
              <div className="text-gray-400 text-sm">请选择计费方式</div>
            )}
          </div>
          <div className="flex-1 overflow-auto bg-white rounded-xl border shadow-inner p-4">
            <FeeRuleCardList
              rules={rules}
              onDelete={(id) => setRules((prev) => prev.filter((r) => r.id !== id))}
              onUpdate={(updatedRule) =>
                setRules((prev) => prev.map((r) => (r.id === updatedRule.id ? updatedRule : r)))
              }
              formComponents={formComponents}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700"
          onClick={() => {
            console.log('Saving rules:', rules);
            onConfirm(rules);
          }}
        >
          确认保存
        </button>
      </div>
    </Dialog>
  );
}
