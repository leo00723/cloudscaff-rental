import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerModificationPage } from './customer-modification.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerModificationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerModificationPageRoutingModule {}
