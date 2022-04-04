import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SwiperModule } from 'swiper/angular';
import { EstimateSummaryComponent } from './estimate-summary/estimate-summary.component';
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
import { ScaffoldEditformComponent } from './scaffold-editform/scaffold-editform.component';
import { CompanyInfoDetailComponent } from './company-info-detail/company-info-detail.component';
import { AddHandoverComponent } from './add-handover/add-handover.component';
import { HandoverSummaryComponent } from './handover-summary/handover-summary.component';
import { SignaturePadComponent } from './signature-pad/signature-pad.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { AddModificationComponent } from './add-modification/add-modification.component';
import { ViewEstimateComponent } from './view-estimate/view-estimate.component';

const COMPONENTS = [
  AddInspectionComponent,
  AddSiteComponent,
  AddressSearchComponent,
  CompanyPage,
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
  InspectionChecklistComponent,
  ScaffoldOverviewTableComponent,
  ShowHidePasswordComponent,
  SiteFormComponent,
  SkeletonTextComponent,
  UserPickerComponent,
  InspectionSummaryComponent,
  ScaffoldEditformComponent,
  CompanyInfoDetailComponent,
  AddHandoverComponent,
  HandoverSummaryComponent,
  SignaturePadComponent,
  AddModificationComponent,
  ViewEstimateComponent,
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
  SignaturePadModule,
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [IMPORTS],
  exports: [IMPORTS, COMPONENTS],
})
export class ComponentsModule {}
