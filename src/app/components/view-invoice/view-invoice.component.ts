import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Invoice } from 'src/app/models/invoice.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInvoiceComponent {
  @Input() invoice: Invoice;
  constructor(private masterSvc: MasterService) {}
  close() {
    this.masterSvc.modal().dismiss();
  }
}
