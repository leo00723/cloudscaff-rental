import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { AddEstimatePageRoutingModule } from './add-estimate-routing.module';
import { AddEstimatePage } from './add-estimate.page';
import { EstimateSummaryComponent } from './estimate-summary/estimate-summary.component';

@NgModule({
  imports: [ComponentsModule, AddEstimatePageRoutingModule],
  declarations: [AddEstimatePage, EstimateSummaryComponent],
})
export class AddEstimatePageModule {}
