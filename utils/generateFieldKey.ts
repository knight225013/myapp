import pinyin from 'pinyin';

export function generateFieldKey(label: string, existingFields: string[] = []) {
  // 1. 处理空格、标点、特殊符号
  const cleaned = label
    .replace(/\s+/g, '')
    .replace(/（.*?）/g, '')
    .replace(/[^\w\u4e00-\u9fa5]/g, '');

  // 2. 自动转为拼音
  const pyArray = pinyin(cleaned, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false,
  });

  const base = 'custom_' + pyArray.flat().join('');

  // 3. 去重（如有相同字段名）
  let field = base;
  let count = 1;
  while (existingFields.includes(field)) {
    field = `${base}${count++}`;
  }

  return field;
}
