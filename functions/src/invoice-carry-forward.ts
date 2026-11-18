/** Consolidate billing continuations without combining distinct stock identities or rates. */
export const mergeTransactionItems = (items: any[]): any[] => {
  const mergedItems = new Map<string, any>();
  (items || []).forEach((item, index) => {
    // Code changes do not create a new inventory item. Keep billing scope/rates
    // separate, and never merge rows sharing only a missing itemId.
    const key = item.itemId
      ? JSON.stringify([
          item.siteId, item.jobReference, item.itemId,
          Number(item.hireRate) || 0, item.type || '',
        ])
      : `unidentified:${index}`;
    const existing = mergedItems.get(key);
    const quantities = [
      'deliveredQty', 'invoiceQty', 'balanceQty', 'adjustmentTotal', 'returnTotal',
    ];
    if (!existing) {
      const copy = { ...item };
      quantities.forEach(field => { copy[field] = Number(item[field]) || 0; });
      mergedItems.set(key, copy);
      return;
    }
    quantities.forEach(field => {
      existing[field] += Number(item[field]) || 0;
    });
  });
  return Array.from(mergedItems.values());
};
