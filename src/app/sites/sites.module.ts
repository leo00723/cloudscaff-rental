import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { SitesPageRoutingModule } from './sites-routing.module';
import { SitesPage } from './sites.page';
import { SiteTableComponent } from './site-table/site-table.component';
import { AddSiteComponent } from './add-site/add-site.component';
import { NgxsModule } from '@ngxs/store';
import { SitesState } from '../shared/sites/sites.state';

@NgModule({
  imports: [
    ComponentsModule,
    SitesPageRoutingModule,
    NgxsModule.forFeature([SitesState]),
  ],
  declarations: [SitesPage, SiteTableComponent, AddSiteComponent],
})
export class SitesPageModule {}
