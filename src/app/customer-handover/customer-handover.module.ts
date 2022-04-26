import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { CustomerHandoverPageRoutingModule } from './customer-handover-routing.module';
import { CustomerHandoverPage } from './customer-handover.page';

@NgModule({
  imports: [ComponentsModule, CustomerHandoverPageRoutingModule],
  declarations: [CustomerHandoverPage],
})
export class CustomerHandoverPageModule {}
