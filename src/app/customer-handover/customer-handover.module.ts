import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerHandoverPageRoutingModule } from './customer-handover-routing.module';

import { CustomerHandoverPage } from './customer-handover.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerHandoverPageRoutingModule
  ],
  declarations: [CustomerHandoverPage]
})
export class CustomerHandoverPageModule {}
