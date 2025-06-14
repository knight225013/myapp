'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BillDetailHeader from '@/components/finance/BillDetailHeader';
import BillFeeSummary from '@/components/finance/BillFeeSummary';
import BillTimeline from '@/components/finance/BillTimeline';
import BillAttachments from '@/components/finance/BillAttachments';
import BillActions from '@/components/finance/BillActions';

interface BillDetail {
  id: string;
  billNo: string;
  clientName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  waybills: Array<{
    id: string;
    chargeWeight: number;
    channel: {
      id: string;
      name: string;
      unitPrice: number;
      extraFeeRules: any;
    };
  }>;
  logs: Array<{
    id: string;
    status: string;
    remark: string;
    timestamp: string;
  }>;
  attachments: Array<{
    id: string;
    url: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
  }>;
  feeDetails: {
    totalFreight: number;
    totalExtraFees: number;
    totalAmount: number;
    feeBreakdown: Array<{
      waybillId: string;
      ruleName: string;
      ruleParams: any;
      amount: number;
    }>;
  };
}

export default function BillDetailPage() {
  const params = useParams();
  const billId = params.billId as string;
  
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/finance/bills/${billId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取账单详情失败');
      }
      
      if (!data.success) {
        throw new Error(data.error || '获取账单详情失败');
      }
      
      setBill(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取账单详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billId) {
      fetchBillDetail();
    }
  }, [billId]);

  const handleStatusChanged = () => {
    fetchBillDetail();
  };

  const handleAttachmentUploaded = () => {
    fetchBillDetail();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-50 text-gray-500 p-8 rounded-lg text-center">
          账单不存在
        </div>
      </div>
    );
  }

  const channelId = bill.waybills[0]?.channel?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <BillDetailHeader bill={bill} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BillFeeSummary 
            feeDetails={bill.feeDetails} 
            waybills={bill.waybills} 
          />
          
          <BillTimeline logs={bill.logs} />
          
          <BillAttachments 
            billId={bill.id}
            attachments={bill.attachments}
            onAttachmentUploaded={handleAttachmentUploaded}
          />
        </div>
        
        <div className="lg:col-span-1">
          <BillActions 
            billId={bill.id}
            status={bill.status}
            channelId={channelId}
            onStatusChanged={handleStatusChanged}
          />
        </div>
      </div>
    </div>
  );
} 