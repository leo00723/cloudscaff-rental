import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DatatableComponent,
  SelectionType,
  SortType,
} from '@swimlane/ngx-datatable';
import { map, Observable } from 'rxjs';
import { InventoryItem } from 'src/app/models/inventoryItem.model';

@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<InventoryItem>();
  @Output() editItem = new EventEmitter<InventoryItem>();
  @Output() duplicateItem = new EventEmitter<InventoryItem>();
  inventoryItems$: Observable<InventoryItem[]>;
  temp$: Observable<InventoryItem[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
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
}
