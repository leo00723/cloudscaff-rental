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
import { PaymentApplication } from 'src/app/models/paymentApplication.model';

@Component({
  selector: 'app-payment-application-table',
  templateUrl: './payment-application-table.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentApplicationTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<PaymentApplication>();
  paymentApplications$: Observable<PaymentApplication[]>;
  temp$: Observable<PaymentApplication[]>;
  @Input() set value(estimates: Observable<PaymentApplication[]>) {
    this.temp$ = estimates;
    this.paymentApplications$ = estimates;
  }
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.paymentApplications$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status) {
      case 'sent':
        return 'success';
      case 'P.A Created':
        return 'success';
      case 'pending':
        return 'primary';
      case 'void':
        return 'danger';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.paymentApplications$.pipe(
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
