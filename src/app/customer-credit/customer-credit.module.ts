import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { CustomerCreditPageRoutingModule } from './customer-credit-routing.module';
import { CustomerCreditPage } from './customer-credit.page';

@NgModule({
  imports: [ComponentsModule, CustomerCreditPageRoutingModule],
  declarations: [CustomerCreditPage],
})
export class CustomerCreditPageModule {}
