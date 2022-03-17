import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewSitePage } from './view-site.page';

const routes: Routes = [
  {
    path: '',
    component: ViewSitePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewSitePageRoutingModule {}
