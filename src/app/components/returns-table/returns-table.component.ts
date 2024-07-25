import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DatatableComponent,
  SortType,
  SelectionType,
} from '@swimlane/ngx-datatable';
import { Observable, map } from 'rxjs';
import { Return } from 'src/app/models/return.model';

@Component({
  selector: 'app-returns-table',
  templateUrl: './returns-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnsTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Return>();
  returns$: Observable<Return[]>;
  temp$: Observable<Return[]>;
  @Input() set value(returns: Observable<Return[]>) {
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
