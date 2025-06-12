// TemplatePreviewCard.tsx
import Link from 'next/link';
import type { Template } from './rule-templates/types';

interface Props {
  template: Template;
  disableLink?: boolean;  // 新增
}

export function TemplatePreviewCard({ template, disableLink }: Props) {
  // 卡片主体
  const card = (
    <div className="border rounded-lg p-6 hover:shadow-lg transition bg-white">
      <h3 className="text-xl font-semibold">{template.name}</h3>
      <p className="text-gray-600 mt-2">{template.description}</p>
      <div className="mt-4">
        {template.rules.map((rule, i) => (
          <span
            key={i}
            className="inline-block bg-gray-100 px-2 py-1 rounded mr-2 text-sm"
          >
            {rule.label}
          </span>
        ))}
      </div>
    </div>
  );

  // 根据 disableLink 决定是否包 <Link>
  if (disableLink) {
    return card;
  } else {
    return (
      <Link href={`/smart-template/apply?id=${template.id}`}>
        {card}
      </Link>
    );
  }
}
