import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerInvoicePage } from './customer-invoice.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerInvoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerInvoicePageRoutingModule {}
