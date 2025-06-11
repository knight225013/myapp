'use client';
type TextareaProps = {
  label: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function Textarea({ label, name, value, onChange }: TextareaProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="form-input-style w-full h-24 resize-none"
      />
    </div>
  );
}
