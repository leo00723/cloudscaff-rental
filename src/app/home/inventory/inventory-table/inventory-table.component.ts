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
import { EditService } from 'src/app/services/edit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CompanyState } from 'src/app/shared/company/company.state';

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
    this.subs.add(
      this.inventoryItems$.subscribe((items) => {
        const blob = new Blob([JSON.stringify(items, null, 2)], {
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
        es.filter(
          (d) =>
            d.code.toLowerCase().indexOf(val) !== -1 ||
            d.category.toLowerCase().indexOf(val) !== -1 ||
            d.name.toLowerCase().indexOf(val) !== -1 ||
            d.yardQty.toString().toLowerCase().indexOf(val) !== -1 ||
            d.crossHireQty.toString().toLowerCase().indexOf(val) !== -1 ||
            d.availableQty.toString().toLowerCase().indexOf(val) !== -1 ||
            !val
        )
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

  export() {}

  onFileChanged(event) {
    this.notificationService.presentAlertConfirm(() => {
      try {
        const selectedFile = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsText(selectedFile, 'UTF-8');
        fileReader.onload = async () => {
          const data: InventoryItem[] = JSON.parse(
            fileReader.result.toString()
          );
          const company = this.store.selectSnapshot(CompanyState.company).id;
          for (const item of data) {
            await this.editService.addDocument(
              `company/${company}/stockItems`,
              item
            );
          }
          this.notificationService.toast('Import Successful', 'success');
        };
        fileReader.onerror = (error) => {
          console.log(error);
        };
      } catch (error) {
        console.log(error);
      }
    });
  }
}
