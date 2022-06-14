import { NgModule } from '@angular/core';

import { CustomerBulkEstimatePageRoutingModule } from './customer-bulk-estimate-routing.module';

import { ComponentsModule } from '../components/components.module';
import { CustomerBulkEstimatePage } from './customer-bulk-estimate.page';

@NgModule({
  imports: [ComponentsModule, CustomerBulkEstimatePageRoutingModule],
  declarations: [CustomerBulkEstimatePage],
})
export class CustomerBulkEstimatePageModule {}
