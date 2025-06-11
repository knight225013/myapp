import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ExpressionNodeEditor from './ExpressionNodeEditor';
import { ExpressionNode, ItemTypes } from './types';
import { PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Field {
  id: string;
  label: string;
}

const availableFields: Field[] = [
  { id: 'weight', label: '重量' },
  { id: 'volume', label: '体积' },
  { id: 'chargeWeight', label: '计费重' },
  { id: 'boxCount', label: '箱数' },
  { id: 'length', label: '长' },
  { id: 'width', label: '宽' },
  { id: 'height', label: '高' },
  { id: 'declareValue', label: '申报价值' },
];

const FieldItem: React.FC<{ field: Field }> = ({ field }) => {
  const [{ isDragging }, drag] = useDrag<
    { id: string; label: string },
    unknown,
    { isDragging: boolean }
  >(
    () => ({
      type: ItemTypes.FIELD,
      item: { id: field.id, label: field.label },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [field.id, field.label],
  );

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      drag(node);
    },
    [drag],
  );

  return (
    <div
      ref={ref}
      className="px-2 py-1 bg-blue-100 rounded mr-2 mb-2 cursor-grab"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {field.label}
    </div>
  );
};

const FieldLibrary: React.FC = () => {
  return (
    <div className="mb-4 p-2 bg-gray-100 rounded">
      <h4 className="text-sm font-medium mb-2">字段库</h4>
      <div className="flex flex-wrap">
        {availableFields.map((field) => (
          <FieldItem key={field.id} field={field} />
        ))}
      </div>
    </div>
  );
};

interface DraggableNodeProps {
  node: ExpressionNode;
  index: number;
  moveNode: (dragIndex: number, hoverIndex: number) => void;
  onChange: (node: ExpressionNode) => void;
  onRemove: () => void;
}

const DraggableNode = ({ node, index, moveNode, onChange, onRemove }: DraggableNodeProps) => {
  const [{ isDragging }, drag] = useDrag<{ index: number }, unknown, { isDragging: boolean }>(
    () => ({
      type: ItemTypes.EXPRESSION_NODE,
      item: { index },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index],
  );

  const [, drop] = useDrop<{ index: number }, unknown, {}>(
    () => ({
      accept: ItemTypes.EXPRESSION_NODE,
      hover: (item: { index: number }, monitor: DropTargetMonitor) => {
        if (item.index === index) return;
        moveNode(item.index, index);
        item.index = index;
      },
    }),
    [index, moveNode],
  );

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      drag(node);
      drop(node);
    },
    [drag, drop],
  );

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <ExpressionNodeEditor
        node={node}
        onChange={onChange}
        onRemove={onRemove}
        id={`node-${index}`}
      />
    </div>
  );
};

interface ExpressionBuilderProps {
  expression: ExpressionNode[];
  onChange: (expression: ExpressionNode[]) => void;
}

export default function ExpressionBuilder({ expression, onChange }: ExpressionBuilderProps) {
  const [nodes, setNodes] = useState(expression.map((node) => ({ node, id: uuidv4() })));
  const [selectedOperator, setSelectedOperator] = useState<string>('');

  const [{ isOver }, drop] = useDrop<Field, unknown, { isOver: boolean }>(
    () => ({
      accept: ItemTypes.FIELD,
      drop: (item: Field) => {
        const newNode: ExpressionNode = { type: 'field', value: item.id };
        const newNodes = [...nodes, { node: newNode, id: uuidv4() }];
        setNodes(newNodes);
        onChange(newNodes.map((n) => n.node));
      },
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [],
  );

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      drop(node);
    },
    [drop],
  );

  const handleAddNode = () => {
    const newNode: ExpressionNode = { type: 'field', value: '' };
    const newNodes = [...nodes, { node: newNode, id: uuidv4() }];
    setNodes(newNodes);
    onChange(newNodes.map((n) => n.node));
  };

  const handleAddGroup = () => {
    const newNode: ExpressionNode = { type: 'group', children: [] };
    const newNodes = [...nodes, { node: newNode, id: uuidv4() }];
    setNodes(newNodes);
    onChange(newNodes.map((n) => n.node));
  };

  const handleAddOperator = () => {
    if (!selectedOperator) return;
    const newNode: ExpressionNode = {
      type: 'operator',
      value: selectedOperator as '+' | '-' | '*' | '/' | '>' | '<' | '==' | '>=' | '<=' | '!=',
    };
    const newNodes = [...nodes, { node: newNode, id: uuidv4() }];
    setNodes(newNodes);
    onChange(newNodes.map((n) => n.node));
    setSelectedOperator('');
  };

  const updateNode = (index: number, updatedNode: ExpressionNode) => {
    const newNodes = [...nodes];
    newNodes[index] = { ...newNodes[index], node: updatedNode };
    setNodes(newNodes);
    onChange(newNodes.map((n) => n.node));
  };

  const removeNode = (index: number) => {
    const newNodes = nodes.filter((_, i) => i !== index);
    setNodes(newNodes);
    onChange(newNodes.map((n) => n.node));
  };

  const moveNode = (dragIndex: number, hoverIndex: number) => {
    const newNodes = [...nodes];
    const [draggedNode] = newNodes.splice(dragIndex, 1);
    newNodes.splice(hoverIndex, 0, draggedNode);
    setNodes(newNodes);
    onChange(newNodes.map((n) => n.node));
  };

  const operators = ['+', '-', '*', '/', '>', '<', '==', '>=', '<=', '!='];

  return (
    <DndProvider backend={HTML5Backend}>
      <FieldLibrary />
      <div
        ref={ref}
        className="border rounded p-2 bg-gray-50"
        style={{ backgroundColor: isOver ? '#f0f0f0' : '#fafafa' }}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {nodes.map(({ node, id }, index) => (
            <DraggableNode
              key={id}
              node={node}
              index={index}
              moveNode={moveNode}
              onChange={(updated) => updateNode(index, updated)}
              onRemove={() => removeNode(index)}
            />
          ))}
          <div className="flex gap-2 items-center">
            <button
              onClick={handleAddNode}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <PlusCircle className="w-4 h-4 inline mr-1" /> 添加节点
            </button>
            <button
              onClick={handleAddGroup}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <PlusCircle className="w-4 h-4 inline mr-1" /> 添加组
            </button>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="border rounded px-1 py-0.5 text-sm"
            >
              <option value="">选择操作符</option>
              {operators.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddOperator}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!selectedOperator}
            >
              <PlusCircle className="w-4 h-4 inline mr-1" /> 添加操作符
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
