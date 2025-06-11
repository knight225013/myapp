export const ItemTypes = {
  FIELD: 'FIELD',
  EXPRESSION_NODE: 'EXPRESSION_NODE',
  RULE_CARD: 'RULE_CARD',
};

export type ExpressionNode =
  | { type: 'field'; value: string }
  | { type: 'value'; value: number }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' | '>' | '<' | '==' | '>=' | '<=' | '!=' }
  | { type: 'group'; children: ExpressionNode[] };

export interface ExtraFeeRule {
  id: string;
  name: string;
  expression: ExpressionNode[];
  feeType: 'fixed' | 'perKg' | 'percent';
  value: number;
  currency: string;
  activeFrom?: string;
  activeTo?: string;
  note?: string;
}
