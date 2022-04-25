import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerModificationPageRoutingModule } from './customer-modification-routing.module';

import { CustomerModificationPage } from './customer-modification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerModificationPageRoutingModule
  ],
  declarations: [CustomerModificationPage]
})
export class CustomerModificationPageModule {}
