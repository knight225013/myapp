import { create } from 'zustand';
import { Rule } from '../types';
// 引入规则类型

interface TemplateDraftState {
  rules: Rule[]; // 存储临时规则
  addRules: (newRules: Rule[]) => void; // 添加规则
  removeRule: (id: string) => void; // 删除指定规则
  clearRules: () => void; // 清空所有规则
}

export const useTemplateDraftStore = create<TemplateDraftState>((set) => ({
  rules: [],
  addRules: (newRules) =>
    set((state) => {
      // 去重：避免重复添加相同 ID 的规则
      const existingIds = new Set(state.rules.map((rule) => rule.id));
      const uniqueRules = newRules.filter((rule) => !existingIds.has(rule.id));
      return { rules: [...state.rules, ...uniqueRules] };
    }),
  removeRule: (id) =>
    set((state) => ({
      rules: state.rules.filter((rule) => rule.id !== id),
    })),
  clearRules: () => set({ rules: [] }),
}));
