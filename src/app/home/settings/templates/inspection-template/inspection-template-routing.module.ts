import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InspectionTemplatePage } from './inspection-template.page';

const routes: Routes = [
  {
    path: '',
    component: InspectionTemplatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InspectionTemplatePageRoutingModule {}
