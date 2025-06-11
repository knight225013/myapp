import { Template, Rule } from '../types';

export const templates: Template[] = [
  // 普货运费（原 weight.ts）
  {
    id: 'main-a-price',
    name: 'A价 普货运费',
    category: '计费主模板',
    description: '根据重量分段计费：1-30kg ¥130/kg；31-150kg ¥108/kg；151kg以上 ¥105/kg',
    rules: [
      {
        id: 'main-a-price-rule-1',
        label: '分段 1',
        field: 'weight',
        type: 'number',
        condition: 'weight > {minThreshold} && weight <= {maxThreshold}',
        formula: 'weight * {price}',
        value: 0,
        minThreshold: 0,
        maxThreshold: 30,
        price: 130,
      },
      {
        id: 'main-a-price-rule-2',
        label: '分段 2',
        field: 'weight',
        type: 'number',
        condition: 'weight > {minThreshold} && weight <= {maxThreshold}',
        formula: 'weight * {price}',
        value: 0,
        minThreshold: 30,
        maxThreshold: 150,
        price: 108,
      },
      {
        id: 'main-a-price-rule-3',
        label: '分段 3',
        field: 'weight',
        type: 'number',
        condition: 'weight > {minThreshold}',
        formula: 'weight * {price}',
        value: 0,
        minThreshold: 150,
        price: 105,
      },
    ],
  },
  // 高货值保险（原 insurance.ts）
  {
    id: 'insurance-fee',
    name: '高货值保险',
    category: '附加费用',
    description: '按申报价值比例收取保险费用，默认5%',
    rules: [
      {
        id: 'insurance-fee-rule',
        label: '保险费',
        field: 'declaredValue',
        type: 'number',
        condition: 'declaredValue > {threshold}',
        formula: 'declaredValue * {rate}',
        value: 0,
        threshold: 0,
        rate: 0.05,
      },
    ],
  },
  // 超期仓储费（原 storage.ts）
  {
    id: 'storage-fee',
    name: '超期仓储费',
    category: '附加费用',
    description: '超出免费天数后按日计费',
    rules: [
      {
        id: 'storage-fee-rule',
        label: '仓储费',
        field: 'storageDays',
        type: 'number',
        condition: 'storageDays > {freeDays}',
        formula: '(storageDays - {freeDays}) * {dailyFee}',
        value: 0,
        freeDays: 30,
        dailyFee: 10,
      },
    ],
  },
  // 偏远邮编附加费（原 remote-area.ts）
  {
    id: 'remote-area-fee',
    name: '偏远邮编附加费',
    category: '附加费用',
    description: '匹配偏远邮编时自动加收附加费用',
    rules: [
      {
        id: 'remote-area-fee-rule',
        label: '偏远地区附加费',
        field: 'postalCode',
        type: 'string',
        condition: 'isRemoteArea(postalCode)',
        formula: '{fee}',
        value: '',
        fee: 50,
        countries: [],
        regions: [],
      },
    ],
  },
  // 超重附加费（原 customs.ts）
  {
    id: 'overweight-fee',
    name: '超重附加费',
    category: '附加费用',
    description: '单件重量超过一定值时，加收固定附加费',
    rules: [
      {
        id: 'overweight-fee-rule',
        label: '超重费',
        field: 'boxWeight',
        type: 'number',
        condition: 'boxWeight > {threshold}',
        formula: '{fee}',
        value: 0,
        threshold: 25,
        fee: 280,
      },
    ],
  },
  // 木制品商检费（原 customs.ts）
  {
    id: 'wood-check-fee',
    name: '木制品商检费',
    category: '附加费用',
    description: '如为木制品则需加收商检费用',
    rules: [
      {
        id: 'wood-check-fee-rule',
        label: '商检费',
        field: 'isWoodProduct',
        type: 'boolean',
        condition: 'isWoodProduct == {yes}',
        formula: '{fee}',
        value: false,
        fee: 500,
      },
    ],
  },
  // 报关相关费用（原 customs.ts）
  {
    id: 'customs-clearance',
    name: '报关相关费用',
    category: '附加费用',
    description: '报关服务费、无发票附加费',
    rules: [
      {
        id: 'customs-service-fee-rule',
        label: '报关服务费',
        field: 'isCustomsDeclared',
        type: 'boolean',
        condition: 'isCustomsDeclared == {yes}',
        formula: '{fee}',
        value: false,
        fee: 300,
      },
      {
        id: 'no-invoice-fee-rule',
        label: '无发票附加费',
        field: 'hasInvoice',
        type: 'boolean',
        condition: 'hasInvoice == {no}',
        formula: '{noInvoiceFee}',
        value: false,
        noInvoiceFee: 200,
      },
      {
        id: 'declared-value-fee-rule',
        label: '按申报金额比例报关费',
        field: 'declaredValue',
        type: 'number',
        condition: 'isCustomsDeclared == {yes} && declaredValue > {threshold}',
        formula: 'declaredValue * {rate}',
        value: 0,
        threshold: 0,
        rate: 0.05,
      },
    ],
  },
  // 超尺寸附加费（原 dimension.ts）
  {
    id: 'dimension-limit',
    name: '超尺寸附加费',
    category: '附加费用',
    description: '长边 >100cm 或次边 >70cm 加收固定费用',
    rules: [
      {
        id: 'dimension-limit-rule-1',
        label: '长边附加费',
        field: 'maxLength',
        type: 'number',
        condition: 'maxLength > {maxThreshold}',
        formula: '{maxFee}',
        value: 0,
        maxThreshold: 100,
        maxFee: 120,
      },
      {
        id: 'dimension-limit-rule-2',
        label: '次边附加费',
        field: 'secondLength',
        type: 'number',
        condition: 'secondLength > {secondThreshold}',
        formula: '{secondFee}',
        value: 0,
        secondThreshold: 70,
        secondFee: 120,
      },
    ],
  },
  // 固定税费（原 flat-tax.ts）
  {
    id: 'flat-tax',
    name: '固定税费',
    category: '税费规则',
    description: '每票或每件固定征税金额',
    rules: [
      {
        id: 'flat-tax-rule-1',
        label: '整票固税',
        field: 'true',
        type: 'number',
        condition: 'true',
        formula: '{fixedAmount}',
        value: 0,
        fixedAmount: 200,
      },
      {
        id: 'flat-tax-rule-2',
        label: '按件固税',
        field: 'quantity',
        type: 'number',
        condition: 'quantity > 0',
        formula: 'quantity * {fixedPerPiece}',
        value: 0,
        fixedPerPiece: 50,
      },
    ],
  },
  // 燃油附加费（原 fuel.ts）
  {
    id: 'fuel-surcharge',
    name: '燃油附加费',
    category: '附加费用',
    description: '根据应收费用按百分比加收燃油附加费',
    rules: [
      {
        id: 'fuel-surcharge-rule',
        label: '燃油附加费',
        field: 'baseCharge',
        type: 'number',
        condition: 'baseCharge > 0',
        formula: 'baseCharge * {rate}',
        value: 0,
        rate: 0.06,
      },
    ],
  },
  // 围长附加费（原 girth.ts）
  {
    id: 'girth-limit',
    name: '围长附加费',
    category: '附加费用',
    description: '围长超过限制时收取附加费',
    rules: [
      {
        id: 'girth-limit-rule',
        label: '围长超限附加费',
        field: 'girth',
        type: 'number',
        condition: 'girth > {limit}',
        formula: '{fee}',
        value: 0,
        limit: 300,
        fee: 200,
      },
    ],
  },
  // 按件计费（原 per-piece.ts）
  {
    id: 'per-piece-fee',
    name: '按件计费模板',
    category: '计费规则',
    description: '每件固定单价 × 件数（quantity）计费',
    rules: [
      {
        id: 'per-piece-fee-rule',
        label: '按件计费',
        field: 'quantity',
        type: 'number',
        condition: 'quantity > 0',
        formula: 'quantity * {price}',
        value: 0,
        price: 50,
      },
    ],
  },
  // 折扣优惠（原 promotion.ts）
  {
    id: 'discount-promotion',
    name: '折扣优惠模板',
    category: '折扣/活动',
    description: '按应收费用给予一定比例折扣',
    rules: [
      {
        id: 'discount-promotion-rule',
        label: '折扣优惠',
        field: 'totalFee',
        type: 'number',
        condition: 'totalFee > 0',
        formula: 'totalFee * (1 - {discount})',
        value: 0,
        discount: 0.1,
      },
    ],
  },
  // 按方计费（原 cbm-charge.ts）
  {
    id: 'cbm-charge',
    name: '按方计费',
    category: '计费方式',
    description: '立方米（CBM）计费规则',
    rules: [
      {
        id: 'cbm-charge-rule',
        label: 'CBM 运费',
        field: 'volume',
        type: 'number',
        condition: 'volume > 0',
        formula: '(volume / 1000000) * {cbmRate}',
        value: 0,
        cbmRate: 1000,
      },
    ],
  },
  // 品牌/品类附加费（原 category.ts）
  {
    id: 'brand-category-fee',
    name: '品牌/品类附加费',
    category: '附加费用',
    description: '当品类或品牌匹配特定值时，加收附加费用',
    rules: [
      {
        id: 'brand-category-fee-rule',
        label: '潮牌附加费',
        field: 'category',
        type: 'string',
        condition: 'category == "{match}"',
        formula: '{fee}',
        value: '',
        match: '潮牌',
        fee: 50,
      },
    ],
  },
];

export function createRule(type: string, field: string, id: string): Rule {
  const template = templates
    .flatMap((t) => t.rules)
    .find((r) => r.type === type && r.field === field);
  if (!template) throw new Error(`Unknown rule: ${type}/${field}`);
  return { ...template, id, value: type === 'boolean' ? false : type === 'string' ? '' : 0 };
}
