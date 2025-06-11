'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { TemplateApplyForm } from '@/components/smart-template/TemplateApplyForm';

export default function ApplyTemplate() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id');
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = (updatedRules: { condition: string; formula: string }[]) => {
    setResult(JSON.stringify({ rules: updatedRules }, null, 2));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">套用模板</h1>
      {templateId ? (
        <TemplateApplyForm templateId={templateId} onSubmit={handleSubmit} />
      ) : (
        <p className="text-red-500">请选择模板</p>
      )}
      {result && <pre className="mt-4 p-4 bg-gray-100 rounded">{result}</pre>}
    </div>
  );
}
