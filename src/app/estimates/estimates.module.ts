import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { EstimatesPageRoutingModule } from './estimates-routing.module';
import { EstimatesPage } from './estimates.page';
import { EstimateTableComponent } from './estimate-table/estimate-table.component';
import { AddEstimatePage } from './add-estimate/add-estimate.component';
import { EstimateSummaryComponent } from './add-estimate/estimate-summary/estimate-summary.component';
import { AcceptEstimateComponent } from './add-estimate/accept-estimate/accept-estimate.component';

@NgModule({
  imports: [ComponentsModule, EstimatesPageRoutingModule],
  declarations: [
    EstimatesPage,
    EstimateTableComponent,
    AddEstimatePage,
    EstimateSummaryComponent,
    AcceptEstimateComponent,
  ],
})
export class EstimatesPageModule {}
