import { NgModule } from '@angular/core';
import { AddEstimatePageModule } from '../add-estimate/add-estimate.module';
import { ComponentsModule } from '../components/components.module';
import { EstimatesPageRoutingModule } from './estimates-routing.module';
import { EstimatesPage } from './estimates.page';

@NgModule({
  imports: [
    ComponentsModule,
    EstimatesPageRoutingModule,
    AddEstimatePageModule,
  ],
  declarations: [EstimatesPage],
})
export class EstimatesPageModule {}
