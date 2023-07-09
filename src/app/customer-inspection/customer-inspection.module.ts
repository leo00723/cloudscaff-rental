import { NgModule } from '@angular/core';

import { CustomerInspectionPageRoutingModule } from './customer-inspection-routing.module';

import { ComponentsModule } from '../components/components.module';
import { CustomerInspectionPage } from './customer-inspection.page';

@NgModule({
  imports: [ComponentsModule, CustomerInspectionPageRoutingModule],
  declarations: [CustomerInspectionPage],
})
export class CustomerInspectionPageModule {}
