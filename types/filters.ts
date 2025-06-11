export type Filters = {
  status: string;
  country: string;
  channel: string; // 或 string | undefined，取决于需求
  waybillNumber: string;
  client: string;
  date: string;
  trackingNumber?: string;
  recipient?: string;
};
