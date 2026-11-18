import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { mergeTransactionItems } from './invoice-carry-forward';

exports.invoiceCreated = functions.firestore
  .document('company/{companyId}/transactionInvoices/{id}')
  .onCreate(async (change, context) => {
    try {
      // Batch the writes for better performance
      const batch = admin.firestore().batch();

      const invoice = change.data();
      const endDate = parseDdMmYyyyDate(invoice.endDate);

      endDate.setUTCDate(endDate.getUTCDate() + 1);

      const companyRef = admin
        .firestore()
        .doc(`company/${context.params.companyId}`);

      batch.update(companyRef, {
        totalInvoices: FieldValue.increment(1),
      });

      const newTransactions = mergeTransactionItems(
        invoice.items.filter(
          (item: any) =>
            item.transactionType === 'Delivery' && !item.isConsumable,
        ),
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
          id: itemRef.id,
          deliveryCode: invoice.code,
          isBillingCarryForward: true,
          sourceInvoiceId: context.params.id,
          invoiceStart: Timestamp.fromDate(endDate),
          invoiceEnd: null,
          transactionType: 'Delivery', // Preserve transaction type
          status: 'active',
          billingMode: 'prorate',
          minHireApplied: false,
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

const parseDdMmYyyyDate = (value: unknown): Date => {
  if (!value) {
    throw new Error('Invoice endDate is required');
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (typeof value === 'string') {
    const [dayStr, monthStr, yearStr] = value.split('-');
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);

    if (
      Number.isNaN(day) ||
      Number.isNaN(month) ||
      Number.isNaN(year) ||
      day <= 0 ||
      month <= 0 ||
      month > 12
    ) {
      throw new Error(`Invalid invoice endDate format: ${value}`);
    }

    return new Date(Date.UTC(year, month - 1, day));
  }

  throw new Error(`Unsupported invoice endDate value: ${value}`);
};
