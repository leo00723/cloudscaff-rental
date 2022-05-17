import {
  ChangeDetectionStrategy,
  Component,
  Input,
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
    const val = event.detail.value.toLowerCase() as string;
    this.temp = this.inventoryItems.filter(
      (d) =>
        d.code.toLowerCase().indexOf(val) !== -1 ||
        d.category.toLowerCase().indexOf(val) !== -1 ||
        d.name.toLowerCase().indexOf(val) !== -1 ||
        d.availableQty.toString().toLowerCase().indexOf(val) !== -1 ||
        !val
    );

    this.table.offset = 0;
  }
}
