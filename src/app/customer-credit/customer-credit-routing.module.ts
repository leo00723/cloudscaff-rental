import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerCreditPage } from './customer-credit.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerCreditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerCreditPageRoutingModule {}
