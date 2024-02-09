import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerDismantlePage } from './customer-dismantle.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerDismantlePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerDismantlePageRoutingModule {}
