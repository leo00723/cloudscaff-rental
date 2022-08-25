import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { EstimatesPageRoutingModule } from './estimates-routing.module';
import { EstimatesPage } from './estimates.page';

@NgModule({
  imports: [ComponentsModule, EstimatesPageRoutingModule],
  declarations: [EstimatesPage],
})
export class EstimatesPageModule {}
