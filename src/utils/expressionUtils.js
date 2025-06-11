function toExpressionString(nodes = []) {
  if (!nodes.length) return '';

  const translateNode = (node) => {
    if (node.type === 'field') return node.value;
    if (node.type === 'value') return node.value.toString();
    if (node.type === 'operator') return node.value;
    if (node.type === 'group') return `(${node.children.map(translateNode).join(' ')})`;
    return '';
  };

  return nodes.map(translateNode).join(' ');
}

function evaluateExpression(nodes = [], context = {}) {
  try {
    const exprStr = toExpressionString(nodes);
    if (!exprStr) return false;

    const evalNode = (node) => {
      if (node.type === 'field') return context[node.value] || 0;
      if (node.type === 'value') return node.value;
      if (node.type === 'group') {
        const groupResult = evaluateExpression(node.children, context);
        return typeof groupResult === 'number' ? groupResult : false;
      }
      return 0;
    };

    const stack = [];
    for (const node of nodes) {
      if (node.type === 'operator') {
        const b = stack.pop();
        const a = stack.pop();
        if (typeof a !== 'number' || typeof b !== 'number') return false;
        switch (node.value) {
          case '+':
            stack.push(a + b);
            break;
          case '-':
            stack.push(a - b);
            break;
          case '*':
            stack.push(a * b);
            break;
          case '/':
            stack.push(b !== 0 ? a / b : 0);
            break;
          case '>':
            stack.push(a > b);
            break;
          case '<':
            stack.push(a < b);
            break;
          case '==':
            stack.push(a === b);
            break;
          case '>=':
            stack.push(a >= b);
            break;
          case '<=':
            stack.push(a <= b);
            break;
          default:
            return false;
        }
      } else {
        stack.push(evalNode(node));
      }
    }

    return stack.length === 1 ? stack[0] : false;
  } catch (error) {
    console.error('Expression evaluation error:', error);
    return false;
  }
}

module.exports = { evaluateExpression, toExpressionString };
