import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { ComponentsModule } from 'src/app/components/components.module';
import { PaymentApplicationTableComponent } from './payment-application-table/payment-application-table.component';
import { ShipmentInvoicesTableComponent } from './shipment-invoices-table/shipment-invoices-table.component';
import { SiteInventoryTableComponent } from './site-inventory-table/site-inventory-table.component';
import { ViewSitePageRoutingModule } from './view-site-routing.module';
import { ViewSitePage } from './view-site.page';

@NgModule({
  imports: [ComponentsModule, ViewSitePageRoutingModule, QRCodeModule],
  declarations: [
    ViewSitePage,
    SiteInventoryTableComponent,
    ShipmentInvoicesTableComponent,
    PaymentApplicationTableComponent,
  ],
  exports: [PaymentApplicationTableComponent],
})
export class ViewSitePageModule {}
