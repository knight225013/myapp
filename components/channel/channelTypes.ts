// src/components/channelTypes.ts
import { FeeRule } from '@/components/smart-template/fee-rules/types';

export interface RateRule {
  id?: string;
  minWeight: number;
  maxWeight: number;
  weightType: string;
  divisor?: number;
  sideRule?: string;
  extraFee?: number;
  baseRate: number;
  taxRate?: number;
  otherFee?: number;
  priority: number;
}

export interface FormData {
  id?: string;
  name: string;
  code: string;
  type: string;
  country?: string;
  warehouse?: string;
  origin?: string;
  currency: string;
  decimal?: string;
  method?: string;
  rounding?: string;
  compareMode?: string;
  volRatio?: number;
  cubeRatio?: number;
  splitRatio?: number;
  chargeMethod?: string;
  minCharge?: number;
  ticketPrecision?: number;
  boxPrecision?: number;
  sizePrecision?: number;
  minPieces?: number;
  maxPieces?: number;
  minBoxRealWeight?: number;
  minBoxMaterialWeight?: number;
  minBoxChargeWeight?: number;
  minBoxAvgWeight?: number;
  minTicketChargeWeight?: number;
  maxTicketChargeWeight?: number;
  minTicketRealWeight?: number;
  maxTicketRealWeight?: number;
  minBoxRealWeightLimit?: number;
  maxBoxRealWeight?: number;
  minBoxChargeWeightLimit?: number;
  maxBoxChargeWeight?: number;
  minDeclareValue?: number;
  maxDeclareValue?: number;
  aging?: string;
  waybillRule?: string;
  labelCode?: string;
  assignedUser?: string;
  userLevel?: string;
  declareCurrency?: string;
  defaultDeclareCurrency?: string;
  sender?: string;
  showWeight: boolean;
  showSize: boolean;
  requireWeight: boolean;
  requireSize: boolean;
  requirePhone: boolean;
  requireEmail: boolean;
  requirePackingList: boolean;
  verifySalesLink: boolean;
  verifyImageLink: boolean;
  requireVAT: boolean;
  requireVATFiling: boolean;
  requireEORI: boolean;
  enableBilling: boolean;
  showBilling: boolean;
  controlBilling: boolean;
  controlReceivingFee: boolean;
  promptUnderpayment: boolean;
  modifyVolRatio: boolean;
  showSupplierData: boolean;
  orderBySKULibrary: boolean;
  allowCancel: boolean;
  noAutoCancelAPIFail: boolean;
  allowChannelChange: boolean;
  allowEdit: boolean;
  allowTrackingEntry: boolean;
  allowLabelUpload: boolean;
  hideCarrier: boolean;
  refundOnReturn: boolean;
  noRefundOnCancel: boolean;
  showInWMS: boolean;
  enableCOD: boolean;
  restrictWarehouseCode: boolean;
  roundBeforeSplit: boolean;
  feeRules: FeeRule[];
  rates: RateRule[];
  chargeWeight?: number; // 收费重量（KG）
  chargeVolume?: number; // 收费体积（CBM）
  chargePrice?: number; // 收费价格（每KG或每CBM）
  unitType?: string; // 计费单位（KG 或 CBM）
}

export interface ChannelFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<FormData>;
  onSubmitSuccess?: () => void;
}

export interface WaybillRule {
  id: string;
  name: string;
}
