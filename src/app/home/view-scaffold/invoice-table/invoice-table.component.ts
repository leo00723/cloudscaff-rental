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
import { Invoice } from 'src/app/models/invoice.model';

@Component({
  selector: 'app-invoice-table',
  templateUrl: './invoice-table.component.html',
})
export class InvoiceTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Invoice>();
  invoices$: Observable<Invoice[]>;
  temp$: Observable<Invoice[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(invoices: Observable<Invoice[]>) {
    this.temp$ = invoices;
    this.invoices$ = invoices;
  }

  getStatus(status: string) {
    switch (status.split('-')[0]) {
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
    this.temp$ = this.invoices$.pipe(
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
