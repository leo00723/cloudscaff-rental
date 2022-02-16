import { NgModule } from '@angular/core';
import { ComponentsModule } from '../components/components.module';
import { SitesPageRoutingModule } from './sites-routing.module';
import { SitesPage } from './sites.page';

@NgModule({
  imports: [ComponentsModule, SitesPageRoutingModule],
  declarations: [SitesPage],
})
export class SitesPageModule {}
