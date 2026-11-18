const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Exercise the page's pure export calculations without bootstrapping Ionic/Firebase.
const source = ts.createSourceFile('page.ts', fs.readFileSync(
  'src/app/home/view-site/view-site.page.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const page = source.statements.find(node => ts.isClassDeclaration(node));
const names = ['consolidateItemData', 'consolidateItemDataPDF', 'getTimestamp', 'formatDate', 'filterInventoryMovements'];
const methods = page.members.filter(node => names.includes(node.name?.getText(source)));
const compiled = ts.transpile(`class Calculations { ${methods.map(node => node.getText(source)).join('\n')} }`,
  { target: ts.ScriptTarget.ES2020 });
const calculations = new Function(`${compiled}; return new Calculations();`)();
const movement = (transactionType, quantity, extra = {}) => ({
  code: 'A', itemId: 'a', transactionType,
  deliveryDate: transactionType === 'Delivery' ? '2026-11-01' : undefined,
  returnDate: transactionType !== 'Delivery' ? '2026-11-02' : undefined,
  ...(transactionType === 'Delivery' ? { deliveredQty: quantity } : { returnQty: quantity }),
  ...extra,
});
const fixtures = [
  { name: 'numeric strings', rows: [movement('Delivery', '10'), movement('Delivery', '5'), movement('Return', '3')], balance: 12 },
  { name: 'individual signed adjustments', rows: [movement('Delivery', 20), movement('Adjustment', 3, { adjustmentTotal: 3 }), movement('Adjustment', 2, { adjustmentTotal: 5 }), movement('Adjustment', -1, { adjustmentTotal: 4 })], balance: 16 },
  { name: 'zero adjustment', rows: [movement('Delivery', 10), movement('Adjustment', 0, { adjustmentTotal: 5 })], balance: 10 },
  { name: 'overage reversal', rows: [movement('Delivery', 10), movement('Return', 4), movement('Overage Return', 3), movement('Overage Return Reversal', 2)], balance: 5 },
  { name: 'partial same-site transfer and unmatched movement sharing code', rows: [movement('Delivery', 20), movement('Delivery', 5, { deliveryCode: 'T' }), movement('Return', 5, { returnCode: 'T' }), movement('Return', 3, { returnCode: 'T', itemId: 'other' })], balance: 17 },
  { name: 'missing codes are not transfers', rows: [movement('Delivery', 10), movement('Return', 2)], balance: 8 },
];
for (const fixture of fixtures) {
  const before = JSON.stringify(fixture.rows);
  const pdf = calculations.consolidateItemDataPDF(fixture.rows, [{ code: 'A', weight: 2 }]).A;
  const excel = calculations.consolidateItemData(fixture.rows, [{ code: 'A', weight: 2 }]).A;
  assert.equal(pdf.currentBalance, fixture.balance, `${fixture.name}: PDF`);
  assert.equal(excel.currentBalance, fixture.balance, `${fixture.name}: Excel`);
  assert.equal(excel.totalDelivered - excel.totalReturned, fixture.balance);
  assert.equal(Object.values(excel.deliveryMovements).reduce((a, b) => a + b, 0), excel.totalDelivered);
  assert.equal(Object.values(excel.returnMovements).reduce((a, b) => a + b, 0), excel.totalReturned);
  assert.equal(pdf.weight, 2);
  assert.equal(JSON.stringify(fixture.rows), before, 'must not reorder input');
}
console.log(`${fixtures.length} site inventory export regression scenarios passed (PDF and Excel).`);

const originalDelivery = movement('Delivery', 10, { deliveryCode: 'DEL-1', deliveryId: 'original' });
const invoiceRows = [
  originalDelivery,
  movement('Delivery', 10, { deliveryCode: 'INV-1', deliveryId: 'original' }),
  movement('Delivery', 10, { deliveryCode: 'INV-2', deliveryId: 'original' }),
  movement('Return', 3, { returnCode: 'RET-1' }),
  movement('Delivery', 2, { deliveryCode: 'TRANSFER-1' }),
];
const physicalRows = calculations.filterInventoryMovements(invoiceRows, [
  { code: 'INV-1' }, { code: 'INV-2' }, {},
]);
assert.equal(physicalRows.length, 3);
assert.equal(physicalRows[0], originalDelivery);
assert.equal(calculations.consolidateItemDataPDF(physicalRows, []).A.currentBalance, 9);
assert.equal(calculations.consolidateItemData(physicalRows, []).A.currentBalance, 9);
assert.ok(physicalRows.every(row => !row.deliveryCode?.startsWith('INV-')));
assert.equal(calculations.filterInventoryMovements([movement('Delivery', 1)], [{}]).length, 1);
console.log('Invoice carry-forward exclusion passed for PDF/Excel, preserving deliveries, transfers and returns.');
