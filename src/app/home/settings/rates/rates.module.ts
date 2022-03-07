import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { RateProfilesComponent } from './rate-profiles/rate-profiles.component';
import { RatesPageRoutingModule } from './rates-routing.module';
import { RatesPage } from './rates.page';

@NgModule({
  imports: [RatesPageRoutingModule, ComponentsModule],
  declarations: [RatesPage, RateProfilesComponent],
})
export class RatesPageModule {}
