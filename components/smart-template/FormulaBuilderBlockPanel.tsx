export function FormulaBuilderBlockPanel({ onAddToken }: { onAddToken: (token: string) => void }) {
  const blocks = [
    { label: '+', value: '+' },
    { label: '-', value: '-' },
    { label: '*', value: '*' },
    { label: '/', value: '/' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: 'if', value: 'if' },
    { label: 'min', value: 'min' },
    { label: 'max', value: 'max' },
    { label: 'chargeWeight', value: 'chargeWeight' },
  ];

  return (
    <div className="border p-2 rounded bg-white">
      <h4 className="font-semibold mb-2">字段库</h4>
      <div className="grid grid-cols-3 gap-2">
        {blocks.map((block) => (
          <button
            key={block.value}
            onClick={() => onAddToken(block.value)}
            className="border p-2 rounded hover:bg-gray-100"
          >
            {block.label}
          </button>
        ))}
      </div>
    </div>
  );
}
