// components/smart-template/rule-templates/hooks/useRuleReducer.ts
'use client';
import { useReducer, useCallback } from 'react';
import { Rule } from '../types';

interface RuleAction {
  type: 'updateRule' | 'addRules' | 'removeRule';
  id?: string;
  payload?: Partial<Rule> | Rule[];
}

function ruleReducer(state: Rule[], action: RuleAction): Rule[] {
  switch (action.type) {
    case 'updateRule':
      return state.map((rule) =>
        rule.id === action.id ? { ...rule, ...(action.payload as Partial<Rule>) } : rule,
      );
    case 'addRules':
      const newRules = action.payload as Rule[];
      const existingIds = new Set(state.map((rule) => rule.id));
      const filteredNewRules = newRules.filter((rule) => !existingIds.has(rule.id));
      return [...state, ...filteredNewRules];
    case 'removeRule':
      return state.filter((rule) => rule.id !== action.id);
    default:
      return state;
  }
}

export function useRuleReducer(initialRules: Rule[] = []) {
  const [rules, dispatch] = useReducer(ruleReducer, initialRules);

  const updateRule = useCallback((id: string, payload: Partial<Rule>) => {
    dispatch({ type: 'updateRule', id, payload });
  }, []);

  const addRules = useCallback((newRules: Rule[]) => {
    dispatch({ type: 'addRules', payload: newRules });
  }, []);

  const removeRule = useCallback((id: string) => {
    dispatch({ type: 'removeRule', id });
  }, []);

  return { rules, updateRule, addRules, removeRule };
}
