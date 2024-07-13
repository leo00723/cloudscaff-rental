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
import { SI } from 'src/app/models/si.model';

@Component({
  selector: 'app-si-table',
  templateUrl: './si-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SITableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<SI>();
  @Input() set value(requests: Observable<SI[]>) {
    this.temp$ = requests;
    this.sis$ = requests;
  }
  sis$: Observable<SI[]>;
  temp$: Observable<SI[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.sis$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'primary';
      case 'signed':
        return 'warning';
      case 'scaffold created':
        return 'tertiary';
      case 'void':
        return 'danger';
    }
  }

  updateFilter(event: any) {
    const val = event.detail.value.toString().toLowerCase();

    this.temp$ = this.sis$.pipe(
      map((sis) =>
        sis.filter(
          (si) =>
            (si.code && si.code.toLowerCase().includes(val)) ||
            (si.date && si.date.toString().toLowerCase().includes(val)) ||
            (si.notes && si.notes.toLowerCase().includes(val)) ||
            (si.createdByName &&
              si.createdByName.toLowerCase().includes(val)) ||
            (si.notes && si.notes.toLowerCase().includes(val)) ||
            !val
        )
      )
    );

    this.table.offset = 0;
  }
}
