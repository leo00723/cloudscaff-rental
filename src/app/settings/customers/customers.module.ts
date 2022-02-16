import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { CustomerTableComponent } from './customer-table/customer-table.component';
import { CustomersPageRoutingModule } from './customers-routing.module';
import { CustomersPage } from './customers.page';

@NgModule({
  imports: [CustomersPageRoutingModule, ComponentsModule],
  declarations: [CustomersPage, CustomerTableComponent, AddCustomerComponent],
})
export class CustomersPageModule {}
