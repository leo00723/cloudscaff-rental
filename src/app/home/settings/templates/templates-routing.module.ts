import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TemplatesPage } from './templates.page';

const routes: Routes = [
  {
    path: '',
    component: TemplatesPage,
  },
  {
    path: 'inspection',
    loadChildren: () =>
      import('./inspection-template/inspection-template.module').then(
        (m) => m.InspectionTemplatePageModule
      ),
  },
  {
    path: 'handover',
    loadChildren: () =>
      import('./handover-template/handover-template.module').then(
        (m) => m.HandoverTemplatePageModule
      ),
  },
  {
    path: 'scaffold',
    loadChildren: () =>
      import('./scaffold-types/scaffold-types.module').then(
        (m) => m.ScaffoldTypesPageModule
      ),
  },
  {
    path: 'component',
    loadChildren: () =>
      import('./component-types/component-types.module').then(
        (m) => m.ComponentTypesPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TemplatesPageRoutingModule {}
