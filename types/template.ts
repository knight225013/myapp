export type TemplateMode = 'grid' | 'directional' | 'fixed';

export type FieldAreaBinding = {
  field: string;
  from: string;
  direction: 'horizontal' | 'vertical';
  length: number;
};

export interface TemplateInfo {
  id: string;
  name: string;
  mode: TemplateMode;
  type: 'FBA' | '传统'; // 包含 type 属性
  startRow: number;
  bindings?: FieldAreaBinding[];
  columns?: string[];
  filePath?: string;
}
