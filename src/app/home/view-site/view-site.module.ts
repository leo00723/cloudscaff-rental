import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { ComponentsModule } from 'src/app/components/components.module';
import { JobReferenceComponent } from './job-reference/job-reference.component';
import { SiteInventoryTableComponent } from './site-inventory-table/site-inventory-table.component';
import { ViewSitePageRoutingModule } from './view-site-routing.module';
import { ViewSitePage } from './view-site.page';

@NgModule({
  imports: [ComponentsModule, ViewSitePageRoutingModule],
  declarations: [
    ViewSitePage,
    SiteInventoryTableComponent,
    JobReferenceComponent,
  ],
  exports: [],
  providers: [],
})
export class ViewSitePageModule {}
