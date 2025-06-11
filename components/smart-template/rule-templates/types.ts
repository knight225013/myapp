import { v4 as uuidv4 } from 'uuid';

export interface Rule {
  id: string;
  label: string;
  field: string;
  type: string;
  condition: string;
  formula: string;
  value: any;
  fee?: number;
  noInvoiceFee?: number;
  threshold?: number;
  rate?: number;
  minThreshold?: number;
  maxThreshold?: number;
  price?: number;
  freeDays?: number;
  dailyFee?: number;
  countries?: string[];
  regions?: string[];
  maxFee?: number;
  secondThreshold?: number;
  secondFee?: number;
  fixedAmount?: number;
  fixedPerPiece?: number;
  limit?: number;
  discount?: number;
  cbmRate?: number;
  match?: string;
  [key: string]: any;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  rules: Rule[];
}
export interface FeeRule {
  id: string;
  module: string; // e.g., "重量模块", "尺寸模块"
  type: string; // e.g., "阶梯式", "固定费用"
  name: string;
  params: any; // Type-specific parameters
  currency: string;
  activeFrom?: string;
  activeTo?: string;
  note?: string;
}

export const generateRuleId = () => uuidv4();
