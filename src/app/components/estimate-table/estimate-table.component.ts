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
import { Estimate } from 'src/app/models/estimate.model';

@Component({
  selector: 'app-estimate-table',
  templateUrl: './estimate-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimateTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Estimate>();
  estimates$: Observable<Estimate[]>;
  temp$: Observable<Estimate[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(estimates: Observable<Estimate[]>) {
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
        es.filter((d) =>
          d.code.toLowerCase().indexOf(val) !== -1 || d.siteName
            ? d.siteName?.toLowerCase().indexOf(val) !== -1
            : false || d.customer
            ? d.customer.name?.toLowerCase().indexOf(val) !== -1
            : false ||
              d.status.toLowerCase().indexOf(val) !== -1 ||
              d.total.toString().toLowerCase().indexOf(val) !== -1 ||
              !val
        )
      )
    );
    this.table.offset = 0;
  }
}
