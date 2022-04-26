import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerInspectionPage } from './customer-inspection.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerInspectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerInspectionPageRoutingModule {}
