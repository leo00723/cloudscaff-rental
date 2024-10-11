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
import { Observable, map } from 'rxjs';
import { TransactionReturn } from 'src/app/models/transactionReturn.model';

@Component({
  selector: 'app-returns-table',
  templateUrl: './returns-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnsTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<TransactionReturn>();
  returns$: Observable<TransactionReturn[]>;
  temp$: Observable<TransactionReturn[]>;
  @Input() set value(returns: Observable<TransactionReturn[]>) {
    this.temp$ = returns;
    this.returns$ = returns;
  }
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.returns$;
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
      case 'pending':
        return 'primary';
      case 'void':
        return 'danger';
      case 'reserved':
        return 'warning';
      case 'on-route':
        return 'warning';
      case 'collected':
        return 'tertiary';
      default:
        return 'primary';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;

    this.temp$ = this.returns$.pipe(
      map((returns) =>
        returns.filter((s) => {
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
