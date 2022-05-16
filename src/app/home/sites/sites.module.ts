import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { SiteTableComponent } from './site-table/site-table.component';
import { SitesPageRoutingModule } from './sites-routing.module';
import { SitesPage } from './sites.page';

@NgModule({
  imports: [ComponentsModule, SitesPageRoutingModule],
  declarations: [SitesPage, SiteTableComponent],
})
export class SitesPageModule {}
