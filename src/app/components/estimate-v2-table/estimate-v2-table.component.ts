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
import { EstimateV2 } from 'src/app/models/estimate-v2.model';

@Component({
  selector: 'app-estimate-v2-table',
  templateUrl: './estimate-v2-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimateV2TableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<EstimateV2 | any>();
  @Input() set value(requests: Observable<EstimateV2[] | any>) {
    this.temp$ = requests;
    this.estimates$ = requests;
  }
  @Input() showSite = true;
  estimates$: Observable<EstimateV2[] | any>;
  temp$: Observable<EstimateV2[] | any>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.estimates$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'primary';
      case 'signed':
        return 'warning';
      case 'scaffold created':
        return 'tertiary';
      case 'rejected':
        return 'danger';
      case 'void':
        return 'danger';
    }
  }

  updateFilter(event: any) {
    const val = event.detail.value.toString().toLowerCase();

    this.temp$ = this.estimates$.pipe(
      map((ests) =>
        ests.filter(
          (est) =>
            (est.code && est.code.toLowerCase().includes(val)) ||
            (est.date && est.date.toString().toLowerCase().includes(val)) ||
            (est.customer.name &&
              est.customer.name.toLowerCase().includes(val)) ||
            (est.createdByName &&
              est.createdByName.toLowerCase().includes(val)) ||
            !val
        )
      )
    );

    this.table.offset = 0;
  }
}
