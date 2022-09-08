import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { EstimatesPageRoutingModule } from './estimates-routing.module';
import { EstimatesPage } from './estimates.page';
import { AcceptInventoryEstimateComponent } from './inventory-estimate/accept-inventory-estimate/accept-inventory-estimate.component';

@NgModule({
  imports: [ComponentsModule, EstimatesPageRoutingModule],
  declarations: [EstimatesPage, AcceptInventoryEstimateComponent],
})
export class EstimatesPageModule {}
