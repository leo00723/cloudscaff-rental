import { NgModule } from '@angular/core';

import { CustomerInventoryEstimatePageRoutingModule } from './customer-inventory-estimate-routing.module';

import { ComponentsModule } from '../components/components.module';
import { CustomerInventoryEstimatePage } from './customer-inventory-estimate.page';

@NgModule({
  imports: [ComponentsModule, CustomerInventoryEstimatePageRoutingModule],
  declarations: [CustomerInventoryEstimatePage],
})
export class CustomerInventoryEstimatePageModule {}
