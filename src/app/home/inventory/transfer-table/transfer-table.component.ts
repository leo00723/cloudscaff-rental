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
import { Transfer } from 'src/app/models/transfer.model';

@Component({
  selector: 'app-transfer-table',
  templateUrl: './transfer-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Transfer>();
  transfers$: Observable<Transfer[]>;
  temp$: Observable<Transfer[]>;
  @Input() set value(transfers: Observable<Transfer[]>) {
    this.temp$ = transfers;
    this.transfers$ = transfers;
  }
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.transfers$;
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
      case 'reserved':
        return 'warning';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.transfers$.pipe(
      map((site) =>
        site.filter(
          (s) =>
            s.code.toLowerCase().indexOf(val) !== -1 ||
            s.fromSite.name.toLowerCase().indexOf(val) !== -1 ||
            s.fromSite.customer.name.toLowerCase().indexOf(val) !== -1 ||
            s.toSite.name.toLowerCase().indexOf(val) !== -1 ||
            s.toSite.customer.name.toLowerCase().indexOf(val) !== -1 ||
            s.status.toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
