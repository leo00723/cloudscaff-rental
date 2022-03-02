import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { ComponentsModule } from 'src/app/components/components.module';
import { SiteState } from '../state/sites.state';
import { ViewEstimateComponent } from './view-estimate/view-estimate.component';
import { ViewSitePageRoutingModule } from './view-site-routing.module';
import { ViewSitePage } from './view-site.page';

@NgModule({
  imports: [
    ComponentsModule,
    ViewSitePageRoutingModule,
    NgxsModule.forFeature([SiteState]),
  ],
  declarations: [ViewSitePage, ViewEstimateComponent],
})
export class ViewSitePageModule {}
