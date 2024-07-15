import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import {
  DatatableComponent,
  SelectionType,
  SortType,
} from '@swimlane/ngx-datatable';
import { map, Observable, Subscription } from 'rxjs';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { User } from 'src/app/models/user.model';
import { EditService } from 'src/app/services/edit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { environment } from 'src/environments/environment';
import * as Papa from 'papaparse';
import { Company } from 'src/app/models/company.model';

@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryTableComponent implements OnInit, OnDestroy {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<InventoryItem>();
  @Output() editItem = new EventEmitter<InventoryItem>();
  @Output() duplicateItem = new EventEmitter<InventoryItem>();

  inventoryItems$: Observable<InventoryItem[]>;
  temp$: Observable<InventoryItem[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  sanitizedBlobUrl: any;

  itemsBackup: InventoryItem[];

  isProd = environment.production;
  user: User;

  company: Company;

  private subs = new Subscription();

  constructor(
    private sanitizer: DomSanitizer,
    private editService: EditService,
    private notificationService: NotificationService,
    private store: Store
  ) {}
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  ngOnInit(): void {
    this.user = this.store.selectSnapshot(UserState.user);
    this.company = this.store.selectSnapshot(CompanyState.company);
    this.subs.add(
      this.inventoryItems$.subscribe((items) => {
        this.itemsBackup = items;
        const newItems = [];
        items.forEach((i) => {
          // const item = {
          //   id: i.id,
          //   code: i.code,
          //   name: i.name,
          //   yardQty: i.yardQty,
          // };
          newItems.push(i);
        });
        const blob = new Blob([JSON.stringify(newItems, null, 2)], {
          type: 'application/json',
        });

        this.sanitizedBlobUrl = this.sanitizer.bypassSecurityTrustUrl(
          window.URL.createObjectURL(blob)
        );
      })
    );
  }
  @Input() set value(estimates: Observable<InventoryItem[]>) {
    this.temp$ = estimates;
    this.inventoryItems$ = estimates;
  }

  onSelect({ selected }) {
    this.selected = selected;
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.inventoryItems$.pipe(
      map((es) =>
        es.filter((d) => {
          const code = d?.code.toString().toLowerCase().includes(val);
          const category = d?.category?.toLowerCase().includes(val);
          const name = d.name?.toLowerCase().includes(val);
          const size = d?.size.toString().toLowerCase().includes(val);

          return code || category || name || size || !val;
        })
      )
    );
    this.table.offset = 0;
  }

  edit() {
    this.editItem.emit(this.selected[0]);
  }
  duplicate() {
    this.duplicateItem.emit(this.selected[0]);
  }
  view() {
    this.selectedItem.emit(this.selected[0]);
  }
  deleteItem(item: InventoryItem) {
    if (item.inUseQty > 0) {
      this.notificationService.toast(
        'Please return all items to Yard before deleting component.',
        'warning',
        5000,
        'middle'
      );
      return;
    }
    this.notificationService.presentAlertConfirm(async () => {
      const company = this.store.selectSnapshot(CompanyState.company).id;

      await this.editService.deleteDocById(
        `company/${company}/stockItems`,
        this.selected[0].id
      );

      this.notificationService.toast('Item deleted', 'success');
      this.selected = [];
    });
  }

  export() {}

  reset() {
    this.notificationService.presentAlertConfirm(() => {
      const sub = this.inventoryItems$.subscribe(
        async (items: InventoryItem[]) => {
          const batch = this.editService.batch();
          const company = this.store.selectSnapshot(CompanyState.company).id;

          for (const item of items) {
            const doc = this.editService.docRef(
              `company/${company}/stockItems`,
              item.id
            );
            item.crossHireQty = 0;
            item.inUseQty = 0;
            item.inMaintenanceQty = 0;
            item.damagedQty = 0;
            item.lostQty = 0;
            item.shipmentQty = 0;
            item.reservedQty = 0;
            item.crossHire = [];
            batch.update(doc, { ...item });
          }
          await batch.commit();
          this.notificationService.toast('Reset Complete', 'success');
          sub.unsubscribe();
        }
      );
    });
  }

  onFileChanged(event) {
    this.notificationService.presentAlertConfirm(() => {
      const file: File = event.target.files[0];
      if (file) {
        Papa.parse(file, {
          header: true,
          worker: true,
          dynamicTyping: true,

          complete: async (result) => {
            const data = result.data.map((item) => ({
              code: item.Code.toString(),
              category: item.Category,
              size: item.Size,
              name: item.Description,
              yardQty: item.Yard_Qty,
              availableQty: item.Yard_Qty,
              weight: item.Weight,
              inMaintenanceQty: 0,
              inUseQty: 0,
              damagedQty: 0,
              lostQty: 0,
              hireCost: item.Hire_Cost,
              replacementCost: item.Replacement_Cost,
              sellingCost: item.Selling_Cost,
              log: [
                {
                  message: `${this.user.name} added ${item.Yard_Qty} items to the yard.`,
                  user: this.user,
                  date: new Date(),
                  status: 'add',
                  comment: 'Imported',
                },
              ],
            }));
            const company = this.store.selectSnapshot(CompanyState.company).id;
            for (const item of data) {
              await this.editService.addDocument(
                `company/${company}/stockItems`,
                item
              );
            }
            this.notificationService.toast('Import Successful', 'success');
          },
        });
      }
    });
  }
}
