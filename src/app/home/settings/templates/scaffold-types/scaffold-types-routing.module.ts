import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScaffoldTypesPage } from './scaffold-types.page';

const routes: Routes = [
  {
    path: '',
    component: ScaffoldTypesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScaffoldTypesPageRoutingModule {}
