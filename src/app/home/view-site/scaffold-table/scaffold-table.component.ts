import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Select } from '@ngxs/store';
import {
  DatatableComponent,
  SelectionType,
  SortType,
} from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Scaffold } from 'src/app/models/scaffold.model';

@Component({
  selector: 'app-scaffold-table',
  templateUrl: './scaffold-table.component.html',
  styles: [
    `
      tr {
        font-size: 0.8rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaffoldTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Scaffold>();
  scaffolds$: Observable<Scaffold[]>;
  temp$: Observable<Scaffold[]>;
  @Input() set value(estimates: Observable<Scaffold[]>) {
    this.temp$ = estimates;
    this.scaffolds$ = estimates;
  }
  @Input() showScaffoldList = true;
  @Input() showRegister = false;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  filterScaffold(scaffold: Scaffold) {
    return scaffold.latestHandover ? true : false;
  }

  constructor() {
    this.temp$ = this.scaffolds$;
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
      case 'inactive':
        return 'danger';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.scaffolds$.pipe(
      map((data) =>
        data.filter(
          (s) =>
            s.code.toLowerCase().indexOf(val) !== -1 ||
            s.status.toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    if (this.showScaffoldList) {
      this.table.offset = 0;
    }
  }
}
