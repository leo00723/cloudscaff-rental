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
import { map, Observable } from 'rxjs';
import { Payment } from 'src/app/models/payment.model';

@Component({
  selector: 'app-payments-table',
  templateUrl: './payments-table.component.html',
  styles: [],
})
export class PaymentsTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Payment>();
  payments$: Observable<Payment[]>;
  temp$: Observable<Payment[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(payments: Observable<Payment[]>) {
    this.temp$ = payments;
    this.payments$ = payments;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.payments$.pipe(
      map((es) =>
        es.filter(
          (d) =>
            d.invoiceCode.toLowerCase().indexOf(val) !== -1 ||
            d.date.toLowerCase().indexOf(val) !== -1 ||
            d.customer.toLowerCase().indexOf(val) !== -1 ||
            d.total.toString().toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
