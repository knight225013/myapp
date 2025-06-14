'use client';

import { useState } from 'react';
import { Upload, File, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface BillAttachmentsProps {
  billId: string;
  attachments: Array<{
    id: string;
    url: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
  }>;
  onAttachmentUploaded: () => void;
}

export default function BillAttachments({ 
  billId, 
  attachments, 
  onAttachmentUploaded 
}: BillAttachmentsProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/finance/bills/${billId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onAttachmentUploaded();
      } else {
        alert('上传失败: ' + data.error);
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">附件管理</h3>
        
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <div className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? '上传中...' : '上传附件'}
          </div>
        </label>
      </div>

      {attachments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>暂无附件</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {attachment.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.fileSize)} • {' '}
                    {format(new Date(attachment.createdAt), 'yyyy-MM-dd HH:mm')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(attachment.url, '_blank')}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="下载"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 