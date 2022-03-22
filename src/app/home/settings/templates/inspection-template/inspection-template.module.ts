import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { InspectionTemplatePageRoutingModule } from './inspection-template-routing.module';
import { InspectionTemplatePage } from './inspection-template.page';

@NgModule({
  imports: [ComponentsModule, InspectionTemplatePageRoutingModule],
  declarations: [InspectionTemplatePage],
})
export class InspectionTemplatePageModule {}
