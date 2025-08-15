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

@Component({
  selector: 'app-billable-shipments-table',
  templateUrl: './billable-shipments-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillableShipmentsTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<any>();
  shipments$: Observable<any[]>;
  temp$: Observable<any[]>;
  @Input() set value(estimates: Observable<any[]>) {
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
