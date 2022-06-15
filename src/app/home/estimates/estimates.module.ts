import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { ComponentsModule } from '../../components/components.module';
import { AcceptEstimateComponent } from './add-estimate/accept-estimate/accept-estimate.component';
import { AddEstimatePage } from './add-estimate/add-estimate.component';
import { EstimatesPageRoutingModule } from './estimates-routing.module';
import { EstimatesPage } from './estimates.page';
import { EstimatesState } from './state/estimate.state';
import { BulkEstimateComponent } from './bulk-estimate/bulk-estimate.component';
import { AcceptBulkEstimateComponent } from './bulk-estimate/accept-bulk-estimate/accept-bulk-estimate.component';
import { InventoryEstimateComponent } from './inventory-estimate/inventory-estimate.component';

@NgModule({
  imports: [
    ComponentsModule,
    EstimatesPageRoutingModule,
    NgxsModule.forFeature([EstimatesState]),
  ],
  declarations: [
    EstimatesPage,
    AddEstimatePage,
    AcceptEstimateComponent,
    BulkEstimateComponent,
    AcceptBulkEstimateComponent,
    InventoryEstimateComponent,
  ],
})
export class EstimatesPageModule {}
