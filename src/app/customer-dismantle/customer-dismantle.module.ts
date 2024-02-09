import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { CustomerDismantlePageRoutingModule } from './customer-dismantle-routing.module';
import { CustomerDismantlePage } from './customer-dismantle.page';

@NgModule({
  imports: [ComponentsModule, CustomerDismantlePageRoutingModule],
  declarations: [CustomerDismantlePage],
})
export class CustomerDismantlePageModule {}
