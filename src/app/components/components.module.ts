import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SwiperModule } from 'swiper/angular';
import { EstimateSummaryComponent } from './estimate-summary/estimate-summary.component';
import { EstimateTableComponent } from './estimate-table/estimate-table.component';
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
import { ModificationSummaryComponent } from './modification-summary/modification-summary.component';
import { ShareDocumentComponent } from './share-document/share-document.component';
import { AcceptModificationComponent } from './accept-modification/accept-modification.component';
import { ViewModificationComponent } from './view-modification/view-modification.component';
import { AddInvoiceComponent } from './add-invoice/add-invoice.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { AddPaymentComponent } from './add-payment/add-payment.component';
import { AddCreditComponent } from './add-credit/add-credit.component';
import { CreditSummaryComponent } from './credit-summary/credit-summary.component';
import { GenerateStatementComponent } from './generate-statement/generate-statement.component';
import { StatementSummaryComponent } from './statement-summary/statement-summary.component';
import { ViewInvoiceComponent } from './view-invoice/view-invoice.component';
import { AddStockitemComponent } from './add-stockitem/add-stockitem.component';
import { AddShipmentComponent } from './add-shipment/add-shipment.component';
import { ViewStockLocationsComponent } from './view-stock-locations/view-stock-locations.component';
import { AddTransferComponent } from './add-transfer/add-transfer.component';
import { AddRequestComponent } from './add-request/add-request.component';
import { AddReturnComponent } from './add-return/add-return.component';
import { ReturnsTableComponent } from '../home/view-site/returns-table/returns-table.component';
import { CalculatePipe } from './calculate.pipe';
import { BudgetBreakdownComponent } from './budget-breakdown/budget-breakdown.component';
import { RequestsTableComponent } from '../home/view-site/requests-table/requests-table.component';
import { TitleBlockComponent } from './title-block/title-block.component';
import { BulkEstimateFormComponent } from './bulk-estimate-form/bulk-estimate-form.component';
import { BulkEstimateSummaryComponent } from './bulk-estimate-summary/bulk-estimate-summary.component';
import { BulkEstimateTableComponent } from './bulk-estimate-table/bulk-estimate-table.component';
import { ViewBulkEstimateComponent } from './view-bulk-estimate/view-bulk-estimate.component';
import { ViewTermsComponent } from './view-terms/view-terms.component';
import { AcceptEstimateComponent } from '../home/estimates/add-estimate/accept-estimate/accept-estimate.component';
import { AddEstimatePage } from '../home/estimates/add-estimate/add-estimate.component';
import { AcceptBulkEstimateComponent } from '../home/estimates/bulk-estimate/accept-bulk-estimate/accept-bulk-estimate.component';
import { BulkEstimateComponent } from '../home/estimates/bulk-estimate/bulk-estimate.component';
import { InventoryEstimateComponent } from '../home/estimates/inventory-estimate/inventory-estimate.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { InventoryEstimateFormComponent } from './inventory-estimate-form/inventory-estimate-form.component';
import { InventoryEstimateSummaryComponent } from './inventory-estimate-summary/inventory-estimate-summary.component';
import { InventoryEstimateTableComponent } from './inventory-estimate-table/inventory-estimate-table.component';
import { ViewInventoryEstimateComponent } from './view-inventory-estimate/view-inventory-estimate.component';
import { AddBillableShipmentComponent } from './add-billable-shipment/add-billable-shipment.component';

const COMPONENTS = [
  AcceptBulkEstimateComponent,
  AcceptEstimateComponent,
  AcceptModificationComponent,
  AddBillableShipmentComponent,
  AddCreditComponent,
  AddEstimatePage,
  AddHandoverComponent,
  AddInspectionComponent,
  AddInvoiceComponent,
  AddModificationComponent,
  AddPaymentComponent,
  AddRequestComponent,
  AddReturnComponent,
  AddShipmentComponent,
  AddSiteComponent,
  AddStockitemComponent,
  AddTransferComponent,
  AddressSearchComponent,
  BudgetBreakdownComponent,
  BulkEstimateComponent,
  BulkEstimateFormComponent,
  BulkEstimateSummaryComponent,
  BulkEstimateTableComponent,
  CalculatePipe,
  CompanyInfoDetailComponent,
  CompanyPage,
  CreditSummaryComponent,
  CustomerComponent,
  DatepickerComponent,
  EditprofileComponent,
  EstimateSummaryComponent,
  EstimateTableComponent,
  FileUploadComponent,
  GenerateStatementComponent,
  HandoverSummaryComponent,
  HeaderComponent,
  HeaderCondensedComponent,
  ImgUploadComponent,
  InputDateComponent,
  InputSelectReactiveComponent,
  InputTextComponent,
  InputTextReactiveComponent,
  InspectionChecklistComponent,
  InspectionSummaryComponent,
  InventoryEstimateComponent,
  InventoryEstimateFormComponent,
  InventoryEstimateSummaryComponent,
  InventoryEstimateTableComponent,
  InvoiceSummaryComponent,
  ModificationSummaryComponent,
  RequestsTableComponent,
  ReturnsTableComponent,
  ScaffoldEditformComponent,
  ScaffoldOverviewTableComponent,
  ShareDocumentComponent,
  ShowHidePasswordComponent,
  SignaturePadComponent,
  SiteFormComponent,
  SkeletonTextComponent,
  StatementSummaryComponent,
  TitleBlockComponent,
  UserPickerComponent,
  ViewBulkEstimateComponent,
  ViewEstimateComponent,
  ViewInventoryEstimateComponent,
  ViewInvoiceComponent,
  ViewModificationComponent,
  ViewStockLocationsComponent,
  ViewTermsComponent,
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
