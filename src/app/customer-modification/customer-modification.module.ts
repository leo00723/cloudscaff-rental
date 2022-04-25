import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { CustomerModificationPageRoutingModule } from './customer-modification-routing.module';
import { CustomerModificationPage } from './customer-modification.page';

@NgModule({
  imports: [ComponentsModule, CustomerModificationPageRoutingModule],
  declarations: [CustomerModificationPage],
})
export class CustomerModificationPageModule {}
