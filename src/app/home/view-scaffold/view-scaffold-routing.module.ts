import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewScaffoldPage } from './view-scaffold.page';

const routes: Routes = [
  {
    path: '',
    component: ViewScaffoldPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewScaffoldPageRoutingModule {}
