/**
 * 把旧路径 src/controllers/xxxController.js -> api/controllers/xxxController.js
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  return j(file.source)
    .find(j.ImportDeclaration)
    .forEach((path) => {
      const src = path.node.source.value;
      if (typeof src === 'string') {
        let replaced = src
          .replace(/^src\/controllers\//, '../controllers/')
          .replace(/^src\/routes\//, '../routes/')
          .replace(/components\/shipmentForm/, 'components/waybill/Form');
        if (replaced !== src) path.node.source.value = replaced;
      }
    })
    .toSource();
}
