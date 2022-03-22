import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SwiperModule } from 'swiper/angular';
import { EstimateSummaryComponent } from '../home/estimates/add-estimate/estimate-summary/estimate-summary.component';
import { EstimateTableComponent } from '../home/estimates/estimate-table/estimate-table.component';
import { CompanyPage } from '../home/settings/company/company.page';
import { AddSiteComponent } from '../home/sites/add-site/add-site.component';
import { AddressSearchComponent } from './address-search/address-search.component';
import { CustomerComponent } from './customer/customer.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { EditprofileComponent } from './editprofile/editprofile.component';
import { HeaderCondensedComponent } from './header-condensed/header-condensed.component';
import { HeaderComponent } from './header/header.component';
import { ImgUploadComponent } from './img-upload/img-upload.component';
import { InputDateComponent } from './input-date/input-date.component';
import { InputSelectReactiveComponent } from './input-select-reactive/input-select-reactive.component';
import { InputTextReactiveComponent } from './input-text-reactive/input-text-reactive.component';
import { InputTextComponent } from './input-text/input-text.component';
import { ShowHidePasswordComponent } from './show-hide-password/show-hide-password.component';
import { SiteFormComponent } from './site-form/site-form.component';
import { SkeletonTextComponent } from './skeleton-text/skeleton-text.component';
import { UserPickerComponent } from './user-picker/user-picker.component';
import { AddInspectionComponent } from './add-inspection/add-inspection.component';
import { ScaffoldOverviewTableComponent } from './scaffold-overview-table/scaffold-overview-table.component';
import { InspectionChecklistComponent } from './inspection-checklist/inspection-checklist.component';
import { InspectionSummaryComponent } from './inspection-summary/inspection-summary.component';
const COMPONENTS = [
  AddressSearchComponent,
  CustomerComponent,
  DatepickerComponent,
  EditprofileComponent,
  EstimateSummaryComponent,
  EstimateTableComponent,
  HeaderComponent,
  HeaderCondensedComponent,
  ImgUploadComponent,
  InputDateComponent,
  InputSelectReactiveComponent,
  InputTextComponent,
  InputTextReactiveComponent,
  ShowHidePasswordComponent,
  SiteFormComponent,
  SkeletonTextComponent,
  CompanyPage,
  AddSiteComponent,
  UserPickerComponent,
  AddInspectionComponent,
  ScaffoldOverviewTableComponent,
  InspectionChecklistComponent,
];
const IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  IonicModule,
  HttpClientModule,
  NgxDatatableModule,
  SwiperModule,
  ScrollingModule,
];

@NgModule({
  declarations: [COMPONENTS, InspectionSummaryComponent],
  imports: [IMPORTS],
  exports: [IMPORTS, COMPONENTS, InspectionSummaryComponent],
})
export class ComponentsModule {}
