// unitOptions.ts

// 显示映射（详情卡片等用中文）
export const chargeUnitMap = {
  box: '每箱',
  ticket: '每票',
  kg: '每公斤',
  cbm: '每立方米',
};

// 下拉选项数组（表单 select 用）
export const chargeUnitOptions = Object.entries(chargeUnitMap).map(([value, label]) => ({
  value,
  label,
}));
