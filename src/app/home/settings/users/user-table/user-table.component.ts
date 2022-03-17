import {
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
import { map, Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
})
export class UserTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<User>();
  users$: Observable<User[]>;
  temp$: Observable<User[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(users: Observable<User[]>) {
    this.temp$ = users;
    this.users$ = users;
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
    this.temp$ = this.users$.pipe(
      map((es) =>
        es.filter(
          (d) =>
            d.email.toLowerCase().indexOf(val) !== -1 ||
            d.role.toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
