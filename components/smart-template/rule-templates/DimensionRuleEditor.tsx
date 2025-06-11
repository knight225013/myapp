import React, { useState } from 'react';
import { Template } from './types';

interface DimensionRuleEditorProps {
  template: Template;
  onSave: (rules: any) => void;
}

export const DimensionRuleEditor: React.FC<DimensionRuleEditorProps> = ({ template, onSave }) => {
  const [maxThreshold, setMaxThreshold] = useState(100);
  const [maxFee, setMaxFee] = useState(120);
  const [secondThreshold, setSecondThreshold] = useState(70);
  const [secondFee, setSecondFee] = useState(120);

  const handleSave = () => {
    const rules = {
      maxLength: { threshold: maxThreshold, fee: maxFee },
      secondLength: { threshold: secondThreshold, fee: secondFee },
    };
    onSave(rules);
    const json = JSON.stringify(rules, null, 2);
    console.log('Rules JSON:', json);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label>长边附加费</label>
        <input
          type="number"
          value={maxThreshold}
          onChange={(e) => {
            console.log('Max Threshold:', e.target.value);
            setMaxThreshold(Number(e.target.value));
          }}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          disabled={false}
          readOnly={false}
        />
      </div>
      <div>
        <label>长边附加费 (元)</label>
        <input
          type="number"
          value={maxFee}
          onChange={(e) => {
            console.log('Max Fee:', e.target.value);
            setMaxFee(Number(e.target.value));
          }}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          disabled={false}
          readOnly={false}
        />
      </div>
      <div>
        <label>次边附加费</label>
        <input
          type="number"
          value={secondThreshold}
          onChange={(e) => {
            console.log('Second Threshold:', e.target.value);
            setSecondThreshold(Number(e.target.value));
          }}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          disabled={false}
          readOnly={false}
        />
      </div>
      <div>
        <label>次边附加费 (元)</label>
        <input
          type="number"
          value={secondFee}
          onChange={(e) => {
            console.log('Second Fee:', e.target.value);
            setSecondFee(Number(e.target.value));
          }}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          disabled={false}
          readOnly={false}
        />
      </div>
      <button
        onClick={handleSave}
        style={{
          padding: '8px 16px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        保存
      </button>
    </div>
  );
};
