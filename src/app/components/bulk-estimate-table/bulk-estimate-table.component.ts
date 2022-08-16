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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';

@Component({
  selector: 'app-bulk-estimate-table',
  templateUrl: './bulk-estimate-table.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkEstimateTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<BulkEstimate>();
  estimates$: Observable<BulkEstimate[]>;
  temp$: Observable<BulkEstimate[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(estimates: Observable<BulkEstimate[]>) {
    this.temp$ = estimates;
    this.estimates$ = estimates;
  }

  getStatus(status: string) {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'revised':
        return 'tertiary';
      case 'pending':
        return 'primary';
      case 'rejected':
        return 'danger';
    }
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.estimates$.pipe(
      map((es) =>
        es.filter(
          (d) =>
            d.code.toLowerCase().indexOf(val) !== -1 ||
            d.siteName.toLowerCase().indexOf(val) !== -1 ||
            d.customer.name.toLowerCase().indexOf(val) !== -1 ||
            d.status.toLowerCase().indexOf(val) !== -1 ||
            d.total.toString().toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
