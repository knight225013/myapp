// components/channel/index.ts

// —————— 组件导出 ——————
export { default as ChannelForm }           from './ChannelForm';
export { default as ChannelViewDetail }     from './ChannelViewDetail';
export { default as ChannelEstimateTable }  from './ChannelEstimateTable';
export { default as ChannelTable }          from './ChannelTable';
export { default as ExtraFeeBadgeList }     from './ExtraFeeBadgeList';
export { default as SelectTemplateModal }   from './SelectTemplateModal';

// —————— 类型导出 ——————
export type { RateRule, ChannelFormProps, WaybillRule } from './channelTypes';
// 将 FormData 重命名为 ChannelTypes，方便在外部引用
export type { FormData as ChannelTypes } from './channelTypes';
