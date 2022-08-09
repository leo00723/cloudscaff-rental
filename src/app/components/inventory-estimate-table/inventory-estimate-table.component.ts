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
import { BulkInventoryEstimate } from 'src/app/models/BulkInventoryEstimate.model';

@Component({
  selector: 'app-inventory-estimate-table',
  templateUrl: './inventory-estimate-table.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryEstimateTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<BulkInventoryEstimate>();
  estimates$: Observable<BulkInventoryEstimate[]>;
  temp$: Observable<BulkInventoryEstimate[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(estimates: Observable<BulkInventoryEstimate[]>) {
    this.temp$ = estimates;
    this.estimates$ = estimates;
  }

  getStatus(status: string) {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'updated':
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
