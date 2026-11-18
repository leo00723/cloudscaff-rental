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
  { name: 'partial same-site transfer and unmatched movement sharing code', rows: [movement('Delivery', 20), movement('Delivery', 5, { deliveryCode: 'T' }), movement('Return', 5, { returnCode: 'T' }), movement('Return', 3, { returnCode: 'T' })], balance: 17 },
  { name: 'missing codes are not transfers', rows: [movement('Delivery', 10), movement('Return', 2)], balance: 8 },
];
for (const fixture of fixtures) {
  const before = JSON.stringify(fixture.rows);
  const pdf = calculations.consolidateItemDataPDF(fixture.rows, [{ id: 'a', code: 'A', weight: 2 }])["id:a"];
  const excel = calculations.consolidateItemData(fixture.rows, [{ id: 'a', code: 'A', weight: 2 }])["id:a"];
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
assert.equal(calculations.consolidateItemDataPDF(physicalRows, [])["id:a"].currentBalance, 9);
assert.equal(calculations.consolidateItemData(physicalRows, [])["id:a"].currentBalance, 9);
assert.ok(physicalRows.every(row => !row.deliveryCode?.startsWith('INV-')));
assert.equal(calculations.filterInventoryMovements([movement('Delivery', 1)], [{}]).length, 1);
console.log('Invoice carry-forward exclusion passed for PDF/Excel, preserving deliveries, transfers and returns.');
assert.equal(calculations.filterInventoryMovements([
  movement('Delivery', 350, { deliveryCode: 'DEL1' }),
  movement('Delivery', 350, { deliveryCode: 'deleted-invoice', isBillingCarryForward: true }),
], []).length, 1, 'marked billing carry-forwards stay excluded if the invoice is unavailable');

const renamedRows = [
  movement('Delivery', 350, { code: 'AL12', deliveryCode: 'DEL1', deliveryDate: '2026-07-22' }),
  movement('Return', 336, { code: 'AL12', returnDate: '2026-07-23' }),
  movement('Delivery', 52, { code: 'L12', deliveryCode: 'DEL2', deliveryDate: '2026-09-07' }),
  movement('Return', 40, { code: 'AL12', returnDate: '2026-11-18' }),
];
for (const method of ['consolidateItemData', 'consolidateItemDataPDF']) {
  const catalogue = [{ id: 'a', code: 'LATEST12', name: 'Current ledger', weight: 0 }];
  const result = calculations[method](renamedRows, catalogue);
  assert.equal(Object.keys(result).length, 1, 'renamed codes must share a row');
  const item = result['id:a'];
  assert.equal(item.code, 'LATEST12', 'latest catalogue code overrides historical codes');
  assert.equal(item.name, 'Current ledger');
  assert.equal(item.weight, 0, 'zero master weight must not use stale weight');
  assert.equal(item.totalDelivered, 402);
  assert.equal(item.currentBalance, 26);
  assert.equal(item.deliveryMovements[calculations.formatDate('2026-07-22')], 350);
  assert.equal(item.deliveryMovements[calculations.formatDate('2026-09-07')], 52);
  assert.equal(item.returnMovements[calculations.formatDate('2026-11-18')], 40);

  const sharedCode = calculations[method]([
    movement('Delivery', 10, { itemId: 'first', code: 'SAME' }),
    movement('Delivery', 20, { itemId: 'second', code: 'SAME' }),
  ], [{ id: 'first', code: 'FIRST' }, { id: 'second', code: 'SECOND' }]);
  assert.equal(Object.keys(sharedCode).length, 2, 'distinct IDs must stay separate');
  assert.equal(sharedCode['id:first'].code, 'FIRST');
  assert.equal(sharedCode['id:second'].code, 'SECOND');

  const deleted = calculations[method](renamedRows, [{ id: 'unrelated', code: 'AL12', weight: 99 }]);
  assert.equal(deleted['id:a'].code, 'AL12', 'deleted item uses latest movement, not another ID');
  assert.notEqual(deleted['id:a'].weight, 99);

  const legacy = calculations[method]([
    movement('Delivery', 2, { itemId: undefined, code: 'LATEST12' }),
    movement('Delivery', 3, { itemId: 'a', code: 'OLD12' }),
  ], catalogue);
  assert.equal(Object.keys(legacy).length, 1);
  assert.equal(legacy['id:a'].currentBalance, 5);
}
console.log('PDF/Excel identity checks passed: renamed codes, latest catalogue details, dated quantities, shared codes, deleted items and legacy rows.');

// Run the actual transfer writer with an in-memory Firestore batch, then feed its
// output through both export calculations. Source stock has already been invoiced.
async function verifyTransfersFromInvoicedStock() {
  const inventorySource = ts.createSourceFile('inventory.ts', fs.readFileSync(
    'functions/src/inventory.ts', 'utf8'), ts.ScriptTarget.Latest, true);
  const declaration = inventorySource.statements.find(node =>
    ts.isVariableStatement(node) && node.declarationList.declarations.some(
      value => value.name.getText(inventorySource) === 'transferDeliveryTransaction'));
  const writes = [];
  const batch = { set: (ref, data) => writes.push(data), commit: async () => {} };
  const admin = { firestore: () => ({
    batch: () => batch,
    collection: () => ({ doc: () => ({ id: 'transfer-row' }) }),
  }) };
  const writer = new Function('admin', 'toTimestamp', 'logger',
    ts.transpile(declaration.getText(inventorySource), { target: ts.ScriptTarget.ES2020 }) +
    '; return transferDeliveryTransaction;')(admin, date => date, {
      error: error => { throw error; },
    });
  for (const destination of ['same-site', 'other-site']) {
    writes.length = 0;
    const sourceItem = movement('Delivery', 10, {
      deliveryCode: 'INV1', isBillingCarryForward: true, sourceInvoiceId: 'invoice1',
      returnQty: 5,
    });
    await writer({
      id: 'transfer', code: 'TR1', company: { id: 'company' },
      fromSite: { id: 'same-site' }, toSite: { id: destination },
      fromJobReference: 'JR1', toJobReference: 'JR2', transferDate: '2026-11-18',
      items: [sourceItem],
    });
    assert.equal(writes.length, 1);
    const transferred = writes[0];
    assert.equal(transferred.isBillingCarryForward, false);
    assert.equal(transferred.sourceInvoiceId, null);
    assert.equal(transferred.itemId, 'a');
    assert.equal(transferred.siteId, destination);
    assert.equal(transferred.deliveredQty, 5);
    assert.equal(sourceItem.isBillingCarryForward, true, 'source must remain billing-only');
    const physical = calculations.filterInventoryMovements([sourceItem, transferred], [{ code: 'INV1' }]);
    assert.deepEqual(physical, [transferred], 'exclude invoice renewal but retain transfer');
    for (const method of ['consolidateItemData', 'consolidateItemDataPDF']) {
      assert.equal(calculations[method](physical, [])['id:a'].currentBalance, 5);
      if (destination === 'same-site') {
        const siteRows = calculations.filterInventoryMovements([
          movement('Delivery', 10, { deliveryCode: 'DEL1' }), sourceItem,
          movement('Return', 5, { returnCode: 'TR1' }), transferred,
        ], [{ code: 'INV1' }]);
        assert.equal(calculations[method](siteRows, [])['id:a'].currentBalance, 10,
          'same-site job-reference transfer must preserve inventory');
      }
    }
  }
  console.log('Actual transfer-writer regression passed: invoiced stock remains included in PDF/Excel and same-site balance is preserved.');
}
verifyTransfersFromInvoicedStock().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
