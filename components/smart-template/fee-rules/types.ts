import { v4 as uuidv4 } from 'uuid';
import { FC } from 'react';

export interface FeeRule {
  id: string;
  module: string;
  type: string;
  name: string;
  params: {
    min?: number;
    max?: number;
    price: number;
    conditionUnit?: string;
    chargeUnit: string;
    field: string;
    label: string;
    [key: string]: any;
  };
  currency: string;
  activeFrom?: string;
  activeTo?: string;
}

export const generateRuleId = () => uuidv4();

export interface FormProps {
  module: string;
  onSubmit: (rule: Omit<FeeRule, 'id'>) => void;
}

export interface LadderRuleFormProps extends FormProps {
  labelPrefix: string;
  conditionUnit: string;
  chargeUnitOptions: { value: string; label: string }[];
  field: string;
}

export interface ModuleConfig {
  id: string;
  name: string;
  icon?: any; // 可选字段用于左侧图标扩展
  types: (LadderTypeConfig | StandardTypeConfig)[];
}

export interface LadderTypeConfig {
  id: string;
  name: string;
  formComponent: FC<LadderRuleFormProps>;
  formProps: Partial<LadderRuleFormProps>;
}

export interface StandardTypeConfig {
  id: string;
  name: string;
  formComponent: FC<FormProps>;
}
