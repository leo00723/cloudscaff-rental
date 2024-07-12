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
      case 'Needs Signature':
        return 'primary';
      case 'Signed':
        return 'success';
    }
  }

  updateFilter(event: any) {
    const val = event.detail.value.toString().toLowerCase();

    this.temp$ = this.handovers$.pipe(
      map((handovers) =>
        handovers.filter(
          (handover) =>
            (handover.code && handover.code.toLowerCase().includes(val)) ||
            (handover.date &&
              handover.date.toString().toLowerCase().includes(val)) ||
            (handover.notes && handover.notes.toLowerCase().includes(val)) ||
            (handover.createdByName &&
              handover.createdByName.toLowerCase().includes(val)) ||
            !val
        )
      )
    );

    this.table.offset = 0;
  }
}
