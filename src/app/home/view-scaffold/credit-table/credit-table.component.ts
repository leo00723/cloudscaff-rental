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
import { Credit } from 'src/app/models/credit.model';

@Component({
  selector: 'app-credit-table',
  templateUrl: './credit-table.component.html',
  styles: [],
})
export class CreditTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Credit>();
  credits$: Observable<Credit[]>;
  temp$: Observable<Credit[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(credits: Observable<Credit[]>) {
    this.temp$ = credits;
    this.credits$ = credits;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.credits$.pipe(
      map((es) =>
        es.filter(
          (d) =>
            d.code.toLowerCase().indexOf(val) !== -1 ||
            d.date.toLowerCase().indexOf(val) !== -1 ||
            d.customer.name.toLowerCase().indexOf(val) !== -1 ||
            d.total.toString().toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
