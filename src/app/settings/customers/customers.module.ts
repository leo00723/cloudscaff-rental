import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { CustomersPageRoutingModule } from './customers-routing.module';
import { CustomersPage } from './customers.page';

@NgModule({
  imports: [CustomersPageRoutingModule, ComponentsModule],
  declarations: [CustomersPage],
})
export class CustomersPageModule {}
