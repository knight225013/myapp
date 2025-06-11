'use client';
import { TemplateSelector } from './TemplateSelector'; // 复用现有选择器
import { templates } from './rule-templates/index'; // 引入模板数据

export default function TemplateCenterBody() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">附加费模板</h3>
      <TemplateSelector templates={templates} /> {/* 渲染模板卡片 */}
    </div>
  );
}
