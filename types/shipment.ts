import { ExtraFeeRule } from '../components/ExtraFeeRule/types';

export type Box = {
  id: string;
  code: string;
  fullCode: string;
  ref?: string;
  clientData?: string;
  pickData?: string;
  declareValue?: number;
  carrier?: string;
  subTopic?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  hasBattery: boolean;
};

export type LogEntry = {
  id: string;
  status: string;
  remark?: string;
  timestamp: string;
  location?: string;
};

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Rate {
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

export interface Channel {
  id: string;
  name: string;
  type: string;
  country?: string;
  warehouse?: string;
  origin?: string;
  currency: string;
  createdAt?: string;
  rates?: Rate[];
  code?: string;
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
  waybillRuleId?: string;
  labelCode?: string;
  assignedUser?: string;
  userLevel?: string;
  declareCurrency?: string;
  defaultDeclareCurrency?: string;
  sender?: string;
  showWeight?: boolean;
  showSize?: boolean;
  requireWeight?: boolean;
  requireSize?: boolean;
  requirePhone?: boolean;
  requireEmail?: boolean;
  requirePackingList?: boolean;
  verifySalesLink?: boolean;
  verifyImageLink?: boolean;
  requireVAT?: boolean;
  requireVATFiling?: boolean;
  requireEORI?: boolean;
  enableBilling?: boolean;
  showBilling?: boolean;
  controlBilling?: boolean;
  controlReceivingFee?: boolean;
  promptUnderpayment?: boolean;
  modifyVolRatio?: boolean;
  showSupplierData?: boolean;
  orderBySKULibrary?: boolean;
  allowCancel?: boolean;
  noAutoCancelAPIFail?: boolean;
  allowChannelChange?: boolean;
  allowEdit?: boolean;
  allowTrackingEntry?: boolean;
  allowLabelUpload?: boolean;
  hideCarrier?: boolean;
  refundOnReturn?: boolean;
  noRefundOnCancel?: boolean;
  showInWMS?: boolean;
  enableCOD?: boolean;
  restrictWarehouseCode?: boolean;
  roundBeforeSplit?: boolean;
  extraFeeRules?: ExtraFeeRule[];
}

export type Shipment = {
  id: string;
  type: 'FBA' | '傳統';
  channel?: Channel;
  recipient: string;
  country: string;
  quantity: number;
  weight: number;
  cargo?: string;
  status: string;
  exception?: string;
  vat?: string;
  chargeWeight?: number;
  realWeight?: number;
  volumetricWeight?: number;
  volume?: number;
  ratio?: number;
  warehouse?: string;
  length?: number;
  width?: number;
  height?: number;
  hasBattery?: boolean;
  clientCode?: string;
  company?: string;
  phone?: string;
  email?: string;
  store?: string;
  ref1?: string;
  ioss?: string;
  eori?: string;
  currency?: string;
  category?: string;
  productName?: string;
  attrs?: string[];
  notes?: string;
  insurance?: boolean;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  createdAt?: string;
  boxes?: Box[];
  senderId?: string;
  sender?: Customer;
  senderName?: string;
  declareBoxId?: string;
  totalItems?: number;
  totalValue?: number;
  freightCost?: number; // 添加运费
  extraFee?: number; // 添加附加费
  productKinds?: number;
  attachments?: Array<{
    name: string;
    uploader: string;
    time: string;
  }>;
  logs?: LogEntry[];
  trackingNumber?: string;
  carrier?: {
    id: string;
    name: string;
    code: string;
    logoUrl?: string;
  };
};
