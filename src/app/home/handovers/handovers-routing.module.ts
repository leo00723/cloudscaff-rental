import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HandoversPage } from './handovers.page';

const routes: Routes = [
  {
    path: '',
    component: HandoversPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HandoversPageRoutingModule {}
