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
import { map, Observable, shareReplay } from 'rxjs';
import { JobReference } from 'src/app/models/jr.model';

@Component({
  selector: 'app-job-reference-table',
  templateUrl: './job-reference-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobReferenceTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<JobReference>();
  @Input() showLastInvoiceDate = true;
  @Input() showEndDate = false;
  @Input() set value(data: Observable<JobReference[]>) {
    this.data$ = data;
    this.setDisplayedData(data);
  }
  data$: Observable<JobReference[]>;
  temp$: Observable<JobReference[]>;
  totalInvoiced$: Observable<number>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

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

    this.setDisplayedData(
      this.data$.pipe(
        map((items) =>
          items.filter(
            (item) =>
              (item.code && item.code.toLowerCase().includes(val)) ||
              (item.jobReference &&
                item.jobReference.toLowerCase().includes(val)) ||
              (item.site?.name && item.site.name.toLowerCase().includes(val)) ||
              (item.site?.customer?.name &&
                item.site.customer.name.toLowerCase().includes(val)) ||
              (item.date && item.date.toString().toLowerCase().includes(val)) ||
              (item.lastInvoiceDate &&
                item.lastInvoiceDate.toString().toLowerCase().includes(val)) ||
              (item.createdByName &&
                item.createdByName.toLowerCase().includes(val)) ||
              !val,
          ),
        ),
      ),
    );

    this.table.offset = 0;
  }

  private setDisplayedData(data: Observable<JobReference[]>) {
    this.temp$ = data.pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.totalInvoiced$ = this.temp$.pipe(
      map((rows) =>
        rows.reduce(
          (total, item) => total + (Number(item.total) || 0),
          0,
        ),
      ),
    );
  }
}
