import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerHandoverPage } from './customer-handover.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerHandoverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerHandoverPageRoutingModule {}
