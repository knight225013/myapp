'use client';
import React from 'react';
import { Layers } from 'lucide-react';
import { ModuleConfig } from './types';

interface Props {
  modules: ModuleConfig[];
  selectedModuleId: string;
  onSelect: (moduleId: string) => void;
}

export default function FeeRuleModuleSidebar({ modules, selectedModuleId, onSelect }: Props) {
  return (
    <div className="w-[200px] bg-white border-r p-3 flex flex-col gap-2">
      {modules.map((module) => (
        <button
          key={module.id}
          onClick={() => onSelect(module.id)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg transition
            ${
              selectedModuleId === module.id
                ? 'bg-orange-100 text-orange-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          <Layers className="w-4 h-4" />
          <span className="text-sm">{module.name}</span>
        </button>
      ))}
    </div>
  );
}
