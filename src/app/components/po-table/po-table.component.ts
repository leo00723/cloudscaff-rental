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
import { PO } from 'src/app/models/po.model';

@Component({
  selector: 'app-po-table',
  templateUrl: './po-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class POTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<PO>();
  @Input() set value(data: Observable<PO[]>) {
    this.temp$ = data;
    this.data$ = data;
  }
  data$: Observable<PO[]>;
  temp$: Observable<PO[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.data$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'primary';
      case 'signed':
        return 'warning';
      case 'scaffold created':
        return 'tertiary';
      case 'void':
        return 'danger';
    }
  }

  updateFilter(event: any) {
    const val = event.detail.value.toString().toLowerCase();

    this.temp$ = this.data$.pipe(
      map((items) =>
        items.filter(
          (item) =>
            (item.code && item.code.toLowerCase().includes(val)) ||
            (item.jobReference &&
              item.jobReference.toLowerCase().includes(val)) ||
            (item.site.name && item.site.name.toLowerCase().includes(val)) ||
            (item.site.customer.name &&
              item.site.customer.name.toLowerCase().includes(val)) ||
            (item.date && item.date.toString().toLowerCase().includes(val)) ||
            (item.createdByName &&
              item.createdByName.toLowerCase().includes(val)) ||
            !val
        )
      )
    );

    this.table.offset = 0;
  }
}
