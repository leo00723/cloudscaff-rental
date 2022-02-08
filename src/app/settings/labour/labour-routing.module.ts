import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LabourPage } from './labour.page';

const routes: Routes = [
  {
    path: '',
    component: LabourPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LabourPageRoutingModule {}
