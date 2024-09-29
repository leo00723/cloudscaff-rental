import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { ComponentsModule } from 'src/app/components/components.module';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { SiteInventoryTableComponent } from './site-inventory-table/site-inventory-table.component';
import { ViewSitePageRoutingModule } from './view-site-routing.module';
import { ViewSitePage } from './view-site.page';
import { InvoiceComponent } from './invoice/invoice.component';

@NgModule({
  imports: [ComponentsModule, ViewSitePageRoutingModule, QRCodeModule],
  declarations: [
    ViewSitePage,
    SiteInventoryTableComponent,
    PurchaseOrderComponent,
    InvoiceComponent,
  ],
  exports: [],
  providers: [],
})
export class ViewSitePageModule {}
