import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ShowHidePasswordComponent } from './show-hide-password/show-hide-password.component';
import { InputTextComponent } from './input-text/input-text.component';
import { SkeletonTextComponent } from './skeleton-text/skeleton-text.component';
import { HeaderComponent } from './header/header.component';
import { HeaderCondensedComponent } from './header-condensed/header-condensed.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HttpClientModule } from '@angular/common/http';
import { InputTextReactiveComponent } from './input-text-reactive/input-text-reactive.component';
import { CustomerComponent } from './customer/customer.component';
import { InputSelectReactiveComponent } from './input-select-reactive/input-select-reactive.component';
import { BrokerComponent } from './broker/broker.component';
import { EstimateSummaryComponent } from './estimate-summary/estimate-summary.component';
import { EstimateTableComponent } from './estimate-table/estimate-table.component';
import { RateProfilesComponent } from './rate-profiles/rate-profiles.component';

const COMPONENTS = [
  BrokerComponent,
  CustomerComponent,
  HeaderComponent,
  HeaderCondensedComponent,
  InputSelectReactiveComponent,
  InputTextComponent,
  InputTextReactiveComponent,
  ShowHidePasswordComponent,
  SkeletonTextComponent,
  EstimateSummaryComponent,
  EstimateTableComponent,
  RateProfilesComponent,
];
const IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  IonicModule,
  HttpClientModule,
  NgxDatatableModule,
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [IMPORTS],
  exports: [IMPORTS, COMPONENTS],
})
export class ComponentsModule {}
