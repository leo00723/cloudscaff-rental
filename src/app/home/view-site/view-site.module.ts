import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { ComponentsModule } from 'src/app/components/components.module';
import { ScaffoldTableComponent } from './scaffold-table/scaffold-table.component';
import { SiteInventoryTableComponent } from './site-inventory-table/site-inventory-table.component';
import { ViewSitePageRoutingModule } from './view-site-routing.module';
import { ViewSitePage } from './view-site.page';
import { ShipmentInvoicesTableComponent } from './shipment-invoices-table/shipment-invoices-table.component';

@NgModule({
  imports: [ComponentsModule, ViewSitePageRoutingModule],
  declarations: [
    ViewSitePage,
    ScaffoldTableComponent,
    SiteInventoryTableComponent,
    ShipmentInvoicesTableComponent,
  ],
})
export class ViewSitePageModule {}
