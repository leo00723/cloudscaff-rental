import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DatatableComponent, SortType } from '@swimlane/ngx-datatable';
import { InventoryItem } from 'src/app/models/inventoryItem.model';

@Component({
  selector: 'app-site-inventory-table',
  templateUrl: './site-inventory-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteInventoryTableComponent {
  @Output() download = new EventEmitter<InventoryItem[]>();
  @ViewChild(DatatableComponent) table: DatatableComponent;
  inventoryItems: InventoryItem[] = [];
  temp: InventoryItem[] = [];
  sortType = SortType;

  @Input() set value(items: InventoryItem[]) {
    if (items) {
      this.temp = items;
      this.inventoryItems = items;
    }
  }

  updateFilter(event) {
    const searchTerm = event.detail.value.toLowerCase();

    if (!searchTerm) {
      this.temp = this.inventoryItems;
    } else {
      this.temp = this.inventoryItems.filter(
        (item) =>
          ['code', 'category', 'name'].some((field) =>
            item[field].toString().toLowerCase().includes(searchTerm)
          ) || item.availableQty.toString().toLowerCase().includes(searchTerm)
      );
    }

    this.table.offset = 0;
  }
}
