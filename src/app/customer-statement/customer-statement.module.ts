import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerStatementPageRoutingModule } from './customer-statement-routing.module';

import { CustomerStatementPage } from './customer-statement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerStatementPageRoutingModule,
  ],
  declarations: [CustomerStatementPage],
})
export class CustomerStatementPageModule {}
