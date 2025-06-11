// components/smart-template/RuleManager.tsx
'use client';
import React from 'react';
import { FixedSizeList } from 'react-window';
import { useRuleReducer, TemplateRuleCard, createRule } from './index';

export function RuleManager() {
  const { rules, updateRule, addRules, removeRule } = useRuleReducer([]);

  const addRule = (type: string, field: string) => {
    if (rules.some((rule) => rule.type === type && rule.field === field)) {
      alert('该规则已存在！');
      return;
    }
    const newRule = createRule(type, field, `${type}-${field}-${Date.now()}`);
    addRules([newRule]);
  };

  const renderRule = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TemplateRuleCard
        key={rules[index].id}
        rule={rules[index]}
        onUpdate={updateRule}
        onRemove={removeRule}
      />
    </div>
  );

  return (
    <div>
      <button onClick={() => addRule('number', 'weight')}>添加重量规则</button>
      <button onClick={() => addRule('boolean', 'isWoodProduct')}>添加木制品规则</button>
      <button onClick={() => addRule('boolean', 'isCustomsDeclared')}>添加报关规则</button>
      <button onClick={() => addRule('boolean', 'hasInvoice')}>添加发票规则</button>
      <button onClick={() => addRule('number', 'declaredValue')}>添加保险规则</button>
      <button onClick={() => addRule('number', 'storageDays')}>添加仓储规则</button>
      <button onClick={() => addRule('string', 'postalCode')}>添加偏远地区规则</button>
      <button onClick={() => addRule('number', 'maxLength')}>添加长边尺寸规则</button>
      <button onClick={() => addRule('number', 'secondLength')}>添加次边尺寸规则</button>
      <button onClick={() => addRule('number', 'true')}>添加整票固定税费</button>
      <button onClick={() => addRule('number', 'quantity')}>添加按件固定税费</button>
      <button onClick={() => addRule('number', 'baseCharge')}>添加燃油附加费</button>
      <button onClick={() => addRule('number', 'girth')}>添加围长规则</button>
      <button onClick={() => addRule('number', 'quantity')}>添加按件计费规则</button>
      <button onClick={() => addRule('number', 'totalFee')}>添加折扣规则</button>
      <button onClick={() => addRule('number', 'volume')}>添加CBM计费规则</button>
      <button onClick={() => addRule('string', 'category')}>添加品类规则</button>
      <FixedSizeList height={600} width="100%" itemCount={rules.length} itemSize={150}>
        {renderRule}
      </FixedSizeList>
    </div>
  );
}
