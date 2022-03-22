import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { TemplatesPageRoutingModule } from './templates-routing.module';
import { TemplatesPage } from './templates.page';

@NgModule({
  imports: [ComponentsModule, TemplatesPageRoutingModule],
  declarations: [TemplatesPage],
})
export class TemplatesPageModule {}
