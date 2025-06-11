import { ExpressionNode } from './types';

export function toChineseDescription(nodes: ExpressionNode[]): string {
  if (!nodes || nodes.length === 0) return '无条件';

  const translateNode = (node: ExpressionNode): string => {
    switch (node.type) {
      case 'field':
        const fieldMap: { [key: string]: string } = {
          weight: '重量',
          volume: '体积',
          chargeWeight: '计费重',
          boxCount: '箱数',
          length: '长',
          width: '宽',
          height: '高',
          declareValue: '申报价值',
        };
        return fieldMap[node.value] || node.value;
      case 'value':
        return node.value.toString();
      case 'operator':
        const operatorMap: { [key: string]: string } = {
          '+': '加',
          '-': '减',
          '*': '乘',
          '/': '除',
          '>': '大于',
          '<': '小于',
          '==': '等于',
          '>=': '大于等于',
          '<=': '小于等于',
        };
        return operatorMap[node.value] || node.value;
      case 'group':
        return `(${node.children.map(translateNode).join(' ')})`;
      default:
        return '';
    }
  };

  return nodes.map(translateNode).join(' ') || '无条件';
}
