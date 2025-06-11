'use client';

import React from 'react';
import { LadderTypeConfig, StandardTypeConfig } from './types';

interface Props {
  types: (LadderTypeConfig | StandardTypeConfig)[];
  selectedTypeId: string | null;
  onSelect: (typeId: string) => void;
  vertical?: boolean;
}

export default function FeeRuleTypeSelector({
  types,
  selectedTypeId,
  onSelect,
  vertical = false,
}: Props) {
  if (!types || types.length === 0) return null;

  return (
    <div className={`flex ${vertical ? 'flex-col gap-3' : 'flex-wrap gap-2'}`}>
      {types.map((type) => (
        <button
          key={type.id}
          className={`px-4 py-2 rounded-md text-sm transition-all duration-150 border
            ${
              selectedTypeId === type.id
                ? 'bg-orange-100 text-orange-700 font-semibold shadow border-orange-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }
          `}
          onClick={() => onSelect(type.id)}
        >
          {type.name}
        </button>
      ))}
    </div>
  );
}
