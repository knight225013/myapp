'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Input from '../ui/Input';
import TrackingTimeline from './TrackingTimeline';
import { Shipment, Box } from '../../types/shipment';

export const ActionBtn = ({
  children,
  ...props
}: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className="gradient-btn px-4 py-2 text-sm shadow-md hover:scale-105 transition"
    {...props}
  >
    {children}
  </button>
);

export default function ShipmentDrawer({
  shipment,
  onClose,
  onEdit,
}: {
  shipment: Shipment;
  onClose: () => void;
  onEdit: () => void;
}) {
  console.log('📦 渲染 ShipmentDrawer，shipment 是：', shipment);
  console.log('🆔 shipment.id 是：', shipment?.id);
  const [currentShipment, setCurrentShipment] = useState<Shipment>(shipment);
  const [isOpen, setIsOpen] = useState(true);
  const [editingBox, setEditingBox] = useState<Box | null>(null);
  const [newLog, setNewLog] = useState({ status: '', remark: '' });
  const [showAddLog, setShowAddLog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusOptions = ['已下单', '已收货', '转运中', '已签收', '退件', '已取消'];

  const calcChargeWeight = (shipment: Shipment) => {
    const totalWeight = shipment.boxes?.reduce((sum, b) => sum + (b.weight || 0), 0) || 0;
    const totalVolume =
      shipment.boxes?.reduce(
        (sum, b) => sum + ((b.length || 0) * (b.width || 0) * (b.height || 0)) / 1000000,
        0,
      ) || 0;
    const volRatio = shipment.channel?.volRatio || 6000;
    const volumetricWeight = (totalVolume * 1000000) / volRatio;
    const chargeWeight = Math.max(totalWeight, volumetricWeight);
    return { totalWeight, totalVolume, volumetricWeight, chargeWeight };
  };

  const refreshShipment = async () => {
    console.log('🧪 refreshShipment called');
    try {
      const [waybillRes, summaryRes] = await Promise.all([
        fetch(`http://localhost:4000/api/waybills/${shipment.id}`, { cache: 'no-store' }),
        fetch(`http://localhost:4000/api/waybills/${shipment.id}/summary`, { cache: 'no-store' }),
      ]);
      const waybillData = await waybillRes.json();
      console.log('✅ waybillData raw:', waybillData);
      const summaryData = await summaryRes.json();
      if (waybillData.success && summaryData.success) {
        console.log('🚚 运单费用字段', {
          freightCost: waybillData.data.freightCost,
          extraFee: waybillData.data.extraFee,
          currency: waybillData.data.currency,
        });
        setCurrentShipment({
          ...waybillData.data,
          weight: parseFloat(waybillData.data.weight) || 0,
          volume: parseFloat(summaryData.data.volume) || 0,
          volumetricWeight: parseFloat(summaryData.data.volumetricWeight) || 0,
          chargeWeight: parseFloat(summaryData.data.chargeWeight) || 0,
          freightCost: Number(waybillData.data.freightCost) || 0,
          extraFee: Number(waybillData.data.extraFee) || 0,
          boxes: waybillData.data.boxes?.map((box: any) => ({
            ...box,
            weight: parseFloat(box.weight) || 0,
            length: parseFloat(box.length) || 0,
            width: parseFloat(box.width) || 0,
            height: parseFloat(box.height) || 0,
            declareValue: parseFloat(box.declareValue) || 0,
            hasBattery: box.hasBattery || false,
          })),
          channel: waybillData.data.channel,
          carrier: waybillData.data.carrier,
          attachments: waybillData.data.attachments || [],
          currency: waybillData.data.currency || summaryData.data.currency || 'CNY',
        });
      }
    } catch (error) {
      console.error('刷新数据失败:', error);
    }
  };

  useEffect(() => {
    refreshShipment();
  }, [shipment.id]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleTransitionEnd = () => {
    if (!isOpen) {
      onClose();
    }
  };

  const handleSaveBox = async () => {
    if (!editingBox) return;

    try {
      const res = await fetch(`http://localhost:4000/api/boxes/${editingBox.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: editingBox.weight,
          length: editingBox.length,
          width: editingBox.width,
          height: editingBox.height,
          hasBattery: editingBox.hasBattery,
          declareValue: editingBox.declareValue,
        }),
      });

      const result = await res.json();
      if (result.success) {
        await refreshShipment();
        setEditingBox(null);
      } else {
        alert('保存失败：' + result.error);
      }
    } catch (error) {
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleAddLog = async () => {
    if (!newLog.status) {
      alert('状态为必填项');
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/waybills/${shipment.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      const result = await res.json();
      if (result.success) {
        setNewLog({ status: '', remark: '' });
        setShowAddLog(false);
        refreshShipment();
      } else {
        alert('添加轨迹失败：' + result.error);
      }
    } catch (error) {
      alert('添加轨迹失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleRefreshTracking = async () => {
    try {
      if (!currentShipment.trackingNumber || !currentShipment.carrier?.code) {
        alert('❌ 缺少运单号或物流商');
        return;
      }

      const res = await fetch(`http://localhost:4000/api/track/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: currentShipment.trackingNumber,
          carrier: currentShipment.carrier.code,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert('✅ 更新成功');
        await refreshShipment();
      } else {
        alert('❌ 更新失败: ' + result.error);
      }
    } catch (error) {
      alert('❌ 更新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploader', '当前用户'); // 替换为实际用户信息

    try {
      const res = await fetch(`http://localhost:4000/api/waybills/${shipment.id}/attachments`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        alert('✅ 附件上传成功');
        await refreshShipment();
        if (fileInputRef.current) fileInputRef.current.value = ''; // 重置输入
      } else {
        alert('❌ 上传失败: ' + result.error);
      }
    } catch (error) {
      alert('❌ 上传失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setUploading(false);
    }
  };

  const { totalWeight, totalVolume, volumetricWeight, chargeWeight } =
    calcChargeWeight(currentShipment);

  return (
    <div
      className={`fixed right-0 top-0 h-full w-[70vw] bg-gray-50 shadow-2xl z-50 overflow-y-auto transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            运单详情 <span className="gradient-text">#{currentShipment.id}</span>
          </h2>
          <button onClick={handleClose}>
            <X className="w-6 h-6 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <div className="glass p-4 shadow-sm space-y-2">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center">
              <span className="text-gray-500 font-medium">物流商：</span>{' '}
              {currentShipment.carrier?.name || '--'}
              {currentShipment.carrier?.logoUrl && (
                <img
                  src={currentShipment.carrier.logoUrl}
                  alt="Carrier Logo"
                  className="ml-2 w-6 h-6"
                />
              )}
            </div>
            <div>
              <span className="text-gray-500 font-medium">运单号：</span>{' '}
              {currentShipment.trackingNumber || '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">渠道：</span>{' '}
              {currentShipment.channel?.name || '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">国家：</span> {currentShipment.country}
            </div>
            <div>
              <span className="text-gray-500 font-medium">计费重量：</span>{' '}
              {currentShipment.chargeWeight?.toFixed(2) || '--'} kg
            </div>
            <div>
              <span className="text-gray-500 font-medium">状态：</span>{' '}
              <span className="status-label">{currentShipment.status}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">运费：</span>
              {currentShipment.freightCost != null
                ? `${currentShipment.freightCost.toFixed(2)} ${currentShipment.currency || ''}`
                : '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">附加费：</span>
              {currentShipment.extraFee != null
                ? `${currentShipment.extraFee.toFixed(2)} ${currentShipment.currency || ''}`
                : '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">体积比率：</span>{' '}
              {currentShipment.channel?.volRatio?.toFixed(2) || '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">立方比率：</span>{' '}
              {currentShipment.channel?.cubeRatio?.toFixed(2) || '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">拆分比率：</span>{' '}
              {currentShipment.channel?.splitRatio?.toFixed(2) || '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">最低计费：</span>{' '}
              {currentShipment.channel?.minCharge?.toFixed(2) || '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">计费方式：</span>{' '}
              {currentShipment.channel?.chargeMethod || '--'}
            </div>
          </div>
        </div>
        <div className="glass p-4 shadow-sm space-y-2">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <span className="text-gray-500 font-medium">实重：</span> {totalWeight.toFixed(2)} kg
            </div>
            <div>
              <span className="text-gray-500 font-medium">材积重：</span>{' '}
              {volumetricWeight.toFixed(2)} kg
            </div>
            <div>
              <span className="text-gray-500 font-medium">体积：</span> {totalVolume.toFixed(4)} m³
            </div>
            <div>
              <span className="text-gray-500 font-medium">件数：</span> {currentShipment.quantity}
            </div>
          </div>
        </div>
        <div className="glass p-4 shadow-sm space-y-2">
          <h3 className="font-semibold text-gray-800">渠道信息</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-gray-500 font-medium">渠道名称：</span>{' '}
              {currentShipment.channel?.name || '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">计费方式：</span>{' '}
              {currentShipment.channel?.chargeMethod || '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">计重方式：</span>{' '}
              {currentShipment.channel?.volRatio
                ? `材积比 ${currentShipment.channel.volRatio}`
                : '无'}
            </div>
          </div>
        </div>
        <div className="glass p-4 shadow-sm space-y-2">
          <h3 className="font-semibold text-gray-800">渠道计费规则</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              <span className="text-gray-500 font-medium">计费方式：</span>{' '}
              {currentShipment.channel?.chargeMethod || '--'}
            </li>
            <li>
              <span className="text-gray-500 font-medium">材积比：</span>{' '}
              {currentShipment.channel?.volRatio || '--'}
            </li>
            <li>
              <span className="text-gray-500 font-medium">最小运费：</span>{' '}
              {currentShipment.channel?.minCharge ?? '无'}
            </li>
            <li>
              <span className="text-gray-500 font-medium">取整方式：</span>{' '}
              {currentShipment.channel?.rounding ?? '默认'}
            </li>
          </ul>
        </div>
        <div className="glass p-4 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">基础信息</h3>
            <ActionBtn onClick={onEdit}>编辑</ActionBtn>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-gray-500 font-medium">收件人：</span>{' '}
              {currentShipment.recipient}
            </div>
            <div>
              <span className="text-gray-500 font-medium">发件人：</span>{' '}
              {currentShipment.sender?.name || currentShipment.senderName || '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">VAT信息：</span>{' '}
              {currentShipment.vat || '--'}
            </div>
          </div>
        </div>
        <div className="info-card p-4">
          <h3 className="font-semibold text-gray-800 mb-2">货箱信息</h3>
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead className="text-left">
              <tr>
                <th className="p-2">箱号</th>
                <th className="p-2">参考号</th>
                <th className="p-2">客户数据</th>
                <th className="p-2">拣货数据</th>
                <th className="p-2">申报价值</th>
                <th className="p-2">承运</th>
                <th className="p-2">子主题</th>
                <th className="p-2">重量(kg)</th>
                <th className="p-2">尺寸(cm)</th>
                <th className="p-2">带电</th>
                <th className="p-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {currentShipment.boxes?.map((box, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{box.code}</td>
                  <td className="p-2">{box.ref || '--'}</td>
                  <td className="p-2">{box.clientData || '--'}</td>
                  <td className="p-2">{box.pickData || '--'}</td>
                  <td className="p-2">{box.declareValue?.toFixed(2) || '--'}</td>
                  <td className="p-2">{box.carrier || '--'}</td>
                  <td className="p-2">{box.subTopic || '--'}</td>
                  <td className="p-2">{box.weight?.toFixed(2) || '--'}</td>
                  <td className="p-2">
                    {box.length && box.width && box.height
                      ? `${box.length}×${box.width}×${box.height}`
                      : '--'}
                  </td>
                  <td className="p-2">
                    <span className="status-btn">{box.hasBattery ? '是' : '否'}</span>
                  </td>
                  <td className="p-2">
                    <ActionBtn onClick={() => setEditingBox(box)}>编辑</ActionBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="glass p-4 shadow-sm space-y-2">
          <h3 className="font-semibold text-gray-800">申报信息</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <span className="text-gray-500 font-medium">货箱编号：</span>{' '}
              {currentShipment.declareBoxId || '--'}
            </div>
            <div>
              <span className="text-gray-500 font-medium">产品总数：</span>{' '}
              {currentShipment.totalItems || 0}
            </div>
            <div>
              <span className="text-gray-500 font-medium">申报总价值：</span> ¥
              {currentShipment.totalValue || 0}
            </div>
            <div>
              <span className="text-gray-500 font-medium">品名数量：</span>{' '}
              {currentShipment.productKinds || 0}
            </div>
          </div>
        </div>
        <div className="glass p-4 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">物流轨迹</h3>
            <div className="flex gap-4">
              <ActionBtn onClick={() => setShowAddLog(true)}>添加轨迹</ActionBtn>
              <ActionBtn onClick={handleRefreshTracking}>⟳ 刷新物流轨迹</ActionBtn>
            </div>
          </div>
          <TrackingTimeline shipmentId={shipment.id} />
        </div>
        <div className="glass p-4 shadow-sm space-y-2">
          <h3 className="font-semibold text-gray-800">附件上传</h3>
          <div className="flex gap-4 mb-4">
            <label className="relative">
              <ActionBtn as="span" disabled={uploading}>
                {uploading ? '上传中...' : '上传附件'}
              </ActionBtn>
              <input
                type="file"
                ref={fileInputRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleUploadAttachment}
                disabled={uploading}
              />
            </label>
            <ActionBtn className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              上传FBA标签
            </ActionBtn>
            <ActionBtn className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              上传快递标签
            </ActionBtn>
          </div>
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr>
                <th className="p-2">文件名</th>
                <th className="p-2">上传人</th>
                <th className="p-2">上传时间</th>
                <th className="p-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {currentShipment.attachments?.map((file, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{file.name}</td>
                  <td className="p-2">{file.uploader}</td>
                  <td className="p-2">{file.time}</td>
                  <td className="p-2">
                    <ActionBtn>查看</ActionBtn>
                  </td>
                </tr>
              ))}
              {(!currentShipment.attachments || currentShipment.attachments.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-2 text-center text-gray-500">
                    无附件
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editingBox && (
          <div className="fixed right-0 top-0 w-[400px] h-full glass z-50 p-6 shadow-lg overflow-y-auto rounded-l-2xl">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              编辑箱子 <span className="gradient-text">#{editingBox.code}</span>
            </h2>
            <Input
              label="重量 (kg)"
              name="weight"
              type="number"
              value={editingBox.weight || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingBox({ ...editingBox, weight: parseFloat(e.target.value) || 0 })
              }
              step="0.01"
              className="form-input-style"
            />
            <Input
              label="长 (cm)"
              name="length"
              type="number"
              value={editingBox.length || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingBox({ ...editingBox, length: parseFloat(e.target.value) || 0 })
              }
              step="0.01"
              className="form-input-style"
            />
            <Input
              label="宽 (cm)"
              name="width"
              type="number"
              value={editingBox.width || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingBox({ ...editingBox, width: parseFloat(e.target.value) || 0 })
              }
              step="0.01"
              className="form-input-style"
            />
            <Input
              label="高 (cm)"
              name="height"
              type="number"
              value={editingBox.height || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingBox({ ...editingBox, height: parseFloat(e.target.value) || 0 })
              }
              step="0.01"
              className="form-input-style"
            />
            <Input
              label="申报价值"
              name="declareValue"
              type="number"
              value={editingBox.declareValue || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingBox({ ...editingBox, declareValue: parseFloat(e.target.value) || 0 })
              }
              step="0.01"
              className="form-input-style"
            />
            <label className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={editingBox.hasBattery}
                onChange={(e) => setEditingBox({ ...editingBox, hasBattery: e.target.checked })}
              />
              <span className="ml-2 text-sm text-gray-700">是否带电</span>
            </label>
            <div className="mt-6 flex gap-4">
              <ActionBtn onClick={handleSaveBox}>保存</ActionBtn>
              <ActionBtn
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                onClick={() => setEditingBox(null)}
              >
                取消
              </ActionBtn>
            </div>
          </div>
        )}

        {showAddLog && (
          <div className="fixed right-0 top-0 w-[400px] h-full glass z-50 p-6 shadow-lg overflow-y-auto rounded-l-2xl">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">添加物流轨迹</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                name="status"
                value={newLog.status}
                onChange={(e) => setNewLog({ ...newLog, status: e.target.value })}
                className="form-input-style"
              >
                <option value="">请选择状态</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="备注"
              name="remark"
              type="text"
              value={newLog.remark}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewLog({ ...newLog, remark: e.target.value })
              }
              className="form-input-style"
            />
            <div className="mt-6 flex gap-4">
              <ActionBtn onClick={handleAddLog}>保存</ActionBtn>
              <ActionBtn
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                onClick={() => setShowAddLog(false)}
              >
                取消
              </ActionBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
