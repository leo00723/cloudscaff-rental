import { Component, OnInit } from '@angular/core';
import { orderBy, where } from '@angular/fire/firestore';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { HandoverSummaryComponent } from 'src/app/components/handover-summary/handover-summary.component';
import { Company } from 'src/app/models/company.model';
import { Handover } from 'src/app/models/handover.model';
import { SaleInvoice } from 'src/app/models/sale-invoice.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { SaleInvoiceComponent } from './sale-invoice/sale-invoice.component';
import { TransactionInvoice } from 'src/app/models/transactionInvoice.model';
import { InvoiceComponent } from './invoice/invoice.component';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.page.html',
})
export class InvoicesPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  saleInvoices$: Observable<SaleInvoice[]>;
  rentalInvoices$: Observable<TransactionInvoice[]>;
  active = 'rental';

  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }

  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }

  async viewRentalInvoice(invoiceData: TransactionInvoice) {
    const modal = await this.masterSvc.modal().create({
      component: InvoiceComponent,
      componentProps: { value: invoiceData },
      showBackdrop: false,
      id: 'viewInvoice',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewSaleInvoice(invoice: SaleInvoice) {
    const modal = await this.masterSvc.modal().create({
      component: SaleInvoiceComponent,
      componentProps: {
        invoice,
      },
      showBackdrop: false,
      id: 'viewSaleInvoice',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.saleInvoices$ = this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${id}/saleInvoices`, [
            orderBy('code', 'desc'),
          ]) as Observable<any[]>;
        this.rentalInvoices$ = this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${id}/transactionInvoices`, [
            orderBy('code', 'desc'),
          ]) as Observable<any[]>;
      } else {
        this.masterSvc.log(
          '-----------------------try invoices----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
