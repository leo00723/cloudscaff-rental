import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { CreditTableComponent } from './credit-table/credit-table.component';
import { InspectionTableComponent } from './inspection-table/inspection-table.component';
import { InvoiceTableComponent } from './invoice-table/invoice-table.component';
import { ModificationTableComponent } from './modification-table/modification-table.component';
import { PaymentsTableComponent } from './payments-table/payments-table.component';
import { ViewScaffoldPageRoutingModule } from './view-scaffold-routing.module';
import { ViewScaffoldPage } from './view-scaffold.page';

@NgModule({
  imports: [ComponentsModule, ViewScaffoldPageRoutingModule],
  declarations: [
    ViewScaffoldPage,
    InspectionTableComponent,
    ModificationTableComponent,
    InvoiceTableComponent,
    PaymentsTableComponent,
    CreditTableComponent,
  ],
})
export class ViewScaffoldPageModule {}
