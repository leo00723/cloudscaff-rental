import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { LabourPageRoutingModule } from './labour-routing.module';
import { LabourPage } from './labour.page';

@NgModule({
  imports: [LabourPageRoutingModule, ComponentsModule],
  declarations: [LabourPage],
})
export class LabourPageModule {}
