import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HandoverTemplatePage } from './handover-template.page';

const routes: Routes = [
  {
    path: '',
    component: HandoverTemplatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HandoverTemplatePageRoutingModule {}
