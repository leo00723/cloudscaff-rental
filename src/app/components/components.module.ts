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
import { SiteFormComponent } from './site-form/site-form.component';
import { SkeletonTextComponent } from './skeleton-text/skeleton-text.component';
import { InputDateComponent } from './input-date/input-date.component';
import { EstimateTableComponent } from '../estimates/estimate-table/estimate-table.component';
import { EstimateSummaryComponent } from '../estimates/add-estimate/estimate-summary/estimate-summary.component';
import { ImgUploadComponent } from './img-upload/img-upload.component';
import { EditprofileComponent } from './editprofile/editprofile.component';

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
  SiteFormComponent,
  InputDateComponent,
  EstimateTableComponent,
  EstimateSummaryComponent,
  ImgUploadComponent,
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
  declarations: [COMPONENTS, EditprofileComponent],
  imports: [IMPORTS],
  exports: [IMPORTS, COMPONENTS],
})
export class ComponentsModule {}
