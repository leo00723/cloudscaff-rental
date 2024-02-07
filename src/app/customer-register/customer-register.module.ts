import { NgModule } from '@angular/core';

import { CustomerRegisterPageRoutingModule } from './customer-register-routing.module';

import { ComponentsModule } from '../components/components.module';
import { CustomerRegisterPage } from './customer-register.page';

@NgModule({
  imports: [ComponentsModule, CustomerRegisterPageRoutingModule],
  declarations: [CustomerRegisterPage],
})
export class CustomerRegisterPageModule {}
