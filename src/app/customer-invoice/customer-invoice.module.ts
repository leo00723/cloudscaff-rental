import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { CustomerInvoicePageRoutingModule } from './customer-invoice-routing.module';
import { CustomerInvoicePage } from './customer-invoice.page';

@NgModule({
  imports: [ComponentsModule, CustomerInvoicePageRoutingModule],
  declarations: [CustomerInvoicePage],
})
export class CustomerInvoicePageModule {}
