'use client';

interface BillFeeSummaryProps {
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
  waybills: Array<{
    id: string;
    chargeWeight: number;
    channel: {
      id: string;
      name: string;
      unitPrice: number;
    };
  }>;
}

export default function BillFeeSummary({ feeDetails, waybills }: BillFeeSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">费用详情</h3>
      
      {/* 运费明细 */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">运费明细</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">运单ID</th>
                <th className="px-4 py-2 text-left">渠道</th>
                <th className="px-4 py-2 text-left">计费重量(kg)</th>
                <th className="px-4 py-2 text-left">单价(¥/kg)</th>
                <th className="px-4 py-2 text-left">运费(¥)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {waybills.map((waybill) => {
                const freight = waybill.chargeWeight * waybill.channel.unitPrice;
                return (
                  <tr key={waybill.id}>
                    <td className="px-4 py-2 font-mono text-xs">{waybill.id.slice(0, 8)}...</td>
                    <td className="px-4 py-2">{waybill.channel.name}</td>
                    <td className="px-4 py-2">{waybill.chargeWeight}</td>
                    <td className="px-4 py-2">¥{waybill.channel.unitPrice}</td>
                    <td className="px-4 py-2 font-semibold">¥{freight.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 额外费用明细 */}
      {feeDetails.feeBreakdown.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">额外费用明细</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">运单ID</th>
                  <th className="px-4 py-2 text-left">费用名称</th>
                  <th className="px-4 py-2 text-left">参数</th>
                  <th className="px-4 py-2 text-left">金额(¥)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feeDetails.feeBreakdown.map((fee, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 font-mono text-xs">{fee.waybillId.slice(0, 8)}...</td>
                    <td className="px-4 py-2">{fee.ruleName}</td>
                    <td className="px-4 py-2">
                      {JSON.stringify(fee.ruleParams)}
                    </td>
                    <td className="px-4 py-2 font-semibold">¥{fee.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 费用汇总 */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">运费小计:</span>
          <span className="font-semibold">¥{feeDetails.totalFreight.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">额外费用小计:</span>
          <span className="font-semibold">¥{feeDetails.totalExtraFees.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
          <span>总计:</span>
          <span className="text-green-600">¥{feeDetails.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
} 