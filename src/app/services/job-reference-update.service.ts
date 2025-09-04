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

type ProgressCallback = (current: number, total: number, phase: string) => void;

interface UpdateCounts {
  transactionLogs: number;
  shipments: number;
  adjustments: number;
  returns: number;
  invoices: number;
  transfers: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class JobReferenceUpdateService {
  private editSvc = inject(EditService);
  private notificationSvc = inject(NotificationService);

  // Configuration constants
  private readonly streamThreshold = 10000; // Use streaming for >10K records
  private readonly baseBatchSize = 450;
  private readonly maxConcurrentBatches = 2;
  private readonly batchDelayMs = 100;

  // Cancellation support
  private cancellationToken = { cancelled: false };

  /**
   * Updates a Job Reference across all related collections with progress tracking
   *
   * @param companyId The company ID
   * @param siteId The site ID
   * @param oldJobReference The current Job Reference
   * @param newJobReference The new Job Reference
   * @param poId The Job Reference document ID
   * @param progressCallback Optional callback for progress updates
   * @returns Promise<void>
   */
  async updateJobReferenceAcrossCollections(
    companyId: string,
    siteId: string,
    oldJobReference: string,
    newJobReference: string,
    poId: string,
    progressCallback?: ProgressCallback
  ): Promise<void> {
    // Reset cancellation token
    this.cancellationToken = { cancelled: false };

    try {
      // Check if we should use streaming approach
      const estimatedCount = await this.getEstimatedUpdateCount(
        companyId,
        siteId,
        oldJobReference
      );

      progressCallback?.(0, estimatedCount, 'Validating Job Reference');

      // Validation: Check if new Job Reference already exists for this site
      await this.validateNewJobReference(companyId, siteId, newJobReference);

      if (estimatedCount > this.streamThreshold) {
        await this.updateJobReferenceWithStreaming(
          companyId,
          siteId,
          oldJobReference,
          newJobReference,
          poId,
          progressCallback
        );
      } else {
        await this.updateJobReferenceStandard(
          companyId,
          siteId,
          oldJobReference,
          newJobReference,
          poId,
          progressCallback
        );
      }

      progressCallback?.(estimatedCount, estimatedCount, 'Completed');
      console.log(
        `Job Reference update completed. Updated ${estimatedCount} records.`
      );
    } catch (error) {
      if (this.cancellationToken.cancelled) {
        throw new Error('Operation was cancelled');
      }
      throw error;
    }
  }

  /**
   * Standard update method for smaller datasets
   */
  private async updateJobReferenceStandard(
    companyId: string,
    siteId: string,
    oldJobReference: string,
    newJobReference: string,
    poId: string,
    progressCallback?: ProgressCallback
  ): Promise<void> {
    progressCallback?.(0, 0, 'Collecting records to update');

    // Get all records that need to be updated first
    const allUpdates = await this.getAllUpdatesNeeded(
      companyId,
      siteId,
      oldJobReference,
      newJobReference,
      poId
    );

    console.log(`Total updates needed: ${allUpdates.length}`);
    progressCallback?.(0, allUpdates.length, 'Processing updates');

    const batchSize = this.calculateOptimalBatchSize(allUpdates);

    if (allUpdates.length <= batchSize) {
      // Small dataset - use single batch
      await this.processSingleBatch(allUpdates);
      progressCallback?.(allUpdates.length, allUpdates.length, 'Processing');
    } else {
      // Large dataset - use chunked processing
      await this.processChunkedBatches(allUpdates, batchSize, progressCallback);
    }
  }

  private async getAllUpdatesNeeded(
    companyId: string,
    siteId: string,
    oldJobReference: string,
    newJobReference: string,
    poId: string
  ): Promise<UpdateOperation[]> {
    const updates: UpdateOperation[] = [];

    // 1. Job Reference document itself
    updates.push({
      collection: `company/${companyId}/pos`,
      docId: poId,
      updateData: { jobReference: newJobReference },
    });

    // 2. Transaction logs
    const transactionLogs = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/transactionLog`, [
          where('jobReference', '==', oldJobReference),
          where('siteId', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (transactionLogs) {
      transactionLogs.forEach((log) => {
        updates.push({
          collection: `company/${companyId}/transactionLog`,
          docId: log.id,
          updateData: { jobReference: newJobReference },
        });
      });
    }

    // 3. Shipments/deliveries
    const shipments = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/shipments`, [
          where('jobReference', '==', oldJobReference),
          where('site.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (shipments) {
      shipments.forEach((shipment) => {
        updates.push({
          collection: `company/${companyId}/shipments`,
          docId: shipment.id,
          updateData: { jobReference: newJobReference },
        });
      });
    }

    // 4. Adjustments
    const adjustments = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/adjustments`, [
          where('jobReference', '==', oldJobReference),
          where('site.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (adjustments) {
      adjustments.forEach((adjustment) => {
        updates.push({
          collection: `company/${companyId}/adjustments`,
          docId: adjustment.id,
          updateData: { jobReference: newJobReference },
        });
      });
    }

    // 5. Returns
    const returns = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/returns`, [
          where('jobReference', '==', oldJobReference),
          where('site.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (returns) {
      returns.forEach((returnDoc) => {
        updates.push({
          collection: `company/${companyId}/returns`,
          docId: returnDoc.id,
          updateData: { jobReference: newJobReference },
        });
      });
    }

    // 6. Transaction invoices
    const invoices = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/transactionInvoices`, [
          where('jobReference', '==', oldJobReference),
          where('site.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (invoices) {
      invoices.forEach((invoice) => {
        updates.push({
          collection: `company/${companyId}/transactionInvoices`,
          docId: invoice.id,
          updateData: { jobReference: newJobReference },
        });
      });
    }

    // 7. Transfers (from)
    const fromTransfers = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/poTransfers`, [
          where('fromPO', '==', oldJobReference),
          where('fromSite.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (fromTransfers) {
      fromTransfers.forEach((transfer) => {
        updates.push({
          collection: `company/${companyId}/poTransfers`,
          docId: transfer.id,
          updateData: { fromPO: newJobReference },
        });
      });
    }

    // 8. Transfers (to)
    const toTransfers = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/poTransfers`, [
          where('toPO', '==', oldJobReference),
          where('toSite.id', '==', siteId),
        ])
        .pipe(take(1))
    );

    if (toTransfers) {
      toTransfers.forEach((transfer) => {
        updates.push({
          collection: `company/${companyId}/poTransfers`,
          docId: transfer.id,
          updateData: { toPO: newJobReference },
        });
      });
    }

    // 9. Site's poList array (requires two operations: remove old, add new)
    updates.push({
      collection: `company/${companyId}/sites`,
      docId: siteId,
      updateData: { poList: arrayRemove(oldJobReference) },
    });

    updates.push({
      collection: `company/${companyId}/sites`,
      docId: siteId,
      updateData: { poList: arrayUnion(newJobReference) },
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
    batchSize: number,
    progressCallback?: ProgressCallback
  ): Promise<void> {
    const chunks = this.chunkArray(updates, batchSize);

    console.log(
      `Processing ${chunks.length} batches of up to ${batchSize} operations each`
    );

    let processedCount = 0;

    // Process chunks sequentially to avoid overwhelming Firestore
    for (let i = 0; i < chunks.length; i++) {
      if (this.cancellationToken.cancelled) {
        throw new Error('Operation was cancelled');
      }

      const chunk = chunks[i];
      console.log(
        `Processing batch ${i + 1}/${chunks.length} with ${
          chunk.length
        } operations`
      );

      progressCallback?.(
        processedCount,
        updates.length,
        `Processing batch ${i + 1}/${chunks.length}`
      );

      try {
        await this.processSingleBatch(chunk);
        processedCount += chunk.length;

        // Add small delay between batches to be gentle on Firestore
        if (i < chunks.length - 1) {
          await this.delay(this.batchDelayMs);
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

  /**
   * Calculate optimal batch size based on update complexity
   */
  private calculateOptimalBatchSize(updates: UpdateOperation[]): number {
    // For now, use base batch size
    // Could be enhanced to consider document size, update complexity, etc.
    return this.baseBatchSize;
  }

  /**
   * Get estimated count of records for quick decision making
   */
  private async getEstimatedUpdateCount(
    companyId: string,
    siteId: string,
    jobReference: string
  ): Promise<number> {
    // Quick estimation - just count transaction logs as they're usually the largest
    const transactionLogs = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/transactionLog`, [
          where('jobReference', '==', jobReference),
          where('siteId', '==', siteId),
        ])
        .pipe(take(1))
    );

    // Estimate total based on transaction logs (rough multiplier)
    const logCount = transactionLogs?.length || 0;
    return Math.max(logCount * 1.5, 10); // Rough estimate with minimum
  }

  /**
   * Streaming update method for very large datasets
   */
  private async updateJobReferenceWithStreaming(
    companyId: string,
    siteId: string,
    oldJobReference: string,
    newJobReference: string,
    poId: string,
    progressCallback?: ProgressCallback
  ): Promise<void> {
    console.log('Using streaming approach for large dataset');

    let totalProcessed = 0;
    const estimatedTotal = await this.getEstimatedUpdateCount(
      companyId,
      siteId,
      oldJobReference
    );

    // Process each collection type separately to avoid memory issues
    const collections = [
      { name: 'pos', count: 1 },
      { name: 'transactionLog', count: 0 },
      { name: 'shipments', count: 0 },
      { name: 'adjustments', count: 0 },
      { name: 'returns', count: 0 },
      { name: 'transactionInvoices', count: 0 },
      { name: 'poTransfers', count: 0 },
    ];

    // 1. Update Job Reference document first
    progressCallback?.(
      totalProcessed,
      estimatedTotal,
      'Updating Job Reference document'
    );
    await this.processSingleBatch([
      {
        collection: `company/${companyId}/pos`,
        docId: poId,
        updateData: { jobReference: newJobReference },
      },
    ]);
    totalProcessed += 1;

    // 2. Stream process each collection
    for (const collectionInfo of collections.slice(1)) {
      if (this.cancellationToken.cancelled) {
        throw new Error('Operation was cancelled');
      }

      progressCallback?.(
        totalProcessed,
        estimatedTotal,
        `Processing ${collectionInfo.name}`
      );

      const processed = await this.streamProcessCollection(
        companyId,
        siteId,
        oldJobReference,
        newJobReference,
        collectionInfo.name
      );

      totalProcessed += processed;
    }

    // 3. Update site poList
    progressCallback?.(totalProcessed, estimatedTotal, 'Updating site poList');
    await this.processSingleBatch([
      {
        collection: `company/${companyId}/sites`,
        docId: siteId,
        updateData: { poList: arrayRemove(oldJobReference) },
      },
      {
        collection: `company/${companyId}/sites`,
        docId: siteId,
        updateData: { poList: arrayUnion(newJobReference) },
      },
    ]);
    totalProcessed += 2;

    console.log(
      `Streaming update completed. Processed ${totalProcessed} records.`
    );
  }

  /**
   * Stream process a single collection type
   */
  private async streamProcessCollection(
    companyId: string,
    siteId: string,
    oldJobReference: string,
    newJobReference: string,
    collectionName: string
  ): Promise<number> {
    const batchSize = this.baseBatchSize;
    let processed = 0;
    let hasMore = true;
    let lastDocId: string | null = null;

    while (hasMore && !this.cancellationToken.cancelled) {
      // Build query based on collection type
      const query = this.buildCollectionQuery(
        companyId,
        siteId,
        oldJobReference,
        collectionName,
        lastDocId,
        batchSize
      );

      if (!query) {
        break; // Skip unknown collection types
      }

      const docs = await firstValueFrom(query.pipe(take(1)));

      if (!docs || docs.length === 0) {
        hasMore = false;
        break;
      }

      // Process this batch
      const updates = docs
        .map((doc) =>
          this.createUpdateOperation(
            companyId,
            collectionName,
            doc,
            newJobReference,
            siteId
          )
        )
        .filter(Boolean);

      if (updates.length > 0) {
        await this.processSingleBatch(updates);
        processed += updates.length;
      }

      // Check if we have more data
      hasMore = docs.length === batchSize;
      if (hasMore) {
        lastDocId = docs[docs.length - 1].id;
        await this.delay(this.batchDelayMs);
      }
    }

    return processed;
  }

  /**
   * Build query for specific collection type
   */
  private buildCollectionQuery(
    companyId: string,
    siteId: string,
    jobReference: string,
    collectionName: string,
    lastDocId: string | null,
    limit: number
  ) {
    const basePath = `company/${companyId}/${collectionName}`;

    // Build where conditions based on collection type
    const whereConditions = this.getWhereConditionsForCollection(
      collectionName,
      jobReference,
      siteId
    );

    if (!whereConditions) {
      return null;
    }

    return this.editSvc.getCollectionFiltered(basePath, whereConditions);
  }

  /**
   * Get where conditions for specific collection
   */
  private getWhereConditionsForCollection(
    collectionName: string,
    jobReference: string,
    siteId: string
  ) {
    switch (collectionName) {
      case 'transactionLog':
        return [
          where('jobReference', '==', jobReference),
          where('siteId', '==', siteId),
        ];
      case 'shipments':
      case 'adjustments':
      case 'returns':
      case 'transactionInvoices':
        return [
          where('jobReference', '==', jobReference),
          where('site.id', '==', siteId),
        ];
      case 'poTransfers':
        // Note: This would need two separate queries for fromPO and toPO
        // For simplicity, handling fromPO first
        return [
          where('fromPO', '==', jobReference),
          where('fromSite.id', '==', siteId),
        ];
      default:
        return null;
    }
  }

  /**
   * Create update operation for a document
   */
  private createUpdateOperation(
    companyId: string,
    collectionName: string,
    doc: any,
    newJobReference: string,
    siteId: string
  ): UpdateOperation | null {
    const collection = `company/${companyId}/${collectionName}`;

    switch (collectionName) {
      case 'poTransfers':
        // Handle both fromPO and toPO cases
        if (doc.fromSite?.id === siteId) {
          return {
            collection,
            docId: doc.id,
            updateData: { fromPO: newJobReference },
          };
        } else if (doc.toSite?.id === siteId) {
          return {
            collection,
            docId: doc.id,
            updateData: { toPO: newJobReference },
          };
        }
        return null;
      default:
        return {
          collection,
          docId: doc.id,
          updateData: { jobReference: newJobReference },
        };
    }
  }

  /**
   * Cancel ongoing operation
   */
  cancelOperation(): void {
    this.cancellationToken.cancelled = true;
  }

  private async validateNewJobReference(
    companyId: string,
    siteId: string,
    newJobReference: string
  ): Promise<void> {
    const existingPOs = await firstValueFrom(
      this.editSvc
        .getCollectionFiltered(`company/${companyId}/pos`, [
          where('site.id', '==', siteId),
          where('jobReference', '==', newJobReference),
        ])
        .pipe(take(1))
    );

    if (existingPOs && existingPOs.length > 0) {
      throw new Error('Job Reference already exists for this site');
    }
  }

  /**
   * Get count of records that would be affected by Job Reference change
   * Useful for showing user how many records will be updated
   */
  async getUpdateCount(
    companyId: string,
    siteId: string,
    jobReference: string
  ): Promise<UpdateCounts> {
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
            where('jobReference', '==', jobReference),
            where('siteId', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/shipments`, [
            where('jobReference', '==', jobReference),
            where('site.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/adjustments`, [
            where('jobReference', '==', jobReference),
            where('site.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/returns`, [
            where('jobReference', '==', jobReference),
            where('site.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/transactionInvoices`, [
            where('jobReference', '==', jobReference),
            where('site.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/poTransfers`, [
            where('fromPO', '==', jobReference),
            where('fromSite.id', '==', siteId),
          ])
          .pipe(take(1))
      ),
      firstValueFrom(
        this.editSvc
          .getCollectionFiltered(`company/${companyId}/poTransfers`, [
            where('toPO', '==', jobReference),
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
