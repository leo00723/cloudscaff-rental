import { NgModule } from '@angular/core';

import { ComponentsModule } from 'src/app/components/components.module';
import { InvoicesPageRoutingModule } from './invoices-routing.module';
import { InvoicesPage } from './invoices.page';
import { InvoiceTableComponent } from './invoice-table/invoice-table.component';
import { SaleInvoiceComponent } from './sale-invoice/sale-invoice.component';

@NgModule({
  imports: [ComponentsModule, InvoicesPageRoutingModule],
  declarations: [InvoicesPage, InvoiceTableComponent, SaleInvoiceComponent],
})
export class InvoicesPageModule {}
