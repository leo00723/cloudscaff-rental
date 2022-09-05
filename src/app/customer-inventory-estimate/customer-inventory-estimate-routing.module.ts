import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerInventoryEstimatePage } from './customer-inventory-estimate.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerInventoryEstimatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerInventoryEstimatePageRoutingModule {}
