import * as XLSX from 'xlsx';
import { FIELD_ALIASES } from './fieldAliasMap';

export async function parseExcel(file: File): Promise<{ headers: string[]; rows: any[] }> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];
  return { headers, rows };
}

export function applyFieldMapping(mapping: Record<string, string>, row: any): any {
  const shipment: any = {};
  Object.keys(mapping).forEach((excelCol) => {
    const field = mapping[excelCol];
    if (field) {
      const value = row[excelCol];
      if (['hasBattery', 'hasMagnetic', 'hasDangerous', 'insurance'].includes(field)) {
        shipment[field] = value === '是' || value === true;
      } else if (['weight', 'length', 'width', 'height', 'declaredValue'].includes(field)) {
        shipment[field] = parseFloat(value) || 0;
      } else if (['declaredQuantity', 'boxCount'].includes(field)) {
        shipment[field] = parseInt(value) || 1;
      } else if (field === 'boxes' && value) {
        shipment[field] = [{ code: value }];
      } else {
        shipment[field] = value || '';
      }
    }
  });
  return shipment;
}

export function autoMapFields(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  headers.forEach((header) => {
    if (FIELD_ALIASES[header]) {
      mapping[header] = FIELD_ALIASES[header];
    }
  });
  return mapping;
}
