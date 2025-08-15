import { Injectable, inject } from '@angular/core';
import { arrayRemove, arrayUnion, where } from '@angular/fire/firestore';
import { take, firstValueFrom } from 'rxjs';
import { EditService } from './edit.service';
import { NotificationService } from './notification.service';

interface UpdateOperation {
  collection: string;
  docId: string;
  updateData: any;
}

@Injectable({
  providedIn: 'root',
})
export class POUpdateService {
  private editSvc = inject(EditService);
  private notificationSvc = inject(NotificationService);

  /**
   * Updates a PO number across all related collections
   *
   * @param companyId The company ID
   * @param siteId The site ID
   * @param oldPONumber The current PO number
   * @param newPONumber The new PO number
   * @param poId The PO document ID
   * @returns Promise<void>
   */
  async updatePONumberAcrossCollections(
    companyId: string,
    siteId: string,
    oldPONumber: string,
    newPONumber: string,
    poId: string
  ): Promise<void> {
    // Validation: Check if new PO number already exists for this site
    await this.validateNewPONumber(companyId, siteId, newPONumber);

    // Get all records that need to be updated first
    const allUpdates = await this.getAllUpdatesNeeded(
      companyId,
      siteId,
      oldPONumber,
      newPONumber,
      poId
    );

    console.log(`Total updates needed: ${allUpdates.length}`);

    // If we have more than 450 updates (leaving buffer for safety), process in chunks
    const BATCH_SIZE = 450; // Leave some buffer below the 500 limit

    if (allUpdates.length <= BATCH_SIZE) {
      // Small dataset - use single batch
      await this.processSingleBatch(allUpdates);
    } else {
      // Large dataset - use chunked processing
      await this.processChunkedBatches(allUpdates, BATCH_SIZE);
    }

    console.log(
      `PO number update completed. Updated ${allUpdates.length} records.`
    );
  }

  private async getAllUpdatesNeeded(
    companyId: string,
    siteId: string,
    oldPONumber: string,
    newPONumber: string,
    poId: string
  ): Promise<UpdateOperation[]> {
    const updates: UpdateOperation[] = [];

    // 1. PO document itself
    updates.push({
      collection: `company/${companyId}/pos`,
      docId: poId,
      updateData: { poNumber: newPONumber },
    });

    // 2. Transaction logs
    const transactionLogs = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/transactionLog`, [
          where('poNumber', '==', oldPONumber),
          where('siteId', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (transactionLogs) {
      transactionLogs.forEach((log) => {
        updates.push({
          collection: `company/${companyId}/transactionLog`,
          docId: log.id,
          updateData: { poNumber: newPONumber },
        });
      });
    }

    // 3. Shipments/deliveries
    const shipments = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/shipments`, [
          where('poNumber', '==', oldPONumber),
          where('site.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (shipments) {
      shipments.forEach((shipment) => {
        updates.push({
          collection: `company/${companyId}/shipments`,
          docId: shipment.id,
          updateData: { poNumber: newPONumber },
        });
      });
    }

    // 4. Adjustments
    const adjustments = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/adjustments`, [
          where('poNumber', '==', oldPONumber),
          where('site.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (adjustments) {
      adjustments.forEach((adjustment) => {
        updates.push({
          collection: `company/${companyId}/adjustments`,
          docId: adjustment.id,
          updateData: { poNumber: newPONumber },
        });
      });
    }

    // 5. Returns
    const returns = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/returns`, [
          where('poNumber', '==', oldPONumber),
          where('site.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (returns) {
      returns.forEach((returnDoc) => {
        updates.push({
          collection: `company/${companyId}/returns`,
          docId: returnDoc.id,
          updateData: { poNumber: newPONumber },
        });
      });
    }

    // 6. Transaction invoices
    const invoices = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/transactionInvoices`, [
          where('poNumber', '==', oldPONumber),
          where('site.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (invoices) {
      invoices.forEach((invoice) => {
        updates.push({
          collection: `company/${companyId}/transactionInvoices`,
          docId: invoice.id,
          updateData: { poNumber: newPONumber },
        });
      });
    }

    // 7. Transfers (from)
    const fromTransfers = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/poTransfers`, [
          where('fromPO', '==', oldPONumber),
          where('fromSite.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (fromTransfers) {
      fromTransfers.forEach((transfer) => {
        updates.push({
          collection: `company/${companyId}/poTransfers`,
          docId: transfer.id,
          updateData: { fromPO: newPONumber },
        });
      });
    }

    // 8. Transfers (to)
    const toTransfers = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/poTransfers`, [
          where('toPO', '==', oldPONumber),
          where('toSite.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (toTransfers) {
      toTransfers.forEach((transfer) => {
        updates.push({
          collection: `company/${companyId}/poTransfers`,
          docId: transfer.id,
          updateData: { toPO: newPONumber },
        });
      });
    }

    // 9. Site's poList array (requires two operations: remove old, add new)
    updates.push({
      collection: `company/${companyId}/sites`,
      docId: siteId,
      updateData: { poList: arrayRemove(oldPONumber) },
    });

    updates.push({
      collection: `company/${companyId}/sites`,
      docId: siteId,
      updateData: { poList: arrayUnion(newPONumber) },
    });

    return updates;
  }

  private async processSingleBatch(updates: UpdateOperation[]): Promise<void> {
    const batch = this.editSvc.batch();

    updates.forEach((update) => {
      const docRef = this.editSvc.docRef(update.collection, update.docId);
      batch.update(docRef, update.updateData);
    });

    await batch.commit();
  }

  private async processChunkedBatches(
    updates: UpdateOperation[],
    batchSize: number
  ): Promise<void> {
    const chunks = this.chunkArray(updates, batchSize);

    console.log(
      `Processing ${chunks.length} batches of up to ${batchSize} operations each`
    );

    // Process chunks sequentially to avoid overwhelming Firestore
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(
        `Processing batch ${i + 1}/${chunks.length} with ${
          chunk.length
        } operations`
      );

      try {
        await this.processSingleBatch(chunk);

        // Add small delay between batches to be gentle on Firestore
        if (i < chunks.length - 1) {
          await this.delay(100); // 100ms delay
        }
      } catch (error) {
        console.error(`Error processing batch ${i + 1}:`, error);
        throw new Error(`Failed to process batch ${i + 1}: ${error.message}`);
      }
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async validateNewPONumber(
    companyId: string,
    siteId: string,
    newPONumber: string
  ): Promise<void> {
    const existingPOs = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/pos`, [
          where('site.id', '==', siteId),
          where('poNumber', '==', newPONumber),
        ])
        .pipe(take(1))
    );

    if (existingPOs && existingPOs.length > 0) {
      throw new Error('PO number already exists for this site');
    }
  }

  /**
   * Get count of records that would be affected by PO number change
   * Useful for showing user how many records will be updated
   */
  async getUpdateCount(
    companyId: string,
    siteId: string,
    poNumber: string
  ): Promise<{
    transactionLogs: number;
    shipments: number;
    adjustments: number;
    returns: number;
    invoices: number;
    transfers: number;
    total: number;
  }> {
    const [
      transactionLogs,
      shipments,
      adjustments,
      returns,
      invoices,
      fromTransfers,
      toTransfers,
    ] = await Promise.all([
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/transactionLog`, [
            where('poNumber', '==', poNumber),
            where('siteId', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/shipments`, [
            where('poNumber', '==', poNumber),
            where('site.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/adjustments`, [
            where('poNumber', '==', poNumber),
            where('site.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/returns`, [
            where('poNumber', '==', poNumber),
            where('site.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/transactionInvoices`, [
            where('poNumber', '==', poNumber),
            where('site.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/poTransfers`, [
            where('fromPO', '==', poNumber),
            where('fromSite.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/poTransfers`, [
            where('toPO', '==', poNumber),
            where('toSite.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
    ]);

    const counts = {
      transactionLogs: transactionLogs?.length || 0,
      shipments: shipments?.length || 0,
      adjustments: adjustments?.length || 0,
      returns: returns?.length || 0,
      invoices: invoices?.length || 0,
      transfers: (fromTransfers?.length || 0) + (toTransfers?.length || 0),
      total: 0,
    };

    counts.total =
      counts.transactionLogs +
      counts.shipments +
      counts.adjustments +
      counts.returns +
      counts.invoices +
      counts.transfers +
      2; // +2 for the site poList operations

    return counts;
  }
}
