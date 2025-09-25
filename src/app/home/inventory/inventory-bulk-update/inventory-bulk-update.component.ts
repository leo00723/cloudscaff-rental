import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import { increment, orderBy } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  lastValueFrom,
  map,
  Subject,
  take,
  takeUntil,
} from 'rxjs';

import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MultiuploaderComponent } from '../../../components/multiuploader/multiuploader.component';
import { BulkUpdate } from 'src/app/models/bulk-update.model';

export interface BulkUpdateComponentState {
  items: InventoryItem[];
  itemBackup: InventoryItem[];
  bulkUpdate: BulkUpdate;
  loading: boolean;
  viewAll: boolean;
  searching: boolean;
  readonly: boolean;
  totalItemCount: number;
}

type EditableField =
  | 'code'
  | 'category'
  | 'size'
  | 'name'
  | 'location'
  | 'weight'
  | 'shipmentQty'
  | 'hireCost'
  | 'replacementCost'
  | 'sellingCost'
  | 'supplier'
  | 'lowPercentage'
  | 'type';

@Component({
  selector: 'app-inventory-bulk-update',
  templateUrl: './inventory-bulk-update.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryBulkUpdateComponent implements OnInit, OnDestroy {
  @ViewChild(MultiuploaderComponent) uploader!: MultiuploaderComponent;
  @Input() isEdit = false;
  @Input() set value(val: BulkUpdate) {
    if (val) {
      this.state.bulkUpdate = { ...val };
      this.cdr.markForCheck();
    }
  }

  // Component state
  state: BulkUpdateComponentState = {
    items: [],
    itemBackup: [],
    bulkUpdate: {
      type: '',
      status: 'pending',
      uploads: [],
      date: new Date(),
    },
    loading: false,
    viewAll: false, // Changed to false by default - only show items with quantities
    searching: false,
    readonly: false,
    totalItemCount: 0,
  };

  form!: FormGroup;
  user!: User;
  company!: Company;

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();
  private readonly inventoryItems$ = new BehaviorSubject<InventoryItem[]>([]);
  private isInitialized = false;

  // Editable fields configuration
  private readonly editableFields: readonly EditableField[] = [
    'code',
    'category',
    'size',
    'name',
    'location',
    'supplier',
    'weight',
    'shipmentQty',
    'hireCost',
    'replacementCost',
    'sellingCost',
    'lowPercentage',
    'type',
  ] as const;

  private readonly numericFields = new Set<string>([
    'weight',
    'shipmentQty',
    'hireCost',
    'replacementCost',
    'sellingCost',
    'lowPercentage',
  ]);

  constructor(
    private readonly masterSvc: MasterService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.initializeUserAndCompany();
    this.setupSearchDebounce();
  }

  async ngOnInit(): Promise<void> {
    try {
      this.setLoading(true);
      this.initForm();

      // Load inventory items first
      await this.loadInventoryItems();

      if (this.isEdit) {
        await this.initEditMode();
      } else {
        await this.initCreateMode();
      }

      this.isInitialized = true;
    } catch (error) {
      this.handleError('Error initializing component', error);
    } finally {
      this.setLoading(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.inventoryItems$.complete();
  }

  // Track by function for ngFor performance
  trackByFn: TrackByFunction<InventoryItem> = (
    index: number,
    item: InventoryItem
  ) => item.id || index;

  // Event handlers
  onSearch(event: any): void {
    const searchTerm = event.detail.value?.toLowerCase().trim() || '';
    this.searchSubject.next(searchTerm);
  }

  onViewAllToggle(): void {
    if (!this.isInitialized || this.bulkUpdate.status !== 'pending') {
      return;
    }

    this.state.viewAll = !this.state.viewAll;
    this.cdr.markForCheck();
  }

  onFieldChange(field: EditableField, event: any, item: InventoryItem): void {
    if (this.state.readonly) {
      return;
    }

    const value = event.detail?.value ?? event.target?.value;
    if (value === undefined || value === null) {
      return;
    }

    const updatedItem: any = { ...item, hasMetaUpdate: true };

    if (this.numericFields.has(field)) {
      updatedItem[field as keyof InventoryItem] = this.parseNumericValue(
        value
      ) as any;
    } else {
      updatedItem[field as keyof InventoryItem] = value as any;
    }

    this.updateItem(updatedItem);

    this.calculateTotalItemCount();
    this.scheduleAutoSave();
  }

  onClose(): void {
    this.masterSvc.modal().dismiss();
  }

  // CRUD operations
  onCreate(): void {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.setLoading(true);
      try {
        await this.prepareBulkUpdateForSave();
        await this.generateDocumentCode();
        await this.uploadFiles();

        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.company.id}/bulkUpdates`,
            this.state.bulkUpdate
          );

        this.showSuccessMessage('Document created successfully');
        this.onClose();
      } catch (error) {
        this.handleError(
          'Something went wrong creating document. Please try again!',
          error
        );
      } finally {
        this.setLoading(false);
      }
    });
  }

  onUpdate(status: string): void {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.setLoading(true);
      try {
        await this.prepareBulkUpdateForSave();
        this.state.bulkUpdate.status = status;
        await this.uploadFiles();

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/bulkUpdates`,
            this.state.bulkUpdate.id,
            this.state.bulkUpdate
          );

        this.showSuccessMessage('Document updated successfully');
      } catch (error) {
        this.handleError(
          'Something went wrong updating the document. Please try again!',
          error
        );
      } finally {
        this.setLoading(false);
      }
    });
  }

  onApprove(): void {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.setLoading(true);
      try {
        await this.prepareBulkUpdateForSave();
        await this.uploadFiles();
        const approvedRequest: BulkUpdate = {
          ...this.state.bulkUpdate,
          items: cloneDeep(this.state.bulkUpdate.items),
          status: 'approved',
        };

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/bulkUpdates`,
            this.state.bulkUpdate.id,
            approvedRequest
          );

        this.masterSvc.modal().dismiss(true, 'approved');
      } catch (error) {
        this.handleError(
          'Something went wrong approving document. Please try again!',
          error
        );
      } finally {
        this.setLoading(false);
      }
    });
  }
  onReverse(): void {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.setLoading(true);
      try {
        await this.prepareBulkUpdateForSave();
        this.state.bulkUpdate.items = this.reverseItems();
        await this.uploadFiles();
        const reversedRequest: BulkUpdate = {
          ...this.state.bulkUpdate,
          items: cloneDeep(this.state.bulkUpdate.items),
          status: 'reversed',
          code: `${this.state.bulkUpdate.code}-R`,
        };

        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/bulkUpdates`,
            this.state.bulkUpdate.id,
            reversedRequest
          );

        this.masterSvc.modal().dismiss(true, 'approved');
      } catch (error) {
        this.handleError(
          'Something went wrong reversing document. Please try again!',
          error
        );
      } finally {
        this.setLoading(false);
      }
    });
  }

  async onDownloadPicklist(): Promise<void> {
    try {
      const filteredItems = this.getFilteredItemsForPicklist();
      const documentData = this.isEdit
        ? this.state.bulkUpdate
        : { ...this.form.value, code: 'N/A', date: new Date() };

      const pdf = await this.masterSvc
        .pdf()
        .pickList(documentData, filteredItems, this.company);
      const filename = this.isEdit
        ? `Picklist-${this.state.bulkUpdate.code}`
        : `Picklist-${documentData.site?.name || 'New'}`;

      this.masterSvc.pdf().handlePdf(pdf, filename);
    } catch (error) {
      this.handleError('Error generating picklist', error);
    }
  }

  // Getters for template
  get items(): InventoryItem[] {
    return this.state.items;
  }

  get bulkUpdate(): BulkUpdate {
    return this.state.bulkUpdate;
  }

  get loading(): boolean {
    return this.state.loading;
  }

  get viewAll(): boolean {
    return this.state.viewAll;
  }

  get searching(): boolean {
    return this.state.searching;
  }

  get readonly(): boolean {
    return this.state.readonly;
  }

  get totalItemCount(): number {
    return this.state.totalItemCount;
  }

  get canEdit(): boolean {
    return !this.readonly && !this.loading;
  }

  get showActionButtons(): boolean {
    return !['sent', 'void', 'received'].includes(this.state.bulkUpdate.status);
  }

  get canVoid(): boolean {
    return (
      this.isEdit &&
      !['void', 'approved', 'reversed'].includes(this.state.bulkUpdate.status)
    );
  }

  get canApprove(): boolean {
    return (
      this.isEdit &&
      this.bulkUpdate.status === 'pending' &&
      this.user.permissionsList.includes('Super Admin')
    );
  }

  get canReverse(): boolean {
    return (
      this.isEdit &&
      this.bulkUpdate.status === 'approved' &&
      this.user.permissionsList.includes('Super Admin')
    );
  }

  get canUpdate(): boolean {
    return this.isEdit && this.state.bulkUpdate.status === 'pending';
  }

  get canSubmit(): boolean {
    return this.isEdit && this.state.bulkUpdate.status === 'pending';
  }

  get shouldShowUploads(): boolean {
    return Boolean(
      this.state.bulkUpdate.uploads && this.state.bulkUpdate.uploads.length > 0
    );
  }

  get shouldShowUploader(): boolean {
    return !['sent', 'void', 'received'].includes(this.state.bulkUpdate.status);
  }

  // Form field getter
  getField(field: string): FormControl {
    return this.form.get(field) as FormControl;
  }

  // Item visibility logic
  shouldShowItem(item: InventoryItem): boolean {
    if (!this.isInitialized) {
      return false;
    }

    return (
      this.state.viewAll ||
      item?.hasMetaUpdate ||
      (item.shipmentQty !== null &&
        item.shipmentQty !== undefined &&
        item.shipmentQty !== 0)
    );
  }

  // Private methods
  private initializeUserAndCompany(): void {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  private async loadInventoryItems(): Promise<void> {
    try {
      const items = await lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${this.company.id}/stockItems`, [
            orderBy('category', 'asc'),
            orderBy('name', 'asc'),
            orderBy('size', 'asc'),
          ])
          .pipe(
            take(1),
            map((data) => data.map((item) => this.cleanInventoryItem(item)))
          )
      );

      this.inventoryItems$.next(items);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      this.inventoryItems$.next([]);
    }
  }

  private cleanInventoryItem(item: InventoryItem): InventoryItem {
    const cleanedItem = { ...item };
    delete cleanedItem.log;
    cleanedItem.shipmentQty = null;
    return cleanedItem;
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.performSearch(searchTerm);
      });
  }

  private performSearch(searchTerm: string): void {
    if (!this.state.itemBackup.length) {
      this.state.itemBackup = [...this.state.items];
    }

    this.state.searching = Boolean(searchTerm);

    if (!searchTerm) {
      this.state.items = [...this.state.itemBackup];
    } else {
      this.state.items = this.state.itemBackup.filter((item) =>
        this.searchInItem(item, searchTerm)
      );
    }

    this.cdr.markForCheck();
  }

  private searchInItem(item: InventoryItem, searchTerm: string): boolean {
    const searchableFields: (keyof InventoryItem)[] = [
      'code',
      'name',
      'category',
      'size',
      'location',
      'supplier',
      'type',
    ];
    return searchableFields.some((field) =>
      item[field]?.toString().toLowerCase().includes(searchTerm)
    );
  }

  private async initCreateMode(): Promise<void> {
    const stockItems = this.inventoryItems$.value;
    this.state.items = [...stockItems];
    this.state.readonly = false;
    this.state.viewAll = false; // Start with full view for create mode
    this.cdr.markForCheck();
  }

  private async initEditMode(): Promise<void> {
    this.state.readonly = this.state.bulkUpdate.status !== 'pending';
    this.state.bulkUpdate.date = new Date();
    if (['pending', 'reversed'].includes(this.state.bulkUpdate.status)) {
      await this.mergeWithCurrentInventory();
    } else {
      this.state.items = [...(this.state.bulkUpdate.items || [])];
    }

    // For edit mode, show items that have quantities by default
    this.state.viewAll = false;
    this.calculateTotalItemCount();
    this.cdr.markForCheck();
  }

  private async mergeWithCurrentInventory(): Promise<void> {
    const stockItems = [...this.inventoryItems$.value];

    if (this.state.bulkUpdate.items?.length) {
      this.state.bulkUpdate.items.forEach((savedItem) => {
        const inventoryItem = stockItems.find(
          (item) => item.id === savedItem.id
        );
        if (inventoryItem) {
          this.updateInventoryItemWithSavedData(inventoryItem, savedItem);
        }
      });
    }

    this.state.items = stockItems;
  }

  private updateInventoryItemWithSavedData(
    inventoryItem: any,
    savedItem: InventoryItem
  ): void {
    const fieldsToUpdate: (keyof InventoryItem)[] = [
      'code',
      'category',
      'size',
      'name',
      'location',
      'supplier',
      'weight',
      'shipmentQty',
      'hireCost',
      'replacementCost',
      'sellingCost',
      'lowPercentage',
      'type',
      'hasMetaUpdate',
    ];

    fieldsToUpdate.forEach((field) => {
      if (savedItem[field] !== undefined && savedItem[field] !== null) {
        inventoryItem[field] = this.numericFields.has(field as string)
          ? Number(savedItem[field]) || 0
          : savedItem[field];
      }
    });
  }

  private initForm(): void {
    if (this.isEdit) {
      this.form = this.masterSvc.fb().group({
        company: [this.company, Validators.required],
        status: [this.state.bulkUpdate.status, Validators.required],
        updatedBy: [this.user.id, Validators.required],
        updatedByName: [this.user.name, Validators.required],
        notes: [this.state.bulkUpdate.notes || ''],
      });
    } else {
      this.form = this.masterSvc.fb().group({
        company: [this.company, Validators.required],
        status: ['pending', Validators.required],
        createdBy: [this.user.id, Validators.required],
        createdByName: [this.user.name, Validators.required],
        notes: [''],
      });
    }
  }

  private updateItem(updatedItem: InventoryItem): void {
    const index = this.state.items.findIndex(
      (item) => item.id === updatedItem.id
    );
    if (index !== -1) {
      this.state.items[index] = updatedItem;

      // Also update backup if it exists
      if (this.state.itemBackup.length > 0) {
        const backupIndex = this.state.itemBackup.findIndex(
          (item) => item.id === updatedItem.id
        );
        if (backupIndex !== -1) {
          this.state.itemBackup[backupIndex] = updatedItem;
        }
      }

      this.cdr.markForCheck();
    }
  }

  private parseNumericValue(value: any): number {
    if (value === '' || value === null || value === undefined) {
      return 0;
    }
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? 0 : parsed;
  }

  private calculateTotalItemCount(): void {
    this.state.totalItemCount = this.state.items.reduce((total, item) => {
      const qty = item.shipmentQty || 0;
      return total + qty;
    }, 0);
  }

  private autoSaveTimeout: any;
  private scheduleAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.performAutoSave();
    }, 500); // Auto-save after 1 second of inactivity
  }

  private async performAutoSave(): Promise<void> {
    if (this.state.bulkUpdate.status === 'submitted' || this.state.loading) {
      return;
    }

    try {
      if (this.isEdit && this.state.bulkUpdate.status === 'pending') {
        await this.autoUpdate();
      } else if (!this.isEdit) {
        await this.autoCreate();
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  private async prepareBulkUpdateForSave(): Promise<void> {
    Object.assign(this.state.bulkUpdate, this.form.value);
    this.state.bulkUpdate.items = this.getItemsToSave();
  }

  private getItemsToSave(): InventoryItem[] {
    const itemsToSave =
      this.state.itemBackup.length > 0
        ? this.state.itemBackup
        : this.state.items;

    return itemsToSave
      .map((item) => {
        const cleanedItem = { ...item };
        delete cleanedItem.log;
        return cleanedItem;
      })
      .filter((item) => item.shipmentQty || item.hasMetaUpdate);
  }
  private reverseItems(): InventoryItem[] {
    const itemsToSave =
      this.state.itemBackup.length > 0
        ? this.state.itemBackup
        : this.state.items;

    return itemsToSave
      .map((item) => {
        const cleanedItem = { ...item, shipmentQty: +item.shipmentQty * -1 };
        delete cleanedItem.log;
        return cleanedItem;
      })
      .filter((item) => item.shipmentQty || item.hasMetaUpdate);
  }

  private async generateDocumentCode(): Promise<void> {
    this.state.bulkUpdate.code = (
      await this.masterSvc
        .edit()
        .generateDocCodeAtomic(
          this.company.id,
          this.bulkUpdate.type === 'Cycle Count' ? 'CC' : 'BU',
          'totalBulkUpdates'
        )
    ).code;
  }

  private async uploadFiles(): Promise<void> {
    if (this.uploader) {
      const newFiles = await this.uploader.startUpload();
      this.state.bulkUpdate.uploads = this.state.bulkUpdate.uploads || [];
      this.state.bulkUpdate.uploads.push(...newFiles);
    }
  }

  private getFilteredItemsForPicklist(): InventoryItem[] {
    return this.state.items
      .filter((item) => item.shipmentQty || 0)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  private async autoCreate(): Promise<void> {
    this.setLoading(true);
    try {
      this.state.itemBackup =
        this.state.itemBackup.length > 0
          ? this.state.itemBackup
          : [...this.state.items];

      await this.prepareBulkUpdateForSave();
      await this.generateDocumentCode();
      await this.uploadFiles();

      const doc = await this.masterSvc
        .edit()
        .addDocument(
          `company/${this.company.id}/bulkUpdates`,
          this.state.bulkUpdate
        );

      this.state.bulkUpdate.id = doc.id;
      this.isEdit = true;

      this.showSuccessMessage('Document created successfully');
    } catch (error) {
      this.handleError(
        'Something went wrong creating document. Please try again!',
        error
      );
    } finally {
      this.setLoading(false);
    }
  }

  private async autoUpdate(): Promise<void> {
    this.setLoading(true);
    try {
      this.state.itemBackup =
        this.state.itemBackup.length > 0
          ? this.state.itemBackup
          : [...this.state.items];

      await this.prepareBulkUpdateForSave();
      this.state.bulkUpdate.status = 'pending';
      await this.uploadFiles();

      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/bulkUpdates`,
          this.state.bulkUpdate.id,
          this.state.bulkUpdate
        );
    } catch (error) {
      this.handleError(
        'Something went wrong updating the document. Please try again!',
        error
      );
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(loading: boolean): void {
    this.state.loading = loading;
    this.cdr.markForCheck();
  }

  private showSuccessMessage(message: string): void {
    this.masterSvc.notification().toast(message, 'success');
  }

  private handleError(message: string, error: any): void {
    console.error(error);
    this.masterSvc.notification().toast(message, 'danger');
  }
}
