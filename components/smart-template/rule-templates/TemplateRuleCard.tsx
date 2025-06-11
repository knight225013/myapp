// components/smart-template/rule-templates/TemplateRuleCard.tsx
'use client';
import { systemFields } from './fields';
import React, { useState } from 'react';
import { Rule } from './types';
import {
  WeightRuleCard,
  BooleanRuleCard,
  InsuranceRuleCard,
  StorageRuleCard,
  RemoteAreaRuleCard,
  DimensionRuleCard,
  GirthRuleCard,
  FuelRuleCard,
  PerPieceRuleCard,
  CategoryRuleCard,
  PromotionRuleCard,
  CBMChargeRuleCard,
  FlatTaxRuleCard,
} from './index';

interface TemplateRuleCardProps {
  rule: Rule;
  onUpdate: (id: string, payload: Partial<any>) => void;
  onRemove: (id: string) => void;
}

export const TemplateRuleCard = React.memo(function TemplateRuleCard({
  rule,
  onUpdate,
  onRemove,
}: TemplateRuleCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(rule.label);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const handleLabelSave = () => {
    if (label.trim()) {
      onUpdate(rule.id, { label });
      setIsEditing(false);
    }
  };

  const isOverweightRule = rule.field === 'boxWeight';
  const isBooleanRule = rule.type === 'boolean';
  const isInsuranceRule = rule.field === 'declaredValue';
  const isStorageFeeRule = rule.field === 'storageDays';
  const isRemoteAreaRule = rule.field === 'postalCode';
  const isDimensionRule = rule.field === 'maxLength' || rule.field === 'secondLength';
  const isGirthRule = rule.field === 'girth';
  const isFuelRule = rule.field === 'baseCharge';
  const isPerPieceRule = rule.field === 'quantity';
  const isCategoryRule = rule.field === 'category';
  const isPromotionRule = rule.field === 'totalFee';
  const isCBMChargeRule = rule.field === 'volume' && rule.formula.includes('(volume / 1000000)');
  const isFlatTaxRule =
    rule.formula.includes('fixedAmount') || rule.formula.includes('fixedPerPiece');

  return (
    <div className="mb-4 border rounded-lg p-4 shadow-sm bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={label}
              onChange={handleLabelChange}
              className="border p-2 rounded w-48 focus:ring-2 focus:ring-blue-500"
              placeholder="输入规则名称"
            />
            <button onClick={handleLabelSave} className="text-blue-500 hover:text-blue-700">
              保存
            </button>
            <button
              onClick={() => {
                setLabel(rule.label);
                setIsEditing(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
          </div>
        ) : (
          <h3 className="font-semibold text-lg text-gray-800">
            {rule.label} <span className="text-sm text-gray-500">({rule.id})</span>{' '}
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:text-blue-700 text-sm ml-2"
            >
              编辑名称
            </button>
          </h3>
        )}
        <button onClick={() => onRemove(rule.id)} className="text-red-500 hover:text-red-700">
          删除
        </button>
      </div>

      {/* ✅ 正确位置：字段下拉独立一行展示 */}
      <div className="mb-3">
        <label className="text-gray-600 text-sm mr-2">绑定字段：</label>
        <select
          value={rule.field}
          onChange={(e) => onUpdate(rule.id, { field: e.target.value })}
          className="border p-1 rounded bg-white text-sm"
        >
          {systemFields.map((f) => (
            <option key={f.field} value={f.field}>
              {f.label}（{f.field}）
            </option>
          ))}
        </select>
      </div>

      {isBooleanRule ? (
        <BooleanRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isInsuranceRule ? (
        <InsuranceRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isStorageFeeRule ? (
        <StorageRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isRemoteAreaRule ? (
        <RemoteAreaRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isDimensionRule ? (
        <DimensionRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isGirthRule ? (
        <GirthRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isFuelRule ? (
        <FuelRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isPerPieceRule ? (
        <PerPieceRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isCategoryRule ? (
        <CategoryRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isPromotionRule ? (
        <PromotionRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isCBMChargeRule ? (
        <CBMChargeRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isFlatTaxRule ? (
        <FlatTaxRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      ) : isOverweightRule ? (
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <label className="text-gray-600">条件：</label>
            <span>箱重 {'>'} </span>
            <div className="relative">
              <input
                type="number"
                className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
                placeholder="重量阈值"
                value={rule.threshold ?? ''}
                onChange={(e) => onUpdate(rule.id, { threshold: Number(e.target.value) })}
              />
              <span className="absolute right-2 top-2 text-gray-500">kg</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-600">费用：</label>
            <span>附加费 </span>
            <div className="relative">
              <input
                type="number"
                className="border p-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
                placeholder="费用金额"
                value={rule.fee ?? ''}
                onChange={(e) => onUpdate(rule.id, { fee: Number(e.target.value) })}
              />
              <span className="absolute right-2 top-2 text-gray-500">元</span>
            </div>
          </div>
        </div>
      ) : (
        <WeightRuleCard rule={rule} onUpdate={onUpdate} onRemove={onRemove} />
      )}
    </div>
  );
});
