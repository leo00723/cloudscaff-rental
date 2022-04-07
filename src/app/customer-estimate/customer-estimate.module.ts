import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { CustomerEstimatePageRoutingModule } from './customer-estimate-routing.module';
import { CustomerEstimatePage } from './customer-estimate.page';

@NgModule({
  imports: [ComponentsModule, CustomerEstimatePageRoutingModule],
  declarations: [CustomerEstimatePage],
})
export class CustomerEstimatePageModule {}
