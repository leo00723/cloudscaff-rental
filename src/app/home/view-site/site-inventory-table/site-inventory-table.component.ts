import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { DatatableComponent, SortType } from '@swimlane/ngx-datatable';
import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/internal/operators/take';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

interface LocationWeight {
  location: string;
  weight: number;
}

@Component({
  selector: 'app-site-inventory-table',
  templateUrl: './site-inventory-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteInventoryTableComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() download = new EventEmitter<InventoryItem[]>();
  @Output() downloadHistoryExcel = new EventEmitter<InventoryItem[]>();

  // Input with memoization
  private items: InventoryItem[] = [];
  @Input() set value(data: { items: InventoryItem[]; ids: any }) {
    if (!data.items || !data.ids) {
      return;
    }

    this.ids = data.ids;

    // Only process if items have actually changed
    const itemsChanged =
      JSON.stringify(this.items) !== JSON.stringify(data.items);

    if (itemsChanged) {
      this.items = data.items;
      this.inventoryItems = data.items;
      this.temp = data.items;
      this.calculateWeightsByLocation();

      // Only sync if component is initialized and we have meaningful data
      if (this.loading && this.inventoryItems.length > 0) {
        // Use setTimeout to avoid double syncing on initialization
        setTimeout(() => {
          this.syncMetadata(this.inventoryItems);
        }, 100);
      }
    }
  }

  // Component properties
  ids: any[];
  inventoryItems: InventoryItem[] = [];
  temp: InventoryItem[] = [];
  locationWeights: LocationWeight[] = [];
  hasLocationWeights = false;
  sortType = SortType;
  user: User;
  company: Company;

  // Default row count options
  rowOptions = [7, 10, 50, 100];
  defaultRowLimit = 7;

  syncing = false;

  // Sync optimization properties
  private lastSyncTimestamp = 0;
  private readonly syncCooldown = 5000; // 5 seconds cooldown between syncs
  private syncPromise: Promise<void> | null = null;

  // Services
  private readonly store = inject(Store);
  private readonly editService = inject(EditService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingCtrl = inject(LoadingController);
  private loading: any;

  constructor() {
    this.user = this.store.selectSnapshot(UserState.user);
    this.company = this.store.selectSnapshot(CompanyState.company);
  }

  async ngOnInit(): Promise<void> {
    // Initialize with empty data
    this.calculateWeightsByLocation();

    this.loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      mode: 'ios',
    });

    // Only sync if we have items and IDs, and not already syncing
    if (this.ids && this.inventoryItems?.length > 0) {
      await this.syncMetadata(this.inventoryItems);
    }
  }

  /**
   * Filter inventory items based on search term
   */
  updateFilter(event): void {
    const searchTerm = event.detail.value?.toLowerCase() || '';

    if (!searchTerm) {
      this.temp = this.inventoryItems;
    } else {
      // Optimize search by using direct property access instead of dynamically accessing fields
      this.temp = this.inventoryItems.filter(
        (item) =>
          this.stringIncludesSearchTerm(item.code, searchTerm) ||
          this.stringIncludesSearchTerm(item.category, searchTerm) ||
          this.stringIncludesSearchTerm(item.name, searchTerm) ||
          this.stringIncludesSearchTerm(item.location, searchTerm) ||
          this.stringIncludesSearchTerm(
            item.availableQty?.toString(),
            searchTerm
          )
      );
    }

    // Reset to first page
    if (this.table) {
      this.table.offset = 0;
    }
  }

  /**
   * Helper method to safely check if a string includes a search term
   */
  private stringIncludesSearchTerm(value: any, searchTerm: string): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    return String(value).toLowerCase().includes(searchTerm);
  }

  /**
   * Calculate weights by location with optimized algorithm
   */
  private calculateWeightsByLocation(): void {
    if (!this.inventoryItems?.length) {
      this.locationWeights = [];
      this.hasLocationWeights = false;
      return;
    }

    // Use Map for O(1) lookups
    const locationMap = new Map<string, number>();
    let hasAnyWeight = false;

    // Single pass through data with null checks
    for (const item of this.inventoryItems) {
      if (!item) {
        continue;
      }

      const location = item.location || 'Unspecified';
      const itemWeight = Number(item.weight) || 0;
      const itemQty = Number(item.availableQty) || 0;

      if (itemWeight > 0 && itemQty > 0) {
        hasAnyWeight = true;
        const weight = itemWeight * itemQty;
        locationMap.set(location, (locationMap.get(location) || 0) + weight);
      }
    }

    // Only process further if we have weights
    if (hasAnyWeight) {
      // Convert map to array with formatting in one go
      this.locationWeights = Array.from(locationMap.entries())
        .map(([location, weight]) => ({
          location,
          weight: Number(weight.toFixed(2)),
        }))
        .sort((a, b) => a.location.localeCompare(b.location));

      this.hasLocationWeights = true;
    } else {
      this.locationWeights = [];
      this.hasLocationWeights = false;
    }
  }

  /**
   * Calculate total weight of all items
   * Used directly in template instead of pipe for consistency
   */
  getTotalWeight(): number {
    if (!this.inventoryItems?.length) {
      return 0;
    }

    const total = this.inventoryItems.reduce((sum, item) => {
      if (!item) {
        return sum;
      }
      const weight = Number(item.weight) || 0;
      const qty = Number(item.availableQty) || 0;
      return sum + weight * qty;
    }, 0);

    return Number(total);
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByLocation(index: number, item: LocationWeight): string {
    return item.location;
  }

  /**
   * Optimized metadata sync with debouncing and change detection
   */
  private async syncMetadata(items: InventoryItem[]): Promise<void> {
    // Prevent double syncing with cooldown
    const now = Date.now();
    if (now - this.lastSyncTimestamp < this.syncCooldown) {
      console.log('Sync skipped - too soon after last sync');
      return;
    }

    // Return existing promise if sync is already in progress
    if (this.syncPromise) {
      console.log('Sync already in progress, waiting for completion');
      return this.syncPromise;
    }

    // Create and store the sync promise
    this.syncPromise = this.performSync(items);

    try {
      await this.syncPromise;
    } finally {
      this.syncPromise = null;
      this.lastSyncTimestamp = now;
    }
  }

  /**
   * Performs the actual sync operation
   */
  private async performSync(items: InventoryItem[]): Promise<void> {
    if (!items?.length) {
      return;
    }

    this.loading.present();
    this.syncing = true;

    try {
      const company = this.store.selectSnapshot(CompanyState.company);

      // Get stock items
      const stockItems = await lastValueFrom(
        this.editService
          .getCollection(`company/${company.id}/stockItems`)
          .pipe(take(1))
      );

      // Create a map of stockItems by ID for O(1) lookup
      const stockItemMap = new Map(
        stockItems.map((stockItem) => [stockItem.id, stockItem])
      );

      // Track if any items were actually modified
      let hasChanges = false;
      const itemsToUpdate: InventoryItem[] = [];

      // Process items and detect changes
      for (const item of items) {
        const stockItem = stockItemMap.get(item.id);

        // Create a copy for comparison
        const originalItem = { ...item };

        // Update item properties
        const updatedItem = {
          ...item,
          code: stockItem.code || '',
          category: stockItem.category || '',
          size: stockItem.size || '',
          name: stockItem.name || '',
          location: stockItem.location || '',
          supplier: stockItem.supplier || '',
          type: stockItem.type || '',
          weight: stockItem.weight || '',
          hireCost: stockItem.hireCost || '',
          replacementCost: stockItem.replacementCost || '',
          sellingCost: stockItem.sellingCost || '',
        };

        // Check if any property actually changed
        const fieldsToCheck = [
          'code',
          'category',
          'size',
          'name',
          'location',
          'supplier',
          'type',
          'weight',
          'hireCost',
          'replacementCost',
          'sellingCost',
        ];
        const itemChanged = fieldsToCheck.some(
          (field) => originalItem[field] !== updatedItem[field]
        );

        if (itemChanged) {
          hasChanges = true;
          // Update the original item reference
          Object.assign(item, updatedItem);
          itemsToUpdate.push(item);
        }
      }

      // Only update database if there are actual changes
      if (hasChanges && itemsToUpdate.length > 0) {
        await this.editService.updateDoc(
          `company/${company.id}/siteStock`,
          this.ids[1],
          { items }
        );

        // Trigger recalculation if any field that affects weight calculation changed
        const weightRelatedFieldsChanged = itemsToUpdate.some((item) => {
          const stockItem = stockItemMap.get(item.id);
          return (
            stockItem &&
            (item.location !== stockItem.location ||
              item.weight !== stockItem.weight ||
              item.availableQty !== stockItem.availableQty)
          );
        });

        if (weightRelatedFieldsChanged) {
          this.calculateWeightsByLocation();
        }

        this.notificationService.toast(
          `Metadata synchronized successfully (${itemsToUpdate.length} items updated)`,
          'success'
        );
      } else {
        console.log('No changes detected, skipping database update');
      }
    } catch (error) {
      this.notificationService.toast('Metadata Sync Failed', 'danger');
      console.error('Sync error:', error);
      throw error; // Re-throw to handle in calling code if needed
    } finally {
      this.loading.dismiss();
      this.syncing = false;
    }
  }
}
