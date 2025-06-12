'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ChannelTable from '@/components/channel/ChannelTable';
import ChannelForm from '@/components/channel/ChannelForm';
import ChannelEstimateTable from '@/components/channel/ChannelEstimateTable';
import ExcelImportExport from '@/components/smart-template/ExcelImportExport';
import LabelTemplateEditor from '@/components/smart-template/LabelTemplateEditor';
import * as XLSX from 'xlsx';
import type { Channel, Rate } from '@/types/shipment';
import type { FeeRule } from '@/components/smart-template/fee-rules/types';
import type { ExtraFeeRule } from '@/components/ExtraFeeRule/types';

interface ChannelResponse {
  success: boolean;
  data: Channel[];
}

interface Estimate {
  channelId: string;
  channelName: string;
  currency: string;
  chargeWeight: number;
  base: number;
  tax: number;
  extraFee: number;
  otherFee: number;
  total: number;
}

export default function ChannelPage() {
  const [showChannelCreate, setShowChannelCreate] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);  const [showLabelEditor, setShowLabelEditor] = useState(false);
  const [templateChannelId, setTemplateChannelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels', { cache: 'no-store' });
      if (!res.ok) throw new Error('获取渠道失败');
      const data: ChannelResponse = await res.json();
      if (!data.success) throw new Error('获取渠道数据失败');
      setChannels(data.data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(`获取渠道失败: ${message}`);
      console.error('获取渠道失败:', message);
    }
  };

  const handleExcelImport = async (file: File) => {
    try {
      if (file.size > 10 * 1024 * 1024) {
        setError('文件过大，请上传小于10MB的文件');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            setError('无法读取文件内容');
            return;
          }
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);

          const res = await fetch('/api/channels/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: new Uint8Array(data as ArrayBuffer) }),
          });
          const result = await res.json();
          if (!result.success) {
            setError(`导入失败: ${result.error || '未知错误'}`);
            return;
          }
          setError(null);
          fetchChannels();
        } catch (err) {
          const message = err instanceof Error ? err.message : '未知错误';
          setError(`文件处理失败: ${message}`);
        }
      };
      reader.onerror = () => {
        setError('读取文件失败');
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(`导入失败: ${message}`);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleClose = () => {
    setSelectedChannel(null);
    setShowChannelCreate(false);
  };

  return (
    <>
      <div className="glass rounded-3xl shadow-xl p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">渠道管理</h2>
          <div className="flex gap-4">
            <Link href="/channels/price-maintenance" className="text-blue-500 hover:underline">
              运价维护
            </Link>
            <ExcelImportExport onImport={handleExcelImport} />
          </div>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <ChannelTable
          channels={channels}
          onSelectChannel={(channel) => {
            setSelectedChannel(channel as Channel);
            setShowChannelCreate(true);
          }}
          onCreateTemplate={(channelId) => {
            setTemplateChannelId(channelId);
            setShowLabelEditor(true);
          }}
        />
      </div>
      {showChannelCreate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
          onClick={handleClose}
        />
      )}
      <ChannelForm
        isOpen={showChannelCreate}
        onClose={handleClose}
        initialData={selectedChannel ? {
          id: selectedChannel.id,
          name: selectedChannel.name,
          code: selectedChannel.code || '',
          type: selectedChannel.type,
          country: selectedChannel.country,
          warehouse: selectedChannel.warehouse,
          origin: selectedChannel.origin,
          currency: selectedChannel.currency,
          decimal: selectedChannel.decimal,
          method: selectedChannel.method,
          rounding: selectedChannel.rounding,
          compareMode: selectedChannel.compareMode,
          volRatio: selectedChannel.volRatio,
          cubeRatio: selectedChannel.cubeRatio,
          splitRatio: selectedChannel.splitRatio,
          chargeMethod: selectedChannel.chargeMethod,
          minCharge: selectedChannel.minCharge,
          ticketPrecision: selectedChannel.ticketPrecision,
          boxPrecision: selectedChannel.boxPrecision,
          sizePrecision: selectedChannel.sizePrecision,
          minPieces: selectedChannel.minPieces,
          maxPieces: selectedChannel.maxPieces,
          minBoxRealWeight: selectedChannel.minBoxRealWeight,
          minBoxMaterialWeight: selectedChannel.minBoxMaterialWeight,
          minBoxChargeWeight: selectedChannel.minBoxChargeWeight,
          minBoxAvgWeight: selectedChannel.minBoxAvgWeight,
          minTicketChargeWeight: selectedChannel.minTicketChargeWeight,
          maxTicketChargeWeight: selectedChannel.maxTicketChargeWeight,
          minTicketRealWeight: selectedChannel.minTicketRealWeight,
          maxTicketRealWeight: selectedChannel.maxTicketRealWeight,
          minBoxRealWeightLimit: selectedChannel.minBoxRealWeightLimit,
          maxBoxRealWeight: selectedChannel.maxBoxRealWeight,
          minBoxChargeWeightLimit: selectedChannel.minBoxChargeWeightLimit,
          maxBoxChargeWeight: selectedChannel.maxBoxChargeWeight,
          minDeclareValue: selectedChannel.minDeclareValue,
          maxDeclareValue: selectedChannel.maxDeclareValue,
          aging: selectedChannel.aging,
          waybillRule: selectedChannel.waybillRule,
          labelCode: selectedChannel.labelCode,
          assignedUser: selectedChannel.assignedUser,
          userLevel: selectedChannel.userLevel,
          declareCurrency: selectedChannel.declareCurrency,
          defaultDeclareCurrency: selectedChannel.defaultDeclareCurrency,
          sender: selectedChannel.sender,
          showWeight: selectedChannel.showWeight || false,
          showSize: selectedChannel.showSize || false,
          requireWeight: selectedChannel.requireWeight || false,
          requireSize: selectedChannel.requireSize || false,
          requirePhone: selectedChannel.requirePhone || false,
          requireEmail: selectedChannel.requireEmail || false,
          requirePackingList: selectedChannel.requirePackingList || false,
          verifySalesLink: selectedChannel.verifySalesLink || false,
          verifyImageLink: selectedChannel.verifyImageLink || false,
          requireVAT: selectedChannel.requireVAT || false,
          requireVATFiling: selectedChannel.requireVATFiling || false,
          requireEORI: selectedChannel.requireEORI || false,
          enableBilling: selectedChannel.enableBilling || false,
          showBilling: selectedChannel.showBilling || false,
          controlBilling: selectedChannel.controlBilling || false,
          controlReceivingFee: selectedChannel.controlReceivingFee || false,
          promptUnderpayment: selectedChannel.promptUnderpayment || false,
          modifyVolRatio: selectedChannel.modifyVolRatio || false,
          showSupplierData: selectedChannel.showSupplierData || false,
          orderBySKULibrary: selectedChannel.orderBySKULibrary || false,
          allowCancel: selectedChannel.allowCancel || false,
          noAutoCancelAPIFail: selectedChannel.noAutoCancelAPIFail || false,
          allowChannelChange: selectedChannel.allowChannelChange || false,
          allowEdit: selectedChannel.allowEdit || false,
          allowTrackingEntry: selectedChannel.allowTrackingEntry || false,
          allowLabelUpload: selectedChannel.allowLabelUpload || false,
          hideCarrier: selectedChannel.hideCarrier || false,
          refundOnReturn: selectedChannel.refundOnReturn || false,
          noRefundOnCancel: selectedChannel.noRefundOnCancel || false,
          showInWMS: selectedChannel.showInWMS || false,
          enableCOD: selectedChannel.enableCOD || false,
          restrictWarehouseCode: selectedChannel.restrictWarehouseCode || false,
          roundBeforeSplit: selectedChannel.roundBeforeSplit || false,
          feeRules: (selectedChannel.extraFeeRules || []).map((rule: ExtraFeeRule): FeeRule => ({
            id: rule.id,
            module: 'extra',
            type: rule.feeType,
            name: rule.name,
            params: {
              price: rule.value,
              chargeUnit: rule.feeType === 'perKg' ? 'kg' : 'box',
              field: 'weight',
              label: rule.name
            },
            currency: rule.currency
          })),
          rates: selectedChannel.rates || []
        } : undefined}
        onSubmitSuccess={() => {
          handleClose();
          fetchChannels();
        }}
      />
      {showLabelEditor && (
        <LabelTemplateEditor
          isOpen={true}
          onClose={() => {
            setShowLabelEditor(false);
            setTemplateChannelId(null);
          }}
          onSubmitSuccess={() => {
            setShowLabelEditor(false);
            setTemplateChannelId(null);
            fetchChannels();
          }}
          initialData={{
            name: '',
            content: '<div>{{waybillNumber}}</div>',
            width: 100,
            height: 50
          }}
        />
      )}
      {selectedChannel && (
        <button
          className="fixed bottom-6 right-[74vw] bg-red-500 text-white px-4 py-2 rounded z-[1000]"
          onClick={async () => {
            if (!confirm('确定要删除该渠道吗？')) return;
            try {
              const res = await fetch(`/api/channels/${selectedChannel.id}`, {
                method: 'DELETE',
              });
              const result = await res.json();
              if (!result.success) {
                setError(`删除失败: ${result.error || '未知错误'}`);
                return;
              }
              setError(null);
              handleClose();
              fetchChannels();
            } catch (err) {
              const message = err instanceof Error ? err.message : '未知错误';
              setError(`删除失败: ${message}`);
            }
          }}
        >
          删除
        </button>
      )}
    </>
  );
}
