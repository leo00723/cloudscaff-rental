import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AddressSearchComponent } from './address-search/address-search.component';
import { CustomerComponent } from './customer/customer.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { HeaderCondensedComponent } from './header-condensed/header-condensed.component';
import { HeaderComponent } from './header/header.component';
import { InputSelectReactiveComponent } from './input-select-reactive/input-select-reactive.component';
import { InputTextReactiveComponent } from './input-text-reactive/input-text-reactive.component';
import { InputTextComponent } from './input-text/input-text.component';
import { ShowHidePasswordComponent } from './show-hide-password/show-hide-password.component';
import { SkeletonTextComponent } from './skeleton-text/skeleton-text.component';

const COMPONENTS = [
  CustomerComponent,
  HeaderComponent,
  HeaderCondensedComponent,
  InputSelectReactiveComponent,
  InputTextComponent,
  InputTextReactiveComponent,
  ShowHidePasswordComponent,
  SkeletonTextComponent,
  AddressSearchComponent,
  DatepickerComponent,
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
