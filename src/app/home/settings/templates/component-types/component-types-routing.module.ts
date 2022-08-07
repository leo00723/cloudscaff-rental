import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComponentTypesPage } from './component-types.page';

const routes: Routes = [
  {
    path: '',
    component: ComponentTypesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComponentTypesPageRoutingModule {}
