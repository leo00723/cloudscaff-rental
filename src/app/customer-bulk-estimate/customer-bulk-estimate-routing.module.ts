import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerBulkEstimatePage } from './customer-bulk-estimate.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerBulkEstimatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerBulkEstimatePageRoutingModule {}
