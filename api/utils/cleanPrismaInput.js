// utils/cleanPrismaInput.js
const allowedFields = [
  'tenantId',
  'customerId',
  'recipient',
  'country',
  'warehouse',
  'quantity',
  'weight',
  'volume',
  'volumetricWeight',
  'chargeWeight',
  'length',
  'width',
  'height',
  'hasBattery',
  'hasMagnetic',
  'hasDangerous',
  'hasLiquid',
  'hasPowder',
  'clientCode',
  'company',
  'phone',
  'email',
  'store',
  'ref1',
  'vat',
  'ioss',
  'eori',
  'senderName',
  'currency',
  'productName',
  'category',
  'attrs',
  'notes',
  'insurance',
  'address1',
  'address2',
  'address3',
  'city',
  'state',
  'postalCode',
  'declaredValue',
  'declaredQuantity',
  'isCOD',
  'allowCustomerCancel',
  'labelUploaded',
  'errors',
  'extraFee',
  'type',
  'status',
];

function cleanPrismaData(input) {
  const output = {};
  for (const key of allowedFields) {
    if (input[key] !== undefined) {
      output[key] = input[key];
    }
  }
  return output;
}

module.exports = { cleanPrismaData };
