import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { SitesPageRoutingModule } from './sites-routing.module';
import { SitesPage } from './sites.page';
import { SiteTableComponent } from './site-table/site-table.component';
import { AddSiteComponent } from './add-site/add-site.component';

@NgModule({
  imports: [ComponentsModule, SitesPageRoutingModule],
  declarations: [SitesPage, SiteTableComponent, AddSiteComponent],
})
export class SitesPageModule {}
