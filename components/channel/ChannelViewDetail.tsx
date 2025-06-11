'use client';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Channel, Rate } from '@/types/shipment';
import { ExtraFeeRule } from '../ExtraFeeRule/types';

interface ChannelViewDetailProps {
  channel: Channel | null;
  isOpen: boolean;
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined || value === false || value === '') return null;
  return (
    <div className="flex justify-between py-1 text-sm border-b border-dashed border-gray-200">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="text-gray-800">{String(value)}</span>
    </div>
  );
}

export default function ChannelViewDetail({ channel, isOpen, onClose }: ChannelViewDetailProps) {
  if (!channel) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="text-xl font-semibold text-gray-800">
        渠道详情 - {channel.name}
      </DialogTitle>
      <DialogContent className="p-6 space-y-6 text-sm">
        <Section title="📦 基础信息">
          <Field label="渠道名称" value={channel.name} />
          <Field label="渠道类型" value={channel.type} />
          <Field label="国家" value={channel.country} />
          <Field label="仓库" value={channel.warehouse} />
          <Field label="币种" value={channel.currency} />
          <Field label="起运地" value={channel.origin} />
          <Field label="小数位数" value={channel.decimal} />
          <Field label="渠道代码" value={channel.code} />
          <Field
            label="创建时间"
            value={channel.createdAt ? new Date(channel.createdAt).toLocaleDateString() : '-'}
          />
        </Section>

        <Section title="💰 计费配置">
          <Field label="计费方式" value={channel.chargeMethod} />
          <Field label="材积比" value={channel.volRatio} />
          <Field label="计方系数" value={channel.cubeRatio} />
          <Field label="分箱比例" value={channel.splitRatio} />
          <Field label="最小运费" value={channel.minCharge} />
          <Field label="取整方式" value={channel.rounding} />
          <Field label="收费重计算方式" value={channel.compareMode} />
          <Field label="票计重精度" value={channel.ticketPrecision} />
          <Field label="箱计重精度" value={channel.boxPrecision} />
          <Field label="尺寸精度" value={channel.sizePrecision} />
        </Section>

        <Section title="📋 运单控制">
          <Field label="显示重量" value={channel.showWeight} />
          <Field label="显示尺寸" value={channel.showSize} />
          <Field label="重量必填" value={channel.requireWeight} />
          <Field label="尺寸必填" value={channel.requireSize} />
          <Field label="允许取消" value={channel.allowCancel} />
          <Field label="API打单失败不自动取消" value={channel.noAutoCancelAPIFail} />
          <Field label="可切换渠道" value={channel.allowChannelChange} />
          <Field label="允许客户修改" value={channel.allowEdit} />
          <Field label="允许客户录入转单号" value={channel.allowTrackingEntry} />
          <Field label="上传FBA标签" value={channel.allowLabelUpload} />
          <Field label="客户端不显示承运" value={channel.hideCarrier} />
          <Field label="在WMS中显示" value={channel.showInWMS} />
          <Field label="开启代收货款" value={channel.enableCOD} />
          <Field label="仅允许价格表中存在的仓库代码下单" value={channel.restrictWarehouseCode} />
          <Field label="整票分泡前按票精度进位" value={channel.roundBeforeSplit} />
        </Section>

        <Section title="🚫 限制与规则">
          <Field label="最小件数" value={channel.minPieces} />
          <Field label="最大件数" value={channel.maxPieces} />
          <Field label="最低箱实重" value={channel.minBoxRealWeight} />
          <Field label="最低箱材重" value={channel.minBoxMaterialWeight} />
          <Field label="最低箱收费重" value={channel.minBoxChargeWeight} />
          <Field label="最低箱均重" value={channel.minBoxAvgWeight} />
          <Field label="最低票收费重" value={channel.minTicketChargeWeight} />
          <Field label="最大票收费重" value={channel.maxTicketChargeWeight} />
          <Field label="最小票实重" value={channel.minTicketRealWeight} />
          <Field label="最大票实重" value={channel.maxTicketRealWeight} />
          <Field label="最小箱实重限制" value={channel.minBoxRealWeightLimit} />
          <Field label="最大箱实重" value={channel.maxBoxRealWeight} />
          <Field label="最小箱收费重限制" value={channel.minBoxChargeWeightLimit} />
          <Field label="最大箱收费重" value={channel.maxBoxChargeWeight} />
          <Field label="最小申报" value={channel.minDeclareValue} />
          <Field label="最大申报" value={channel.maxDeclareValue} />
        </Section>

        <Section title="⚠️ 验证要求">
          <Field label="需要手机号" value={channel.requirePhone} />
          <Field label="需要邮箱" value={channel.requireEmail} />
          <Field label="需要Packing List" value={channel.requirePackingList} />
          <Field label="验证销售链接" value={channel.verifySalesLink} />
          <Field label="验证图片链接" value={channel.verifyImageLink} />
          <Field label="需要VAT" value={channel.requireVAT} />
          <Field label="VAT号备案" value={channel.requireVATFiling} />
          <Field label="EORI必填" value={channel.requireEORI} />
        </Section>

        <Section title="🔧 特殊逻辑">
          <Field label="修改计泡系数" value={channel.modifyVolRatio} />
          <Field label="显示供应商数据" value={channel.showSupplierData} />
          <Field label="根据产品库SKU下单" value={channel.orderBySKULibrary} />
          <Field label="退件并退款" value={channel.refundOnReturn} />
          <Field label="取消不退款" value={channel.noRefundOnCancel} />
          <Field label="下单计费" value={channel.enableBilling} />
          <Field label="下单显示费用" value={channel.showBilling} />
          <Field label="下单费用控制" value={channel.controlBilling} />
          <Field label="收货费用控制" value={channel.controlReceivingFee} />
          <Field label="收货欠费提示" value={channel.promptUnderpayment} />
        </Section>

        <Section title="🔗 关联设置">
          <Field label="指定用户" value={channel.assignedUser} />
          <Field label="用户等级" value={channel.userLevel} />
          <Field label="申报币种" value={channel.declareCurrency} />
          <Field label="默认申报币种" value={channel.defaultDeclareCurrency} />
          <Field label="发件人" value={channel.sender} />
          <Field label="时效" value={channel.aging} />
          <Field label="运单号规则" value={channel.waybillRule} />
          <Field label="标签代码" value={channel.labelCode} />
        </Section>

        <Section title="📊 费率表">
          {channel.rates && channel.rates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">最小重量</th>
                    <th className="px-4 py-2">最大重量</th>
                    <th className="px-4 py-2">计费类型</th>
                    <th className="px-4 py-2">材积除数</th>
                    <th className="px-4 py-2">尺寸规则</th>
                    <th className="px-4 py-2">附加费用</th>
                    <th className="px-4 py-2">基础单价</th>
                    <th className="px-4 py-2">税率</th>
                    <th className="px-4 py-2">其他费用</th>
                    <th className="px-4 py-2">优先级</th>
                  </tr>
                </thead>
                <tbody>
                  {channel.rates.map((rate: Rate, index: number) => (
                    <tr key={index} className="bg-white border-b">
                      <td className="px-4 py-2">{rate.minWeight}</td>
                      <td className="px-4 py-2">{rate.maxWeight}</td>
                      <td className="px-4 py-2">{rate.weightType}</td>
                      <td className="px-4 py-2">{rate.divisor}</td>
                      <td className="px-4 py-2">{rate.sideRule}</td>
                      <td className="px-4 py-2">{rate.extraFee}</td>
                      <td className="px-4 py-2">{rate.baseRate}</td>
                      <td className="px-4 py-2">{rate.taxRate}</td>
                      <td className="px-4 py-2">{rate.otherFee}</td>
                      <td className="px-4 py-2">{rate.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">无费率数据</p>
          )}
        </Section>

        <Section title="💸 附加费规则">
          {channel.extraFeeRules && channel.extraFeeRules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">规则名称</th>
                    <th className="px-4 py-2">费用类型</th>
                    <th className="px-4 py-2">费用值</th>
                    <th className="px-4 py-2">币种</th>
                    <th className="px-4 py-2">生效时间</th>
                    <th className="px-4 py-2">失效时间</th>
                    <th className="px-4 py-2">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {channel.extraFeeRules.map((rule: ExtraFeeRule, index: number) => (
                    <tr key={rule.id} className="bg-white border-b">
                      <td className="px-4 py-2">{rule.name}</td>
                      <td className="px-4 py-2">{rule.feeType}</td>
                      <td className="px-4 py-2">{rule.value}</td>
                      <td className="px-4 py-2">{rule.currency}</td>
                      <td className="px-4 py-2">
                        {rule.activeFrom ? new Date(rule.activeFrom).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-2">
                        {rule.activeTo ? new Date(rule.activeTo).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-2">{rule.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">无附加费规则</p>
          )}
        </Section>
      </DialogContent>
    </Dialog>
  );
}
