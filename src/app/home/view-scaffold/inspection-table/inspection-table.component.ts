import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DatatableComponent,
  SortType,
  SelectionType,
} from '@swimlane/ngx-datatable';
import { Observable, map } from 'rxjs';
import { Inspection } from 'src/app/models/inspection.model';
import { Scaffold } from 'src/app/models/scaffold.model';

@Component({
  selector: 'app-inspection-table',
  templateUrl: './inspection-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectionTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Inspection>();
  inspections$: Observable<Inspection[]>;
  temp$: Observable<Inspection[]>;
  @Input() set value(estimates: Observable<Inspection[]>) {
    this.temp$ = estimates;
    this.inspections$ = estimates;
  }
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.inspections$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status) {
      case 'Passed':
        return 'success';
      case 'Failed':
        return 'danger';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.inspections$.pipe(
      map((inspection) =>
        inspection.filter(
          (i) =>
            i.code.toLowerCase().indexOf(val) !== -1 ||
            i.notes.toLowerCase().indexOf(val) !== -1 ||
            i.status.toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
