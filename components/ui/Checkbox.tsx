type CheckboxProps = {
  label: string;
  name: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Checkbox({ label, name, checked, onChange }: CheckboxProps) {
  return (
    <div className="mb-4 flex items-center">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="mr-2" />
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  );
}
