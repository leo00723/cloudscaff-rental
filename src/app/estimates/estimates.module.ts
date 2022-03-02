import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { ComponentsModule } from '../components/components.module';
import { AcceptEstimateComponent } from './add-estimate/accept-estimate/accept-estimate.component';
import { AddEstimatePage } from './add-estimate/add-estimate.component';
import { EstimatesPageRoutingModule } from './estimates-routing.module';
import { EstimatesPage } from './estimates.page';
import { EstimatesState } from './state/estimate.state';

@NgModule({
  imports: [
    ComponentsModule,
    EstimatesPageRoutingModule,
    NgxsModule.forFeature([EstimatesState]),
  ],
  declarations: [EstimatesPage, AddEstimatePage, AcceptEstimateComponent],
})
export class EstimatesPageModule {}
