import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { EstimatesPageRoutingModule } from './estimates-routing.module';
import { EstimatesPage } from './estimates.page';
import { EstimateTableComponent } from './estimate-table/estimate-table.component';
import { AddEstimatePageModule } from './add-estimate/add-estimate.module';

@NgModule({
  imports: [
    ComponentsModule,
    EstimatesPageRoutingModule,
    AddEstimatePageModule,
  ],
  declarations: [EstimatesPage, EstimateTableComponent],
})
export class EstimatesPageModule {}
