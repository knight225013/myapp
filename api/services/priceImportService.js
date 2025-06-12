const { parse } = require('papaparse');
const { prisma } = require('../lib/prisma');

exports.parsePaste = (text) => {
  const { data } = parse(text, { header: true });
  return data;
};

exports.validateRows = (rows) => {
  return rows.every((row) => row.period && row.rate);
};

exports.upsertRows = async (priceId, text) => {
  const rows = exports.parsePaste(text);
  if (!exports.validateRows(rows)) {
    throw new Error('Invalid row data');
  }
  return await prisma.$transaction(
    rows.map((row) =>
      prisma.priceSetting.upsert({
        where: { id: row.id || '' },
        update: { ...row, priceId },
        create: { ...row, priceId },
      }),
    ),
  );
};
