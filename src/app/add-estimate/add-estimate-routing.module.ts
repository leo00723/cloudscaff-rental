import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddEstimatePage } from './add-estimate.page';

const routes: Routes = [
  {
    path: '',
    component: AddEstimatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddEstimatePageRoutingModule {}
