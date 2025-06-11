import { ModuleConfig } from './types';
import LadderRuleForm from './fee-forms/LadderRuleForm';
import PercentFeeForm from './fee-forms/PercentFeeForm';
import RemoteAreaFeeForm from './fee-forms/RemoteAreaFeeForm';
import DiscountRateForm from './fee-forms/DiscountRateForm';
import ThresholdDiscountForm from './fee-forms/ThresholdDiscountForm';
import TimedPromoForm from './fee-forms/TimedPromoForm';
import CustomFeeForm from './fee-forms/CustomFeeForm';
import CustomsAgentFeeForm from './fee-forms/CustomsAgentFeeForm';
import DimensionSumForm from './fee-forms/DimensionSumForm';
import FuelSurchargeForm from './fee-forms/FuelSurchargeForm';
import GirthFeeForm from './fee-forms/GirthFeeForm';
import ImportVATFeeForm from './fee-forms/ImportVATFeeForm';
import InsuranceFeeForm from './fee-forms/InsuranceFeeForm';
import LongestSideFeeForm from './fee-forms/LongestSideFeeForm';
import SecondLongestSideFeeForm from './fee-forms/SecondLongestSideFeeForm';
import StorageFeeForm from './fee-forms/StorageFeeForm';
import WeightVolumeRatioForm from './fee-forms/WeightVolumeRatioForm';
import { chargeUnitOptions } from './unitOptions';

export const modules: ModuleConfig[] = [
  {
    id: 'weight',
    name: '重量模块',
    types: [
      {
        id: 'overweight',
        name: '超重费',
        formComponent: LadderRuleForm,
        formProps: {
          labelPrefix: '重量',
          conditionUnit: 'kg',
          chargeUnitOptions: [
            { value: 'box', label: '每箱' },
            { value: 'ticket', label: '每票' },
            { value: 'kg', label: '每公斤' },
            { value: 'cbm', label: '每立方' },
          ],
          field: 'weight',
        },
      },
      {
        id: 'weight_volume_ratio',
        name: '重量/体积比',
        formComponent: WeightVolumeRatioForm,
      },
    ],
  },
  {
    id: 'dimension',
    name: '尺寸模块',
    types: [
      {
        id: 'dimension_sum',
        name: '三边和',
        formComponent: DimensionSumForm,
        formProps: {
          labelPrefix: '三边和',
          conditionUnit: 'cm',
          chargeUnitOptions,
          field: 'dimension_sum',
        },
      },
      {
        id: 'girth',
        name: '围长',
        formComponent: GirthFeeForm,
        formProps: {
          labelPrefix: '围长',
          conditionUnit: 'cm',
          chargeUnitOptions: [
            { value: 'box', label: '每箱' },
            { value: 'ticket', label: '每票' },
            { value: 'kg', label: '每公斤' },
            { value: 'cbm', label: '每立方' },
          ],
          field: 'girth',
        },
      },
      {
        id: 'longest_side',
        name: '最长边',
        formComponent: LongestSideFeeForm,
        formProps: {
          labelPrefix: '最长边',
          conditionUnit: 'cm',
          chargeUnitOptions: [
            { value: 'box', label: '每箱' },
            { value: 'ticket', label: '每票' },
            { value: 'kg', label: '每公斤' },
            { value: 'cbm', label: '每立方' },
          ],
          field: 'longest_side',
        },
      },
      {
        id: 'second_longest_side',
        name: '次长边',
        formComponent: SecondLongestSideFeeForm,
        formProps: {
          labelPrefix: '次长边',
          conditionUnit: 'cm',
          chargeUnitOptions, // 使用导入的 chargeUnitOptions
          field: 'second_longest_side',
        },
      },
    ],
  },
  {
    id: 'remote_area',
    name: '偏远地址费模块',
    types: [
      {
        id: 'remote_area',
        name: '偏远地区',
        formComponent: RemoteAreaFeeForm,
      },
    ],
  },
  {
    id: 'tax_customs',
    name: '税费/报关模块',
    types: [
      {
        id: 'percent_tax',
        name: '比例税费',
        formComponent: PercentFeeForm,
      },
      {
        id: 'customs_agent',
        name: '报关代理费',
        formComponent: CustomsAgentFeeForm,
      },
      {
        id: 'import_vat',
        name: '进口增值税',
        formComponent: ImportVATFeeForm,
      },
    ],
  },
  {
    id: 'discount',
    name: '折扣/活动模块',
    types: [
      {
        id: 'discount_rate',
        name: '运费折扣',
        formComponent: DiscountRateForm,
      },
      {
        id: 'threshold_discount',
        name: '满减活动',
        formComponent: ThresholdDiscountForm,
      },
      {
        id: 'timed_promo',
        name: '限时促销',
        formComponent: TimedPromoForm,
      },
    ],
  },
  {
    id: 'other',
    name: '其他附加费模块',
    types: [
      {
        id: 'storage_fee',
        name: '仓储费',
        formComponent: StorageFeeForm,
        formProps: {
          labelPrefix: '存储天数',
          conditionUnit: '天',
          chargeUnitOptions: [
            { value: 'box', label: '每箱' },
            { value: 'ticket', label: '每票' },
            { value: 'kg', label: '每公斤' },
            { value: 'cbm', label: '每立方' },
          ],
          field: 'storage',
        },
      },
      {
        id: 'custom_fee',
        name: '自定义费用',
        formComponent: CustomFeeForm,
      },
      {
        id: 'insurance_fee',
        name: '保险费',
        formComponent: InsuranceFeeForm,
      },
      {
        id: 'fuel_surcharge',
        name: '燃油附加费',
        formComponent: FuelSurchargeForm,
      },
    ],
  },
];
