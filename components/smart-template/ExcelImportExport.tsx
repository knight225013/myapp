'use client';
import { useRef } from 'react';
import * as XLSX from 'xlsx';

interface ExcelImportExportProps {
  onImport: (file: File) => void;
}

export default function ExcelImportExport({ onImport }: ExcelImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/channels/export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'channels.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="flex gap-4">
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
        id="excel-import"
      />
      <label htmlFor="excel-import" className="btn-create cursor-pointer">
        导入 Excel
      </label>
      <button className="btn-create" onClick={handleExport}>
        导出 Excel
      </button>
    </div>
  );
}
