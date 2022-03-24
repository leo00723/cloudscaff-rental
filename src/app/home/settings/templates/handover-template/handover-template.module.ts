import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { HandoverTemplatePageRoutingModule } from './handover-template-routing.module';
import { HandoverTemplatePage } from './handover-template.page';

@NgModule({
  imports: [ComponentsModule, HandoverTemplatePageRoutingModule],
  declarations: [HandoverTemplatePage],
})
export class HandoverTemplatePageModule {}
