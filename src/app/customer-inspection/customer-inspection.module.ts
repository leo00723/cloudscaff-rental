import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerInspectionPageRoutingModule } from './customer-inspection-routing.module';

import { CustomerInspectionPage } from './customer-inspection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerInspectionPageRoutingModule
  ],
  declarations: [CustomerInspectionPage]
})
export class CustomerInspectionPageModule {}
