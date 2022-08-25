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
import { Site } from 'src/app/models/site.model';

@Component({
  selector: 'app-site-table',
  templateUrl: './site-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Site>();
  @Input() set value(val: Observable<Site[]>) {
    this.temp$ = val;
    this.sites$ = val;
  }
  sites$: Observable<Site[]>;
  temp$: Observable<Site[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  constructor() {
    this.temp$ = this.sites$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'primary';
      case 'closed':
        return 'danger';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.sites$.pipe(
      map((site) =>
        site.filter(
          (s) =>
            s.name.toLowerCase().indexOf(val) !== -1 ||
            s.customer.name.toLowerCase().indexOf(val) !== -1 ||
            s.code.toLowerCase().indexOf(val) !== -1 ||
            s.status.toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
