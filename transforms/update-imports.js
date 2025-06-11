/**
 * 更新 components 目录下的 import 路径
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  return j(file.source)
    .find(j.ImportDeclaration)
    .forEach((path) => {
      let src = path.node.source.value;
      if (typeof src !== 'string') return;
      // 下面请根据你的实际旧名写映射：
      src = src
        .replace('@/components/shipmentForm', '@/components/waybill/Form')
        .replace('@/components/FBAOrderForm', '@/components/waybill/WaybillForm')
        .replace('@/components/FbaShipmentForm', '@/components/waybill/ShipmentForm');
      // …依次把所有旧路径映射到新路径
      path.node.source.value = src;
    })
    .toSource({ quote: 'single' });
}
