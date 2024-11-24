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
import { Delivery } from 'src/app/models/delivery.model';

@Component({
  selector: 'app-delivery-table',
  templateUrl: './delivery-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Delivery>();
  shipments$: Observable<Delivery[]>;
  temp$: Observable<Delivery[]>;
  @Input() set value(estimates: Observable<Delivery[]>) {
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
      case 'received':
        return 'success';
      case 'reserved':
        return 'tertiary';
      case 'on-route':
        return 'warning';
      case 'void':
        return 'danger';
      default:
        return 'primary';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;

    this.temp$ = this.shipments$.pipe(
      map((shipments) =>
        shipments.filter((s) => {
          const searchTerm = val;
          return (
            s?.code?.toLowerCase().includes(searchTerm) ||
            s?.site?.name?.toLowerCase().includes(searchTerm) ||
            s?.site?.customer?.name?.toLowerCase().includes(searchTerm) ||
            s?.status?.toLowerCase().includes(searchTerm) ||
            (s?.poNumber?.toLowerCase()?.includes(searchTerm) ?? false) ||
            !searchTerm
          );
        })
      )
    );

    this.table.offset = 0;
  }
}
