import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobReferencesPage } from './job-references.page';

const routes: Routes = [
  {
    path: '',
    component: JobReferencesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobReferencesPageRoutingModule {}
