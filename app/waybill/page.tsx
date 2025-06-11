// page.tsx
'use client';
import StatusSwitcher from '@/components/StatusSwitcher';
import { useState, useEffect } from 'react';
import ShipmentTable from '@/components/ShipmentTable';
import MultiStepShipmentForm from '@/components/MultiStepShipmentForm';
import FilterPanel from '@/components/FilterPanel';
import ShipmentDrawer from '@/components/ShipmentDrawer';
import ShipmentEditForm from '@/components/ShipmentEditForm';
import ExcelImportPanel from '@/components/ExcelImportPanel';
import FieldMatchManager from '@/components/FieldMatchManager'; // 替换为 FieldMatchManager
import FieldMatchEditor from '@/components/FieldMatchEditor';
import ExcelFieldMapper from '@/components/ExcelFieldMapper';
import ShipmentPreviewConfirm from '@/components/ShipmentPreviewConfirm';
import UploadLabelForm from '@/components/UploadLabelForm';
import { Package, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { Filters } from '@/types/filters';
import { Shipment } from '@/types/shipment';
import { parseExcel, parseCellKey } from '@/utils/parseExcelGeneric';
import { cleanImportRecord } from '@/utils/cleanImportRecord';
import * as XLSX from 'xlsx';

type TemplateMode = 'grid' | 'directional' | 'fixed';

type FieldAreaBinding = {
  field: string;
  from: string;
  direction: 'horizontal' | 'vertical';
  length: number;
};

interface TemplateInfo {
  id: string;
  name: string;
  mode: TemplateMode;
  type: 'FBA' | '传统';
  startRow: number;
  bindings?: string | FieldAreaBinding[];
  columns?: string[];
  filePath?: string;
}

type Activity = {
  timestamp: string;
  message: string;
};

type SystemMessage = {
  title: string;
  content: string;
};

interface WaybillResponse {
  success: boolean;
  data: Shipment[];
  total: number;
  error?: string;
}

interface Channel {
  id: string;
  name: string;
}

export default function WaybillPage() {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [showFieldMatch, setShowFieldMatch] = useState(false);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [showFieldMapper, setShowFieldMapper] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateInfo | undefined>(undefined);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(30);
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [filters, setFilters] = useState<Filters>({
    status: '',
    country: '',
    channel: '',
    waybillNumber: '',
    client: '',
    date: '',
    trackingNumber: '',
    recipient: '',
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [previewRecords, setPreviewRecords] = useState<Record<string, any>[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [isBatch, setIsBatch] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);
  const [previewRecord, setPreviewRecord] = useState<Record<string, any> | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState('');

  const statusButtons = [
    { label: '全部', status: '全部' },
    { label: '已下单', status: '已下单' },
    { label: '已收货', status: '已收货' },
    { label: '转运中', status: '转运中' },
    { label: '已签收', status: '已签收' },
    { label: '已取消', status: '已取消' },
    { label: '退件', status: '退件' },
  ];

  // 获取渠道列表
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/channels');
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        console.log('Channels API response:', data);
        if (data.success && Array.isArray(data.data)) {
          setChannels(data.data);
        } else {
          console.error('❌ 获取渠道失败:', data.error || '数据格式错误');
          setChannels([]); // 确保 channels 始终为数组
        }
      } catch (err) {
        console.error('❌ 获取渠道失败:', err);
        setChannels([]); // 确保 channels 始终为数组
      }
    };
    fetchChannels();
  }, []);

  const fetchWaybills = async () => {
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        type: 'FBA',
        ...filters,
      });
      const res = await fetch(`http://localhost:4000/api/waybills?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setShipments(
          data.data.map((item: any) => ({
            ...item,
            id: item.id || '',
            type: item.type || 'FBA',
            weight: Number(item.weight) || 0,
            volume: item.volume ? Number(item.volume) : undefined,
            volumetricWeight: item.volumetricWeight ? Number(item.volumetricWeight) : undefined,
            chargeWeight: item.chargeWeight ? Number(item.chargeWeight) : undefined,
            realWeight: item.realWeight ? Number(item.realWeight) : undefined,
            volWeight: item.volWeight ? Number(item.volWeight) : undefined,
            ratio: item.ratio ? Number(item.ratio) : undefined,
            length: item.length ? Number(item.length) : undefined,
            width: item.width ? Number(item.width) : undefined,
            height: item.height ? Number(item.height) : undefined,
            totalValue: item.totalValue ? Number(item.totalValue) : undefined,
            channel: item.channel
              ? typeof item.channel === 'string'
                ? { id: item.channel, name: item.channel, currency: item.currency || 'USD' }
                : {
                    id: item.channel.id || '',
                    name: item.channel.name || '',
                    currency: item.channel.currency || 'USD',
                    type: item.channel.type || '',
                    country: item.channel.country,
                    warehouse: item.channel.warehouse,
                    origin: item.channel.origin,
                    createdAt: item.channel.createdAt,
                    volRatio: item.channel.volRatio ? Number(item.volRatio) : undefined,
                    cubeRatio: item.channel.cubeRatio ? Number(item.cubeRatio) : undefined,
                    splitRatio: item.channel.splitRatio ? Number(item.splitRatio) : undefined,
                    minCharge: item.channel.minCharge ? Number(item.minCharge) : undefined,
                    chargeMethod: item.channel.chargeMethod,
                  }
              : undefined,
            boxes:
              item.boxes?.map((box: any) => ({
                id: box.id || '',
                code: box.code || '',
                fullCode: box.fullCode || box.code || '',
                ref: box.ref,
                clientData: box.clientData,
                pickData: box.pickData,
                declareValue:
                  box.declareValue !== undefined && box.declareValue !== null
                    ? Number(box.declareValue)
                    : undefined,
                carrier: box.carrier,
                subTopic: box.subTopic,
                weight: box.weight ? Number(box.weight) : 0,
                length: box.length ? Number(box.length) : 0,
                width: box.width ? Number(box.width) : 0,
                height: box.height ? Number(box.height) : 0,
                hasBattery: box.hasBattery !== undefined ? !!box.hasBattery : false,
              })) || [],
            logs:
              item.logs?.map((log: any) => ({
                id: log.id || '',
                status: log.status || '',
                remark: log.remark || '',
                timestamp: log.timestamp || '',
              })) || [],
            attachments: item.attachments || [],
            sender: item.sender
              ? {
                  id: item.sender.id || '',
                  name: item.sender.name || '',
                  email: item.sender.email,
                  phone: item.sender.phone,
                  address: item.sender.address,
                }
              : undefined,
            recipient: item.recipient || '',
            country: item.country || '',
            quantity: item.quantity ? Number(item.quantity) : 0,
            status: item.status || '',
          })),
        );
        setTotal(data.total);
      } else {
        alert('获取运单失败：' + (data.error || '未知错误'));
      }
    } catch (error) {
      console.error('获取运单失败:', error);
      alert('获取运单失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  useEffect(() => {
    fetchWaybills();
  }, [selectedStatus, currentPage, filters]);

  const fetchStatusCounts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/waybills/stats?type=FBA');
      const data = await res.json();
      if (data.success) {
        setStatusCounts(data.data);
      }
    } catch (error) {
      console.error('获取状态统计失败:', error);
    }
  };

  useEffect(() => {
    fetchStatusCounts();
    setRecentActivities([
      { timestamp: '2025-03-17 20:14:54', message: '运单 663459 已签收' },
      { timestamp: '2025-03-16 15:30:22', message: '运单 663460 进入运输中' },
      { timestamp: '2025-03-15 09:12:45', message: '运单 663461 已取消' },
    ]);
    setSystemMessages([
      { title: '系统更新通知', content: '2025-03-10: 新增批量操作功能' },
      { title: '维护公告', content: '2025-03-12: 系统将于凌晨2:00-3:00进行维护' },
    ]);
  }, []);

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      status: status === '全部' ? '' : status,
    }));
  };

  const handleCreateShipment = (formData: Record<string, any>) => {
    alert('运单创建成功！');
    fetchWaybills();
    fetchStatusCounts();
    setShowCreatePanel(false);
    setFormData({});
  };

  const handleUploadLabel = async (data: Record<string, any>) => {
    // 拆分收货地址：第一行为收件人，剩下的为地址字段
    const addressLines = data.收货地址?.split('\n') || [];
    const recipient = addressLines[0] || '';
    const [address1, address2 = '', address3 = ''] = addressLines.slice(1);

    // 更新表单数据
    setFormData({
      recipient,
      address1,
      address2,
      address3,
      country: data.收货国家 || '',
      warehouse: data.发货地址 || '',
      boxCount: parseInt(data.箱数) || 1,
      channel: data.channelId || selectedChannel,
      type: 'FBA',
    });

    // 打开创建运单面板
    setShowCreatePanel(true);
  };

  const handleExcelImportShipment = async (
    file: File,
    templateName: string,
    isBatchImport: boolean,
  ) => {
    try {
      if (file.size > 10 * 1024 * 1024) {
        alert('文件过大，请上传小于10MB的文件');
        return;
      }

      const templates = JSON.parse(
        localStorage.getItem('excelTemplates') || '[]',
      ) as TemplateInfo[];
      const selectedTemplate = templates.find((t) => t.name === templateName);
      if (!selectedTemplate) {
        alert('未找到模板');
        return;
      }
      if (selectedTemplate.type !== 'FBA') {
        alert('请选择 FBA 模板');
        return;
      }

      setSelectedTemplate(selectedTemplate);
      setIsBatch(isBatchImport);

      const { cells, rows, headers } = await parseExcel(file);
      let records: Record<string, any>[] = [];

      if (selectedTemplate.mode === 'grid' || selectedTemplate.mode === 'directional') {
        const fieldBindings = selectedTemplate.bindings || [];
        records = [];

        let maxRecords = 0;
        for (const binding of fieldBindings) {
          maxRecords = Math.max(maxRecords, binding.length);
        }

        for (let i = 0; i < maxRecords; i++) {
          records[i] = { type: 'FBA' };
        }

        for (const binding of fieldBindings) {
          const { field, from, direction, length } = binding;
          const { colIndex, rowIndex } = parseCellKey(from);

          for (let i = 0; i < length; i++) {
            const targetRow = direction === 'vertical' ? rowIndex + i : rowIndex;
            const targetCol = direction === 'horizontal' ? colIndex + i : colIndex;
            const cellKey = `${String.fromCharCode(65 + targetCol)}${targetRow + 1}`;
            const value = cells[cellKey];
            const recordIndex = i;

            if (recordIndex >= maxRecords) continue;

            records[recordIndex] = records[recordIndex] || { type: 'FBA' };
            records[recordIndex][field] = value;
          }
        }
      } else if (selectedTemplate.mode === 'fixed') {
        const { startRow, columns } = selectedTemplate;
        records = [];

        for (let i = startRow - 1; i < rows.length; i++) {
          const row = rows[i] || [];
          const record: Record<string, any> = {};
          columns!.forEach((field, colIndex) => {
            if (!field) return;
            const value = row[colIndex];
            record[field] = value;
          });
          record.type = 'FBA';
          if (Object.keys(record).length > 1) {
            records.push(record);
          }
        }
      }

      const cleanedRecords = records.map(cleanImportRecord);
      if (
        cleanedRecords.some(
          (record) =>
            record.weight < 0 || record.length < 0 || record.width < 0 || record.height < 0,
        )
      ) {
        alert('重量或尺寸不能为负数');
        return;
      }

      if (!isBatchImport) {
        setPreviewRecord(cleanedRecords[0]);
      } else {
        setPreviewRecords(cleanedRecords);
        setPreviewColumns(headers);
        setShowFieldMapper(true);
      }
    } catch (err) {
      alert('解析失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleFieldMappingConfirm = async (mapping: Record<string, string>) => {
    try {
      const mappedRecords = previewRecords.map((record) => {
        const mapped: Record<string, any> = { type: record.type };
        Object.keys(record).forEach((key) => {
          if (mapping[key]) {
            mapped[mapping[key]] = record[key];
          } else if (key !== 'type') {
            mapped[key] = record[key];
          }
        });
        return cleanImportRecord(mapped);
      });

      const url = 'http://localhost:4000/api/waybills/batch';
      const body = { shipments: mappedRecords };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (result.success) {
        alert('导入成功！');
        fetchWaybills();
        fetchStatusCounts();
        setShowFieldMapper(false);
        setPreviewRecords([]);
        setPreviewColumns([]);
      } else {
        alert('导入失败：' + result.error);
      }
    } catch (err) {
      alert('导入失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    fetchWaybills();
    fetchStatusCounts();
  };

  const handleClose = () => {
    setSelectedShipment(null);
    setIsDrawerOpen(false);
  };

  const handleEditClose = () => {
    setIsEditing(false);
  };

  const handleTemplateSave = (template: TemplateInfo) => {
    const templates = JSON.parse(localStorage.getItem('excelTemplates') || '[]') as TemplateInfo[];
    const updated = templates.filter((t) => t.id !== template.id);
    updated.push(template);
    localStorage.setItem('excelTemplates', JSON.stringify(updated));
    setShowFieldEditor(false);
    setEditingTemplate(undefined);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="info-card p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">总运单数</p>
            <p className="text-2xl font-semibold text-gray-800">{statusCounts['全部'] || 0}</p>
          </div>
          <Package className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="info-card p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">已签收</p>
            <p className="text-2xl font-semibold text-gray-800">{statusCounts['已签收'] || 0}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div className="info-card p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">运输中</p>
            <p className="text-2xl font-semibold text-gray-800">{statusCounts['转运中'] || 0}</p>
          </div>
          <Truck className="w-8 h-8 text-blue-600" />
        </div>
        <div className="info-card p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">异常件数</p>
            <p className="text-2xl font-semibold text-gray-800">
              {(statusCounts['已取消'] || 0) + (statusCounts['退件'] || 0)}
            </p>
          </div>
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
      </div>
      <FilterPanel onFilterChange={handleFilterChange} />
      <section className="glass rounded-3xl shadow-xl p-8 mb-8">
        <div className="relative w-full overflow-hidden">
          <StatusSwitcher
            statusButtons={statusButtons.map((btn) => ({
              ...btn,
              label: `${btn.label} (${statusCounts[btn.status] || 0})`,
            }))}
            selectedStatus={selectedStatus}
            onChange={handleStatusClick}
            buttonClassName="text-sm font-medium px-4 py-2 text-gray-600 hover:text-[#ff8a00] focus:outline-none focus:ring-0"
            activeClassName="text-[#5b3d00] font-bold bg-transparent focus:outline-none focus:ring-0"
          />
        </div>
        <div className="flex flex-wrap gap-4 mt-6">
          <button className="btn-create" onClick={() => setShowCreatePanel(true)}>
            创建运单
          </button>
          <button className="btn-create" onClick={() => setShowExcelImport(true)}>
            Excel导入
          </button>
          <button className="btn-create" onClick={() => setShowBatchImport(true)}>
            Excel批量导入
          </button>
          <button className="btn-create" onClick={() => setShowFieldMatch(true)}>
            录入表匹配
          </button>
          <div className="flex items-center gap-4">
            <label className="block text-sm font-medium text-gray-700">选择渠道</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">请选择渠道</option>
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
            <UploadLabelForm
              channelId={selectedChannel}
              channels={channels}
              onChangeChannelId={setSelectedChannel}
              onUpload={handleUploadLabel}
            />
          </div>
        </div>
      </section>
      <ShipmentTable
        data={shipments}
        currentPage={currentPage}
        total={total}
        onPageChange={setCurrentPage}
        onSelectShipment={(shipment) => {
          console.log('🟠 被点击的 shipment:', shipment);
          setSelectedShipment(shipment);
          setIsDrawerOpen(true);
        }}
        onEdit={(shipment) => {
          setSelectedShipment(shipment);
          setIsEditing(true);
        }}
        statusCounts={statusCounts}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
      />
      <section className="glass rounded-3xl shadow-xl p-8 mb-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 font-medium">共 {total} 条数据</div>
          <div className="flex items-center space-x-4">
            <button
              className="border border-gray-300 text-gray-500 px-6 py-3 rounded-xl hover:bg-gray-100 transition transform hover-glow whitespace-nowrap shadow-md"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            <span className="bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-xl text-sm shadow-md">
              {currentPage}
            </span>
            <button
              className="border border-gray-300 text-gray-500 px-6 py-3 rounded-xl hover:bg-gray-100 transition transform hover-glow whitespace-nowrap shadow-md"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(total / limit)}
            >
              下一页
            </button>
            <select className="border-none rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-md">
              <option>30 条/页</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600 font-medium">
          已选择 <span id="selectedCount">{selectedRows.length}</span> 条运单
        </div>
      </section>
      <section className="glass rounded-3xl shadow-xl p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">最近活动</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
              <i className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-700">{activity.timestamp}</p>
                <p className="text-sm text-gray-500">{activity.message}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="glass rounded-3xl shadow-xl p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">系统消息</h2>
        <div className="space-y-4">
          {systemMessages.map((msg, index) => (
            <div key={index} className="flex items-center gap-4">
              <i className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-700">{msg.title}</p>
                <p className="text-sm text-gray-500">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <MultiStepShipmentForm
        isOpen={showCreatePanel}
        onClose={() => {
          setShowCreatePanel(false);
          setFormData({});
        }}
        onSubmit={handleCreateShipment}
        initialData={formData}
      />
      {(selectedShipment || isEditing) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
          onClick={handleClose}
        />
      )}
      {selectedShipment && isDrawerOpen && (
        <ShipmentDrawer
          shipment={selectedShipment}
          onClose={handleClose}
          onEdit={() => setIsEditing(true)}
        />
      )}
      {isEditing && selectedShipment && (
        <div className="fixed top-0 right-0 h-full w-[70vw] bg-white shadow-2xl z-[999] overflow-y-auto transition-transform duration-300 ease-in-out">
          <ShipmentEditForm
            shipment={selectedShipment}
            onCancel={handleEditClose}
            onSuccess={handleEditSuccess}
          />
        </div>
      )}
      <ExcelImportPanel
        isOpen={showExcelImport}
        onClose={() => setShowExcelImport(false)}
        onUpload={(file, templateName) => {
          handleExcelImportShipment(file, templateName, false);
          setShowExcelImport(false);
        }}
        title="Excel 导入单个运单"
      />
      <ExcelImportPanel
        isOpen={showBatchImport}
        onClose={() => setShowBatchImport(false)}
        onUpload={(file, templateName) => {
          handleExcelImportShipment(file, templateName, true);
          setShowBatchImport(false);
        }}
        title="Excel 批量导入运单"
      />
      {showFieldMatch && (
        <FieldMatchManager
          onEdit={(template) => {
            setEditingTemplate(template);
            setShowFieldMatch(false);
            setShowFieldEditor(true);
          }}
          onClose={() => setShowFieldMatch(false)}
        />
      )}
      {showFieldEditor && (
        <FieldMatchEditor
          template={editingTemplate}
          onSave={handleTemplateSave}
          onCancel={() => {
            setShowFieldEditor(false);
            setEditingTemplate(undefined);
          }}
        />
      )}
      {showFieldMapper && (
        <ExcelFieldMapper
          columns={previewColumns}
          onConfirm={handleFieldMappingConfirm}
          onCancel={() => {
            setShowFieldMapper(false);
            setPreviewRecords([]);
            setPreviewColumns([]);
          }}
        />
      )}
      {previewRecord && (
        <ShipmentPreviewConfirm
          data={previewRecord}
          onConfirm={async () => {
            try {
              const res = await fetch('http://localhost:4000/api/waybills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(previewRecord),
              });
              const result = await res.json();
              if (result.success) {
                alert('导入成功！');
                fetchWaybills();
                fetchStatusCounts();
              } else {
                alert('导入失败：' + result.error);
              }
            } catch (err) {
              alert('导入失败：' + (err instanceof Error ? err.message : '未知错误'));
            }
            setPreviewRecord(null);
          }}
          onCancel={() => setPreviewRecord(null)}
        />
      )}
    </>
  );
}
