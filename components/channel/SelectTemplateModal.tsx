'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import TemplateCenterBody from '../smart-template/TemplateCenterBody'; // 引入模板选择页面
import ExtraFeeBadgeList from './ExtraFeeBadgeList'; // 引入已选规则展示
import { useTemplateDraftStore } from '../smart-template/rule-templates/hooks/useTemplateDraftStore';

interface SelectTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SelectTemplateModal({ isOpen, onClose }: SelectTemplateModalProps) {
  const { clearRules } = useTemplateDraftStore(); // 获取清空规则方法

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex justify-center items-center">
      <div className="bg-white w-[80vw] max-h-[80vh] rounded-lg p-6 overflow-y-auto">
        {/* 标题和关闭按钮 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">选择附加费模板</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              clearRules(); // 关闭时清空临时规则
              onClose();
            }}
          >
            ✕
          </button>
        </div>
        {/* 显示已选规则 */}
        <ExtraFeeBadgeList />
        {/* 模板选择区域 */}
        <TemplateCenterBody />
        {/* 操作按钮 */}
        <div className="flex gap-4 mt-6">
          <button
            className="bg-indigo-600 text-white px-6 py-3 rounded"
            onClick={() => {
              onClose(); // 确认后关闭弹窗，保留规则供 ChannelForm 使用
            }}
          >
            确认添加
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded"
            onClick={() => {
              clearRules(); // 取消时清空规则
              onClose();
            }}
          >
            取消
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
