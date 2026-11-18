const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const XLSX = require('xlsx');
const source = ts.createSourceFile('page.ts', fs.readFileSync(
  'src/app/home/view-site/view-site.page.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const page = source.statements.find(ts.isClassDeclaration);
const names = ['generateExcelHistory', 'getExcelMovementColumns', 'consolidateItemData',
  'consolidateItemDataPDF', 'getTimestamp', 'formatDate'];
const compiled = ts.transpile(`class Calculations { ${page.members
  .filter(node => names.includes(node.name?.getText(source)))
  .map(node => node.getText(source)).join('\n')} }`, { target: ts.ScriptTarget.ES2020 });
let workbook;
const calculations = new Function('XLSX', `${compiled}; return new Calculations();`)({
  ...XLSX, writeFile: value => { workbook = value; },
});
const delivery = (id, code, date, qty, extra = {}) => ({ itemId: 'a', code: 'OLD',
  transactionType: 'Delivery', deliveryId: id, deliveryCode: code,
  deliveryDate: date, deliveredQty: qty, ...extra });
const returned = (id, code, date, qty, extra = {}) => ({ itemId: 'a', code: 'OLD',
  transactionType: 'Return', returnId: id, returnCode: code,
  returnDate: date, returnQty: qty, ...extra });
async function verify() {
  const rows = [
    delivery('d3', 'DEL3', '2026-08-01T08:00:00', 7),
    returned('r2', 'RET2', '2026-09-02T10:00:00', 3),
    delivery('d2', 'DEL2', '2026-07-22T10:00:00', 5),
    returned('r1', 'RET1', '2026-09-02T09:00:00', 2),
    delivery('d1', 'DEL1', '2026-07-22T09:00:00', 6),
    delivery('d1', 'DEL1', '2026-07-22T09:00:01', 4),
    returned('r2', 'RET2', '2026-09-02T10:00:01', 1, { transactionType: 'Overage Return' }),
    returned('adj', 'ADJ1', '2026-10-01T10:00:00', 2, { transactionType: 'Adjustment' }),
    returned('rev', 'REV1', '2026-10-02T10:00:00', 1, { transactionType: 'Overage Return Reversal' }),
  ];
  const original = JSON.stringify(rows);
  await calculations.generateExcelHistory(rows, { code: 'SITE', name: 'Example' }, [
    { id: 'a', code: 'LATEST', name: 'Ledger', weight: 3.4 },
  ]);
  const data = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1, { header: 1, defval: '' });
  assert.deepEqual(data[3].slice(5), [
    '22 Jul 2026', '22 Jul 2026', '01 Aug 2026', 'Delivered to Project',
    '02 Sept 2026', '02 Sept 2026', '01 Oct 2026', '02 Oct 2026', 'Total Returned from Project',
  ].map(value => value.replace('Sept', calculations.formatDate('2026-09-02').split(' ')[1])));
  assert.deepEqual(data[4].slice(5), ['DEL1', 'DEL2', 'DEL3', '', 'RET1', 'RET2', 'ADJ1', 'REV1', '']);
  assert.equal(data[5][1], 'LATEST');
  assert.equal(data[5][4], 15);
  assert.deepEqual(data[5].slice(5), [10, 5, 7, 22, 2, 4, 2, -1, 7]);
  assert.equal(JSON.stringify(rows), original);
  assert.equal(workbook.Sheets.Sheet1['!cols'].length, data[3].length);

  const legacy = calculations.getExcelMovementColumns([
    delivery(undefined, 'SAME-DAY-1', '2026-07-22T09:00:00', 1),
    delivery(undefined, 'SAME-DAY-2', '2026-07-22T09:00:00', 1),
    delivery(undefined, undefined, undefined, 1, { id: 'anonymous1' }),
    delivery(undefined, undefined, undefined, 1, { id: 'anonymous2' }),
  ]);
  assert.equal(legacy.length, 4);
  assert.equal(legacy[3].date, 'N/A');
  console.log('Generated Excel verified: ascending dates across months, distinct same-day documents, multi-line movements, adjustment/reversal references, latest codes and reconciled totals.');
}
verify().catch(error => { console.error(error); process.exitCode = 1; });
