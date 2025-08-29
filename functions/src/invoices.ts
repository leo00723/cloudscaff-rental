import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

exports.invoiceCreated = functions.firestore
  .document('company/{companyId}/transactionInvoices/{id}')
  .onCreate(async (change, context) => {
    try {
      // Batch the writes for better performance
      const batch = admin.firestore().batch();

      const invoice = change.data();
      const endDate = new Date(invoice.endDate);
      endDate.setDate(endDate.getDate() + 1);

      const companyRef = admin
        .firestore()
        .doc(`company/${context.params.companyId}`);

      batch.update(companyRef, {
        totalInvoices: FieldValue.increment(1),
      });

      const newTransactions = mergeTransactionItems(
        invoice.items.filter((item: any) => item.transactionType === 'Delivery')
      );

      newTransactions.forEach((item) => {
        // Create a new document reference with auto-generated ID
        const itemRef = admin
          .firestore()
          .collection(`company/${context.params.companyId}/transactionLog`)
          .doc();
        // Add the set operation to the batch
        batch.set(itemRef, {
          ...item,
          deliveryCode: invoice.code,
          invoiceStart: Timestamp.fromDate(endDate),
          transactionType: 'Delivery', // Preserve transaction type
          status: 'active',
        });
      });

      invoice.items.forEach((item: any) => {
        const itemRef = admin
          .firestore()
          .doc(`company/${context.params.companyId}/transactionLog/${item.id}`);
        batch.update(itemRef, {
          ...item,
          status: 'complete',
        });
      });

      await batch.commit(); // Commit the batch

      return '200';
    } catch (error) {
      logger.error(error);
      return error;
    }
  });

const mergeTransactionItems = (items: any[]) => {
  // Early return if empty array
  if (!items?.length) {
    return [];
  }

  // Use map to track merged items by itemId
  const mergedItemsMap = new Map<string, any>();

  // Process each item
  items.forEach((item) => {
    // If we already have an item with this itemId, merge the values
    if (mergedItemsMap.has(item.itemId)) {
      const existingItem = mergedItemsMap.get(item.itemId);

      // Update numeric values by adding them together if they exist
      existingItem.deliveredQty =
        (existingItem.deliveredQty || 0) + (item.deliveredQty || 0);
      existingItem.invoiceQty =
        (existingItem.invoiceQty || 0) + (item.invoiceQty || 0);
      existingItem.balanceQty =
        (existingItem.balanceQty || 0) + (item.balanceQty || 0);
      existingItem.adjustmentTotal =
        (existingItem.adjustmentTotal || 0) + (item.adjustmentTotal || 0);
      existingItem.returnTotal =
        (existingItem.returnTotal || 0) + (item.returnTotal || 0);

      // Keep non-numeric fields from the first occurrence
      // unless they're missing, then take from current item
      existingItem.name = existingItem.name || item.name;
      existingItem.category = existingItem.category || item.category;
      existingItem.code = existingItem.code || item.code;
      existingItem.size = existingItem.size || item.size;
      existingItem.location = existingItem?.location || item?.location;
    } else {
      // Create a new object to avoid mutating the original
      mergedItemsMap.set(item.itemId, { ...item });
    }
  });

  // Convert map values to array
  return Array.from(mergedItemsMap.values());
};
