export function extractPlaceholders(str: string): string[] {
  const regex = /\{(\w+)\}/g;
  const matches = str.match(regex) || [];
  return matches.map((match) => match.slice(1, -1));
}

export function fillPlaceholders(str: string, values: Record<string, string>): string {
  let result = str;
  for (const [key, value] of Object.entries(values)) {
    const regex = new RegExp(`\\{${key}\\b}`, 'g'); // 使用正则，匹配边界
    result = result.replace(regex, value);
  }
  return result;
}
