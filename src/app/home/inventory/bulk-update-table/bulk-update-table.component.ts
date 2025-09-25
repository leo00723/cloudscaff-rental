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
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { BulkUpdate } from 'src/app/models/bulk-update.model';

@Component({
  selector: 'app-bulk-update-table',
  templateUrl: './bulk-update-table.component.html',
})
export class BulkUpdateTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<BulkUpdate>();
  data$: Observable<BulkUpdate[]>;
  temp$: Observable<BulkUpdate[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(data: Observable<BulkUpdate[]>) {
    this.temp$ = data;
    this.data$ = data;
  }

  getStatus(status: string) {
    switch (status) {
      case 'approved':
        return 'success';
      case 'reversed':
        return 'tertiary';
      case 'pending':
        return 'primary';
      case 'void':
        return 'danger';
    }
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  updateFilter(event) {
    const val = (event.detail.value || '').toLowerCase();
    this.temp$ = this.data$.pipe(
      map((docs) => {
        if (!val) {
          return docs;
        }
        return docs.filter(
          (doc) =>
            doc.code.toLowerCase().includes(val) ||
            doc.date?.toLowerCase().includes(val) ||
            doc.status?.toLowerCase().includes(val)
        );
      }),
      debounceTime(100),
      distinctUntilChanged()
    );
    this.table.offset = 0;
  }
}
