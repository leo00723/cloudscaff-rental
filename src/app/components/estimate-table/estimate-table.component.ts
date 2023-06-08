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
import { Estimate } from 'src/app/models/estimate.model';
import { ExportsService } from 'src/app/services/exports.service';

@Component({
  selector: 'app-estimate-table',
  templateUrl: './estimate-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimateTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<Estimate>();
  estimates$: Observable<Estimate[]>;
  temp$: Observable<Estimate[]>;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];
  @Input() set value(estimates: Observable<Estimate[]>) {
    this.temp$ = estimates;
    this.estimates$ = estimates;
  }

  constructor(private exportSvc: ExportsService) {}

  export() {
    const list = [];
    const sub = this.estimates$.subscribe((estimates) => {
      for (const e of estimates) {
        const l = {
          code: e.code,
          customer: e.customer.name,
          site: e.siteName,
          scaffoldCode: e.scaffoldCode,
          date: e.date,
          total: e.total,
          totalSpend: e?.budget?.cost,
          totalProfit: e?.budget?.profit,
          status: e.status,
        };
        list.push(l);
      }
      this.exportSvc.exportToCsv(
        list,
        `Estimates ${new Date().toDateString()}`,
        [
          'code',
          'customer',
          'cite',
          'scaffoldCode',
          'date',
          'total',
          'totalSpend',
          'totalProfit',
          'status',
        ]
      );
      sub.unsubscribe();
    });
  }

  getStatus(status: string) {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'revised':
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
    const val = (event.detail.value || '').toLowerCase();
    this.temp$ = this.estimates$.pipe(
      map((es) =>
        es.filter((d) => {
          const codeMatch = d.code.toLowerCase().includes(val);
          const siteNameMatch = d.siteName?.toLowerCase().includes(val);
          const customerMatch = d.customer?.name?.toLowerCase().includes(val);
          const statusMatch = d.status.toLowerCase().includes(val);
          const totalMatch = d.total.toString().toLowerCase().includes(val);

          return (
            codeMatch ||
            siteNameMatch ||
            customerMatch ||
            statusMatch ||
            totalMatch ||
            !val
          );
        })
      )
    );
    this.table.offset = 0;
  }
}
