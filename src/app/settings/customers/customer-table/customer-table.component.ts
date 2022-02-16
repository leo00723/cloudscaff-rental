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
import { Customer } from 'src/app/models/customer.model';

@Component({
  selector: 'app-customer-table',
  templateUrl: './customer-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Customer>();
  customers$: Observable<Customer[]>;
  temp$: Observable<Customer[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(estimates: Observable<Customer[]>) {
    this.temp$ = estimates;
    this.customers$ = estimates;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.customers$.pipe(
      map((customer) =>
        customer.filter(
          (c) =>
            c.name.toLowerCase().indexOf(val) !== -1 ||
            c.country.toLowerCase().indexOf(val) !== -1 ||
            c.rep.toLowerCase().indexOf(val) !== -1 ||
            c.email.toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
