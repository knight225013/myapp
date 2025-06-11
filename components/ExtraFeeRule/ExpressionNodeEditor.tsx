import { ExpressionNode } from './types';
import { Trash2 } from 'lucide-react';
import ExpressionBuilder from './ExpressionBuilder';

interface ExpressionNodeEditorProps {
  node: ExpressionNode;
  onChange: (node: ExpressionNode) => void;
  onRemove: () => void;
  id: string;
}

export default function ExpressionNodeEditor({
  node,
  onChange,
  onRemove,
  id,
}: ExpressionNodeEditorProps) {
  if (node.type === 'group') {
    return (
      <div className="border rounded p-2 bg-white flex items-center gap-2" data-id={id}>
        <span className="text-gray-500">(</span>
        <ExpressionBuilder
          expression={node.children}
          onChange={(children: ExpressionNode[]) => onChange({ ...node, children })}
        />
        <span className="text-gray-500">)</span>
        <button onClick={onRemove} className="text-red-600 hover:text-red-800">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const fields = [
    'weight',
    'volume',
    'chargeWeight',
    'boxCount',
    'length',
    'width',
    'height',
    'declareValue',
  ];
  const operators = ['+', '-', '*', '/', '>', '<', '==', '>=', '<=', '!='];

  if (node.type === 'operator') {
    return (
      <div className="flex items-center gap-1 bg-white border rounded px-2 py-1" data-id={id}>
        <select
          value={node.value}
          onChange={(e) =>
            onChange({
              type: 'operator',
              value: e.target.value as
                | '+'
                | '-'
                | '*'
                | '/'
                | '>'
                | '<'
                | '=='
                | '>='
                | '<='
                | '!=',
            })
          }
          className="border rounded px-1 py-0.5 text-sm"
        >
          {operators.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
        <button onClick={onRemove} className="text-red-600 hover:text-red-800">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-white border rounded px-2 py-1" data-id={id}>
      {node.type === 'field' && (
        <select
          value={node.value}
          onChange={(e) => onChange({ type: 'field', value: e.target.value })}
          className="border rounded px-1 py-0.5 text-sm"
        >
          <option value="">选择字段</option>
          {fields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      )}
      {node.type === 'value' && (
        <input
          type="number"
          value={node.value}
          onChange={(e) => onChange({ type: 'value', value: parseFloat(e.target.value) || 0 })}
          className="border rounded px-1 py-0.5 w-16 text-sm"
          step="0.01"
        />
      )}
      <button onClick={onRemove} className="text-red-600 hover:text-red-800">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
