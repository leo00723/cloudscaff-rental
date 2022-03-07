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
import { LabourBroker } from 'src/app/models/labour-broker.model';

@Component({
  selector: 'app-labor-table',
  templateUrl: './labor-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LaborTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<LabourBroker>();
  brokers$: Observable<LabourBroker[]>;
  temp$: Observable<LabourBroker[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(brokers: Observable<LabourBroker[]>) {
    this.temp$ = brokers;
    this.brokers$ = brokers;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.brokers$.pipe(
      map((customer) =>
        customer.filter(
          (c) =>
            c.name.toLowerCase().indexOf(val) !== -1 ||
            c.types.length === +val ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
