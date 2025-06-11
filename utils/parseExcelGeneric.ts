import * as XLSX from 'xlsx';

// 解析单元格地址（如 "A2" → { rowIndex: 1, colIndex: 0 }）
export function parseCellKey(cellKey: string): { rowIndex: number; colIndex: number } {
  const match = cellKey.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`无效的单元格地址: ${cellKey}`);
  const col = match[1];
  const row = parseInt(match[2], 10);
  const colIndex = col.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;
  const rowIndex = row - 1;
  return { rowIndex, colIndex };
}

export async function parseExcel(
  file: File,
  maxRows: number = 20,
  maxCols: number = 20,
): Promise<{
  grid: (string | number | undefined)[][];
  cells: Record<string, string | number | undefined>;
  rows: (string | number | undefined)[][];
  headers: string[];
}> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];

  // 提取所有单元格数据
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const cells: Record<string, string | number | undefined> = {};
  const grid: (string | number | undefined)[][] = Array.from({ length: maxRows }, () =>
    Array(maxCols).fill(undefined),
  );
  const rows: (string | number | undefined)[][] = [];

  // 提取所有行数据
  const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (
    | string
    | number
    | undefined
  )[][];
  allRows.forEach((row) => {
    rows.push(row.slice(0, maxCols));
  });

  // 提取表头（第一行）
  const headers = (allRows[0] || []).map(String).slice(0, maxCols);

  // 提取单元格数据（用于 grid 和 directional 模式）
  for (let row = 0; row < Math.min(maxRows, range.e.r + 1); row++) {
    for (let col = 0; col < Math.min(maxCols, range.e.c + 1); col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = sheet[cellAddress];
      const value = cell?.v ?? '';
      cells[cellAddress] = value;
      grid[row][col] = value;
    }
  }

  return { grid, cells, rows, headers };
}
