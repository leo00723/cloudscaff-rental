const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync('functions/src/invoice-carry-forward.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText;
const moduleExports = {};
new Function('exports', compiled)(moduleExports);
const { mergeTransactionItems } = moduleExports;
const row = (code, deliveredQty, returnTotal = 0, extra = {}) => ({
  code, itemId: 'shared-historical-id', siteId: 'site', jobReference: 'JR1',
  hireRate: 0.145, deliveredQty, returnTotal,
  balanceQty: deliveredQty - returnTotal, invoiceQty: deliveredQty - returnTotal,
  ...extra,
});
const originals = [row('AL12', 350, 336), row('L12', 52)];
const before = JSON.stringify(originals);
let result = mergeTransactionItems(originals);
assert.equal(result.length, 1);
assert.equal(result[0].deliveredQty, 402);
assert.equal(result[0].balanceQty, 66);

// Repeated invoice cycles must preserve the combined identity and balance.
for (let cycle = 0; cycle < 5; cycle++) result = mergeTransactionItems(result);
assert.equal(result[0].invoiceQty, 66);
assert.equal(JSON.stringify(originals), before);
assert.equal(mergeTransactionItems([row('AL12', 350, 336, { itemId: undefined }), row('L12', 52, 0, { itemId: undefined })]).length, 2);
assert.equal(mergeTransactionItems([row('AL12', 1, 0, { code: undefined }), row('AL12', 2, 0, { code: undefined })]).length, 1);
assert.equal(mergeTransactionItems([row('AL12', 10), row('AL12', 10, 0, { jobReference: 'JR2' })]).length, 2);
assert.equal(mergeTransactionItems([row('AL12', 10), row('AL12', 10, 0, { siteId: 'other' })]).length, 2);
assert.equal(mergeTransactionItems([row('AL12', 10), row('AL12', 10, 0, { hireRate: 0.2 })]).length, 2);
const summed = mergeTransactionItems([row('AL12', '10', '2'), row('AL12', '5', '1')]);
assert.equal(summed.length, 1);
assert.equal(summed[0].deliveredQty, 15);
assert.equal(summed[0].returnTotal, 3);
assert.equal(summed[0].invoiceQty, 12);
assert.deepEqual(mergeTransactionItems([]), []);
console.log('Invoice carry-forward regression checks passed: 350/52 renamed-item merging, repeated cycles, missing identities, scope, rates and numeric quantities.');
for (const [oldCode, newCode, original, returned, extra] of [
  ['AL12', 'L12', 350, 336, 52],
  ['AS10', 'S10', 110, 84, 32],
  ['AS15', 'S15', 30, 18, 4],
  ['AS20', 'S20', 110, 76, 9],
  ['AS25', 'S25', 20, 19, 2],
  ['ASOLB', 'SB', 110, 0, 24],
]) {
  const carryForward = mergeTransactionItems([row(oldCode, original, returned), row(newCode, extra)]);
  assert.equal(carryForward.length, 1);
  assert.equal(carryForward[0].balanceQty, original + extra - returned);
}
console.log('All six renamed code pairs visible in the screenshots merge by inventory ID.');
assert.equal(mergeTransactionItems([
  row('SAME', 10, 0, { itemId: 'first' }),
  row('SAME', 20, 0, { itemId: 'second' }),
]).length, 2, 'identical codes do not combine distinct stock IDs');
