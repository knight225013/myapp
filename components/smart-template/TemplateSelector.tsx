import { templates } from './rule-templates/index';
import { Template } from './rule-templates/types';
import { TemplatePreviewCard } from './TemplatePreviewCard';

export function TemplateSelector({ templates }: { templates: Template[] }) {
  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <div className="grid gap-8">
      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-2xl font-semibold mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates
              .filter((t) => t.category === category)
              .map((template) => (
                <TemplatePreviewCard key={template.id} template={template} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
