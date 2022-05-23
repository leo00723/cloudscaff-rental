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
import { Transport } from 'src/app/models/transport.model';

@Component({
  selector: 'app-transport-table',
  templateUrl: './transport-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransportTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Transport>();
  transport$: Observable<Transport[]>;
  temp$: Observable<Transport[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(transport: Observable<Transport[]>) {
    this.temp$ = transport;
    this.transport$ = transport;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.transport$.pipe(
      map((customer) =>
        customer.filter(
          (c) =>
            c.name.toLowerCase().indexOf(val) !== -1 ||
            c.types.length === +val ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
