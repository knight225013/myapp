type InputProps = {
  label: string;
  name: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  step?: string;
  readOnly?: boolean; // 新增 readOnly 属性
};

export default function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  min,
  step,
  readOnly,
}: InputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-input-style"
        required={required}
        min={min}
        step={step}
        readOnly={readOnly} // 传递 readOnly 属性
      />
    </div>
  );
}
