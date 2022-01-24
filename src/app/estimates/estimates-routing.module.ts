import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EstimatesPage } from './estimates.page';

const routes: Routes = [
  {
    path: '',
    component: EstimatesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstimatesPageRoutingModule {}
