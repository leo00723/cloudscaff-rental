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
import { Handover } from 'src/app/models/handover.model';

@Component({
  selector: 'app-handover-table',
  templateUrl: './handover-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandoverTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Handover>();
  handovers$: Observable<Handover[]>;
  temp$: Observable<Handover[]>;
  @Input() set value(val: Observable<Handover[]>) {
    this.temp$ = val;
    this.handovers$ = val;
  }
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.handovers$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status.split('-')[0]) {
      case 'active':
        return 'success';
      case 'pending':
        return 'primary';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.handovers$.pipe(
      map((handover) =>
        handover.filter(
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
