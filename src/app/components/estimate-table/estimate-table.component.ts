import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  DatatableComponent,
  SelectionType,
  SortType,
} from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-estimate-table',
  templateUrl: './estimate-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimateTableComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Input() estimates$: Observable<any[]>;
  temp$: Observable<any[]>;
  sortType = SortType;
  selectionType = SelectionType;

  ngOnInit(): void {
    this.temp$ = this.estimates$;
  }

  getStatus(status: string) {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'primary';
      case 'rejected':
        return 'danger';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.temp$ = this.estimates$.pipe(
      map((es) =>
        es.filter(
          (d) =>
            d.code.toLowerCase().indexOf(val) !== -1 ||
            d.siteName.toLowerCase().indexOf(val) !== -1 ||
            d.company.name.toLowerCase().indexOf(val) !== -1 ||
            d.status.toLowerCase().indexOf(val) !== -1 ||
            d.total.toString().toLowerCase().indexOf(val) !== -1 ||
            !val
        )
      )
    );
    this.table.offset = 0;
  }
}
