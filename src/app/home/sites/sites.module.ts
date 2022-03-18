import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { ComponentsModule } from '../../components/components.module';
import { AddSiteComponent } from './add-site/add-site.component';
import { SiteTableComponent } from './site-table/site-table.component';
import { SitesPageRoutingModule } from './sites-routing.module';
import { SitesPage } from './sites.page';
import { SitesState } from './state/sites.state';

@NgModule({
  imports: [
    ComponentsModule,
    SitesPageRoutingModule,
    NgxsModule.forFeature([SitesState]),
  ],
  declarations: [SitesPage, SiteTableComponent],
})
export class SitesPageModule {}
