import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerCreditPageRoutingModule } from './customer-credit-routing.module';

import { CustomerCreditPage } from './customer-credit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerCreditPageRoutingModule
  ],
  declarations: [CustomerCreditPage]
})
export class CustomerCreditPageModule {}
