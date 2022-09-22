import {
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
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';

@Component({
  selector: 'app-shipment-invoices-table',
  templateUrl: './shipment-invoices-table.component.html',
  styles: [],
})
export class ShipmentInvoicesTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<InventoryEstimate>();
  shipments$: Observable<InventoryEstimate[]>;
  temp$: Observable<InventoryEstimate[]>;
  @Input() set value(estimates: Observable<InventoryEstimate[]>) {
    this.temp$ = estimates;
    this.shipments$ = estimates;
  }
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.shipments$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status) {
      case 'sent':
        return 'success';
      case 'pending':
        return 'primary';
      case 'void':
        return 'danger';
      case 'shipment ended':
        return 'warning';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.shipments$.pipe(
      map((site) =>
        site.filter(
          (s) =>
            s.code.toLowerCase().indexOf(val) !== -1 ||
            s.site.name.toLowerCase().indexOf(val) !== -1 ||
            s.site.customer.name.toLowerCase().indexOf(val) !== -1 ||
            s.status.toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
