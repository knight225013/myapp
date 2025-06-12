import React from 'react';
import './WaveInput.css';

interface WaveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const WaveInput: React.FC<WaveInputProps> = ({ label, ...props }) => {
  return (
    <div className="wave-group">
      <input required type="text" className="input" {...props} />
      <span className="bar"></span>
      <label className="label">
        {label.split('').map((char, idx) => (
          <span className="label-char" style={{ '--index': idx } as any} key={idx}>
            {char}
          </span>
        ))}
      </label>
    </div>
  );
};

export default WaveInput; 