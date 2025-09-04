import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngxs/store';
import {
  DatatableComponent,
  SelectionType,
  SortType,
} from '@swimlane/ngx-datatable';
import { Observable, map, take } from 'rxjs';
import { TransactionReturn } from 'src/app/models/transactionReturn.model';
import { PdfService } from 'src/app/services/pdf.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-returns-table',
  templateUrl: './returns-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnsTableComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() selectedItem = new EventEmitter<TransactionReturn>();
  returns$: Observable<TransactionReturn[]>;
  temp$: Observable<TransactionReturn[]>;
  @Input() set value(returns: Observable<TransactionReturn[]>) {
    this.temp$ = returns;
    this.returns$ = returns.pipe(take(1));
  }
  @Input() allowReports = false;
  sortType = SortType;
  selectionType = SelectionType;
  selected = [];

  private pdfService = inject(PdfService);
  private store = inject(Store);
  constructor() {
    this.temp$ = this.returns$;
  }

  onSelect({ selected }) {
    this.selectedItem.emit(selected[0]);
  }

  getStatus(status: string) {
    switch (status) {
      case 'sent':
        return 'success';
      case 'received':
        return 'success';
      case 'pending':
        return 'primary';
      case 'void':
        return 'danger';
      case 'reserved':
        return 'warning';
      case 'on-route':
        return 'warning';
      case 'collected':
        return 'tertiary';
      default:
        return 'primary';
    }
  }

  updateFilter(event) {
    const val = event.detail.value.toLowerCase() as string;

    this.temp$ = this.returns$.pipe(
      map((returns) =>
        returns.filter((s) => {
          const searchTerm = val;
          return (
            s?.code?.toLowerCase().includes(searchTerm) ||
            s?.site?.name?.toLowerCase().includes(searchTerm) ||
            s?.site?.customer?.name?.toLowerCase().includes(searchTerm) ||
            s?.status?.toLowerCase().includes(searchTerm) ||
            (s?.jobReference?.toLowerCase()?.includes(searchTerm) ?? false) ||
            !searchTerm
          );
        })
      )
    );

    this.table.offset = 0;
  }

  async downloadOverReturnPDF(returns: TransactionReturn[]) {
    try {
      const company = this.store.selectSnapshot(CompanyState.company);

      const pdf = await this.pdfService.overReturnedItemsReport(
        returns.filter((data) => data.jobReference),
        company,
        null
      );
      this.pdfService.handlePdf(pdf, new Date().toString());
    } catch (error) {
      console.log(error);
    }
    return;
  }
}
