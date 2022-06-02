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
import { Request } from 'src/app/models/request.model';

@Component({
  selector: 'app-requests-table',
  templateUrl: './requests-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestsTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Request>();
  @Input() set value(requests: Observable<Request[]>) {
    this.temp$ = requests;
    this.requests$ = requests;
  }
  requests$: Observable<Request[]>;
  temp$: Observable<Request[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.requests$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status) {
      case 'approved':
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
    this.temp$ = this.requests$.pipe(
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
