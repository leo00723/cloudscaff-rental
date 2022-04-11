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
import { Modification } from 'src/app/models/modification.model';

@Component({
  selector: 'app-modification-table',
  templateUrl: './modification-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificationTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Modification>();
  modifications$: Observable<Modification[]>;
  temp$: Observable<Modification[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(modifications: Observable<Modification[]>) {
    modifications.subscribe((data) => {
      console.log(data);
    });
    this.temp$ = modifications;
    this.modifications$ = modifications;
  }

  getStatus(status: string) {
    switch (status) {
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
    this.temp$ = this.modifications$.pipe(
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
