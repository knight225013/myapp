import { TemplateSelector } from '@/components/smart-template/TemplateSelector';
import { templates } from '@/components/smart-template/rule-templates/index';

export default function TemplateCenter() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">模板中心</h1>
      <TemplateSelector templates={templates} />
    </div>
  );
}
