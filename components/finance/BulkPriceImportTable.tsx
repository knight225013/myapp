'use client';
import { useState } from 'react';
import { parse } from 'papaparse';

interface BulkPriceImportTableProps {
  priceId: string;
}

export function BulkPriceImportTable({ priceId }: BulkPriceImportTableProps) {
  const [text, setText] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    setText(pastedText);
    const { data } = parse(pastedText, { header: true });
    setData(data);
  };

  const handlePreview = () => {
    if (!text) {
      setError('请粘贴数据');
      return;
    }
    setError(null);
    const { data } = parse(text, { header: true });
    setData(data);
  };

  const handleSave = async () => {
    if (!data.length) {
      setError('无有效数据');
      return;
    }
    try {
      const res = await fetch(`/api/finance/prices/${priceId}/settings/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('保存失败');
      setError(null);
      setText('');
      setData([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <textarea onPaste={handlePaste} value={text} onChange={(e) => setText(e.target.value)} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handlePreview}>预览</button>
      <table>
        <thead>
          <tr>{data[0] && Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((val, j) => (
                <td key={j}>{val as string}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
