import { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';
import ExtraFeeRuleCard from './ExtraFeeRuleCard';
import { ExtraFeeRule, ItemTypes } from './types';

interface DraggableRuleCardProps {
  rule: ExtraFeeRule;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  onUpdate: (updated: Partial<ExtraFeeRule>) => void;
  onDelete: () => void;
}

const DraggableRuleCard: React.FC<DraggableRuleCardProps> = ({
  rule,
  index,
  moveCard,
  onUpdate,
  onDelete,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag<
    { id: string; index: number },
    unknown,
    { isDragging: boolean }
  >(
    () => ({
      type: ItemTypes.RULE_CARD,
      item: () => ({ id: rule.id, index }),
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [rule.id, index],
  );

  const [{ isOver }, drop] = useDrop<{ id: string; index: number }, unknown, { isOver: boolean }>(
    () => ({
      accept: ItemTypes.RULE_CARD,
      hover: (item: { id: string; index: number }, monitor: DropTargetMonitor) => {
        if (!ref.current || item.id === rule.id) return;

        const dragIndex = item.index;
        const hoverIndex = index;
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (
          (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
          (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
        ) {
          return;
        }

        moveCard(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [index, rule.id, moveCard],
  );

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="transition-transform duration-200"
      style={{
        opacity: isDragging ? 0.5 : 1,
        border: isOver ? '2px solid #3b82f6' : '1px solid #d1d5db',
        marginBottom: '1rem',
      }}
    >
      <ExtraFeeRuleCard rule={rule} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
};

interface ExtraFeeRuleListProps {
  rules: ExtraFeeRule[];
  onChange: (rules: ExtraFeeRule[]) => void;
}

export default function ExtraFeeRuleList({ rules, onChange }: ExtraFeeRuleListProps) {
  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const newRules = [...rules];
    const [draggedRule] = newRules.splice(dragIndex, 1);
    newRules.splice(hoverIndex, 0, draggedRule);
    onChange(newRules);
  };

  const handleAddRule = () => {
    const newRule: ExtraFeeRule = {
      id: uuidv4(),
      name: '新附加费规则',
      expression: [],
      feeType: 'fixed',
      value: 0,
      currency: 'CNY',
    };
    onChange([...rules, newRule]);
  };

  const updateRule = (id: string, updated: Partial<ExtraFeeRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...updated } : r)));
  };

  const removeRule = (id: string) => {
    onChange(rules.filter((r) => r.id !== id));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <DraggableRuleCard
            key={rule.id}
            rule={rule}
            index={index}
            moveCard={moveCard}
            onUpdate={(updated) => updateRule(rule.id, updated)}
            onDelete={() => removeRule(rule.id)}
          />
        ))}
        <button
          onClick={handleAddRule}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ➕ 添加附加费规则
        </button>
      </div>
    </DndProvider>
  );
}
