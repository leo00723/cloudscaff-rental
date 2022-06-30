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
import { Enquiry } from 'src/app/models/enquiry.model';

@Component({
  selector: 'app-enquiry-table',
  templateUrl: './enquiry-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnquiryTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Enquiry>();
  enquiries$: Observable<Enquiry[]>;
  temp$: Observable<Enquiry[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(enquiries: Observable<Enquiry[]>) {
    this.temp$ = enquiries;
    this.enquiries$ = enquiries;
  }

  getStatus(status: string) {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'estimate created':
        return 'tertiary';
      case 'overdue':
        return 'warning';
      case 'sent':
        return 'success';
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
    this.temp$ = this.enquiries$.pipe(
      map((es) =>
        es.filter(
          (d) =>
            d.code.toLowerCase().indexOf(val) !== -1 ||
            d.siteName.toLowerCase().indexOf(val) !== -1 ||
            d.customer.name.toLowerCase().indexOf(val) !== -1 ||
            d.status.toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
