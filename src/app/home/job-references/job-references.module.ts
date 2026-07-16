import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { JobReferencesPageRoutingModule } from './job-references-routing.module';
import { JobReferencesPage } from './job-references.page';

@NgModule({
  imports: [ComponentsModule, JobReferencesPageRoutingModule],
  declarations: [JobReferencesPage],
})
export class JobReferencesPageModule {}
