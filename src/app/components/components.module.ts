import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SignaturePadModule } from 'angular2-signaturepad';
import { SwiperModule } from 'swiper/angular';
import { AcceptEstimateComponent } from '../home/estimates/add-estimate/accept-estimate/accept-estimate.component';
import { AddEstimatePage } from '../home/estimates/add-estimate/add-estimate.component';
import { AcceptBulkEstimateComponent } from '../home/estimates/bulk-estimate/accept-bulk-estimate/accept-bulk-estimate.component';
import { BulkEstimateComponent } from '../home/estimates/bulk-estimate/bulk-estimate.component';
import { InventoryEstimateComponent } from '../home/estimates/inventory-estimate/inventory-estimate.component';
import { BillableShipmentsTableComponent } from '../home/inventory/billable-shipments-table/billable-shipments-table.component';
import { CompanyPage } from '../home/settings/company/company.page';
import { AddSiteComponent } from '../home/sites/add-site/add-site.component';
import { RequestsTableComponent } from '../home/view-site/requests-table/requests-table.component';
import { ReturnsTableComponent } from '../home/view-site/returns-table/returns-table.component';
import { AcceptModificationComponent } from './accept-modification/accept-modification.component';
import { AddBillableShipmentComponent } from './add-billable-shipment/add-billable-shipment.component';
import { AddCreditComponent } from './add-credit/add-credit.component';
import { AddHandoverComponent } from './add-handover/add-handover.component';
import { AddInspectionComponent } from './add-inspection/add-inspection.component';
import { AddInvoiceComponent } from './add-invoice/add-invoice.component';
import { AddModificationComponent } from './add-modification/add-modification.component';
import { AddPaymentApplicationComponent } from './add-payment-application/add-payment-application.component';
import { AddPaymentComponent } from './add-payment/add-payment.component';
import { AddRequestComponent } from './add-request/add-request.component';
import { AddReturnComponent } from './add-return/add-return.component';
import { AddShipmentComponent } from './add-shipment/add-shipment.component';
import { AddStockitemComponent } from './add-stockitem/add-stockitem.component';
import { AddTransferComponent } from './add-transfer/add-transfer.component';
import { AddressSearchComponent } from './address-search/address-search.component';
import { BudgetBreakdownComponent } from './budget-breakdown/budget-breakdown.component';
import { BulkEstimateFormComponent } from './bulk-estimate-form/bulk-estimate-form.component';
import { BulkEstimateSummaryComponent } from './bulk-estimate-summary/bulk-estimate-summary.component';
import { BulkEstimateTableComponent } from './bulk-estimate-table/bulk-estimate-table.component';
import { CalculatePipe } from './calculate.pipe';
import { CallbackPipe } from './callback.pipe';
import { CompanyInfoDetailComponent } from './company-info-detail/company-info-detail.component';
import { CreditSummaryComponent } from './credit-summary/credit-summary.component';
import { CustomerComponent } from './customer/customer.component';
import { DashboardCardMiniComponent } from './dashboard-card-mini/dashboard-card-mini.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { DropzoneDirective } from './dropzone.directive';
import { DuplicateStockItemComponent } from './duplicate-stock-item/duplicate-stock-item.component';
import { EditprofileComponent } from './editprofile/editprofile.component';
import { EstimateSummaryComponent } from './estimate-summary/estimate-summary.component';
import { EstimateTableComponent } from './estimate-table/estimate-table.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { GenerateStatementComponent } from './generate-statement/generate-statement.component';
import { HandoverSummaryComponent } from './handover-summary/handover-summary.component';
import { HeaderCondensedComponent } from './header-condensed/header-condensed.component';
import { HeaderComponent } from './header/header.component';
import { ImgUploadComponent } from './img-upload/img-upload.component';
import { InputDateComponent } from './input-date/input-date.component';
import { InputSelectReactiveComponent } from './input-select-reactive/input-select-reactive.component';
import { InputTextReactiveComponent } from './input-text-reactive/input-text-reactive.component';
import { InputTextComponent } from './input-text/input-text.component';
import { InspectionChecklistComponent } from './inspection-checklist/inspection-checklist.component';
import { InspectionSummaryComponent } from './inspection-summary/inspection-summary.component';
import { InventoryEstimateFormComponent } from './inventory-estimate-form/inventory-estimate-form.component';
import { InventoryEstimateSummaryComponent } from './inventory-estimate-summary/inventory-estimate-summary.component';
import { InventoryEstimateTableComponent } from './inventory-estimate-table/inventory-estimate-table.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { ModificationSummaryComponent } from './modification-summary/modification-summary.component';
import { MultiuploaderComponent } from './multiuploader/multiuploader.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { RepurposeInventoryComponent } from './repurpose-inventory/repurpose-inventory.component';
import { ScaffoldEditformComponent } from './scaffold-editform/scaffold-editform.component';
import { ScaffoldOverviewTableComponent } from './scaffold-overview-table/scaffold-overview-table.component';
import { SearchableSelectComponent } from './searchable-select/searchable-select.component';
import { ShareDocumentComponent } from './share-document/share-document.component';
import { ShipmentInvoiceSummaryComponent } from './shipment-invoice-summary/shipment-invoice-summary.component';
import { ShowHidePasswordComponent } from './show-hide-password/show-hide-password.component';
import { SignaturePadComponent } from './signature-pad/signature-pad.component';
import { SiteFormComponent } from './site-form/site-form.component';
import { SkeletonTextComponent } from './skeleton-text/skeleton-text.component';
import { StatementSummaryComponent } from './statement-summary/statement-summary.component';
import { TitleBlockComponent } from './title-block/title-block.component';
import { TutorialGalleryComponent } from './tutorial-gallery/tutorial-gallery.component';
import { VideoPlayerComponent } from './tutorial-gallery/video-player/video-player.component';
import { UploadTaskComponent } from './multiuploader/upload-task/upload-task.component';
import { UploaderComponent } from './uploader/uploader.component';
import { UserPickerComponent } from './user-picker/user-picker.component';
import { ViewBulkEstimateComponent } from './view-bulk-estimate/view-bulk-estimate.component';
import { ViewEstimateComponent } from './view-estimate/view-estimate.component';
import { ViewInventoryEstimateComponent } from './view-inventory-estimate/view-inventory-estimate.component';
import { ViewInvoiceComponent } from './view-invoice/view-invoice.component';
import { ViewModificationComponent } from './view-modification/view-modification.component';
import { ViewShipmentInvoiceComponent } from './view-shipment-invoice/view-shipment-invoice.component';
import { ViewStockLocationsComponent } from './view-stock-locations/view-stock-locations.component';
import { ViewTermsComponent } from './view-terms/view-terms.component';
import { PagePlaceholderComponent } from './page-placeholder/page-placeholder.component';

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
  AddPaymentApplicationComponent,
  AddPaymentComponent,
  AddRequestComponent,
  AddReturnComponent,
  AddShipmentComponent,
  AddSiteComponent,
  AddStockitemComponent,
  AddTransferComponent,
  AddressSearchComponent,
  BillableShipmentsTableComponent,
  BudgetBreakdownComponent,
  BulkEstimateComponent,
  BulkEstimateFormComponent,
  BulkEstimateSummaryComponent,
  BulkEstimateTableComponent,
  CalculatePipe,
  CallbackPipe,
  CompanyInfoDetailComponent,
  CompanyPage,
  CreditSummaryComponent,
  CustomerComponent,
  DashboardCardMiniComponent,
  DatepickerComponent,
  DuplicateStockItemComponent,
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
  NotificationsComponent,
  RepurposeInventoryComponent,
  RequestsTableComponent,
  ReturnsTableComponent,
  ScaffoldEditformComponent,
  ScaffoldOverviewTableComponent,
  ShareDocumentComponent,
  ShipmentInvoiceSummaryComponent,
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
  ViewShipmentInvoiceComponent,
  ViewStockLocationsComponent,
  ViewTermsComponent,
  TutorialGalleryComponent,
  VideoPlayerComponent,
  UploaderComponent,
  MultiuploaderComponent,
  DropzoneDirective,
  UploadTaskComponent,
  PagePlaceholderComponent,
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
  SearchableSelectComponent,
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [IMPORTS],
  exports: [IMPORTS, COMPONENTS],
})
export class ComponentsModule {}
