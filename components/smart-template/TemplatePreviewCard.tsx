import Link from 'next/link';
import { Template } from './rule-templates/types';

export function TemplatePreviewCard({ template }: { template: Template }) {
  return (
    <Link href={`/smart-template/apply?id=${template.id}`}>
      <div className="border rounded-lg p-6 hover:shadow-lg transition bg-white">
        <h3 className="text-xl font-semibold">{template.name}</h3>
        <p className="text-gray-600 mt-2">{template.description}</p>
        <div className="mt-4">
          {template.rules.map((rule, index) => (
            <span key={index} className="inline-block bg-gray-100 px-2 py-1 rounded mr-2 text-sm">
              {rule.label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
