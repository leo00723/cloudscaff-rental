import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { AcceptEstimateV2Component } from './add-estimate-v2/accept-estimate-v2/accept-estimate-v2.component';
import { AddEstimateV2Component } from './add-estimate-v2/add-estimate-v2.component';
import { EstimatesPageRoutingModule } from './estimates-routing.module';
import { EstimatesPage } from './estimates.page';
import { AcceptEstimateRentComponent } from './inventory-estimate-rent/accept-estimate-rent/accept-estimate-rent.component';
import { InventoryEstimateRentComponent } from './inventory-estimate-rent/inventory-estimate-rent.component';
import { AcceptEstimateSellComponent } from './inventory-estimate-sell/accept-estimate-sell/accept-estimate-sell.component';
import { InventoryEstimateSellComponent } from './inventory-estimate-sell/inventory-estimate-sell.component';

@NgModule({
  imports: [ComponentsModule, EstimatesPageRoutingModule],
  declarations: [
    EstimatesPage,
    AddEstimateV2Component,
    AcceptEstimateV2Component,
    AcceptEstimateSellComponent,
    AcceptEstimateRentComponent,
    InventoryEstimateSellComponent,
    InventoryEstimateRentComponent,
  ],
})
export class EstimatesPageModule {}
