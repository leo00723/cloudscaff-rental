import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SignaturePadModule } from 'angular2-signaturepad';
import { SwiperModule } from 'swiper/angular';
import { CompanyPage } from '../home/settings/company/company.page';
import { AddSiteComponent } from '../home/sites/add-site/add-site.component';
import { AddAdminReturnComponent } from './add-admin-return/add-admin-return.component';
import { AddHandoverComponent } from './add-handover/add-handover.component';
import { AddInspectionComponent } from './add-inspection/add-inspection.component';
import { AddInstructionComponent } from './add-instruction/add-instruction.component';
import { AddRequestComponent } from './add-request/add-request.component';
import { AddReturnComponent } from './add-return/add-return.component';
import { AddScaffoldComponent } from './add-scaffold/add-scaffold.component';
import { AddShipmentComponent } from './add-shipment/add-shipment.component';
import { AddStockitemComponent } from './add-stockitem/add-stockitem.component';
import { AddTransferComponent } from './add-transfer/add-transfer.component';
import { AddressSearchComponent } from './address-search/address-search.component';
import { CalculatePipe } from './calculate.pipe';
import { CallbackPipe } from './callback.pipe';
import { CompanyInfoDetailComponent } from './company-info-detail/company-info-detail.component';
import { CustomerComponent } from './customer/customer.component';
import { DashboardCardMiniComponent } from './dashboard-card-mini/dashboard-card-mini.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { DismantleSummaryComponent } from './dismantle-summary/dismantle-summary.component';
import { DropzoneDirective } from './dropzone.directive';
import { DuplicateStockItemComponent } from './duplicate-stock-item/duplicate-stock-item.component';
import { EditprofileComponent } from './editprofile/editprofile.component';
import { EstimateSummarySellComponent } from './estimate-summary-sell/estimate-summary-sell.component';
import { EstimateSummaryV2Component } from './estimate-summary-v2/estimate-summary-v2.component';
import { EstimateV2TableComponent } from './estimate-v2-table/estimate-v2-table.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { HandoverSummaryComponent } from './handover-summary/handover-summary.component';
import { HandoverTableComponent } from './handover-table/handover-table.component';
import { HeaderCondensedComponent } from './header-condensed/header-condensed.component';
import { HeaderComponent } from './header/header.component';
import { ImgUploadComponent } from './img-upload/img-upload.component';
import { InputDateComponent } from './input-date/input-date.component';
import { InputSelectReactiveComponent } from './input-select-reactive/input-select-reactive.component';
import { InputTextReactiveComponent } from './input-text-reactive/input-text-reactive.component';
import { InputTextComponent } from './input-text/input-text.component';
import { InspectionChecklistComponent } from './inspection-checklist/inspection-checklist.component';
import { InspectionSummaryComponent } from './inspection-summary/inspection-summary.component';
import { FileItemComponent } from './multiuploader/file-item/file-item.component';
import { MultiuploaderComponent } from './multiuploader/multiuploader.component';
import { UploadTaskComponent } from './multiuploader/upload-task/upload-task.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { PagePlaceholderComponent } from './page-placeholder/page-placeholder.component';
import { PermissionsSelectComponent } from './permissions-select/permissions-select.component';
import { RepurposeInventoryComponent } from './repurpose-inventory/repurpose-inventory.component';
import { RequestsTableComponent } from './requests-table/requests-table.component';
import { ReturnsTableComponent } from './returns-table/returns-table.component';
import { ScaffoldEditformComponent } from './scaffold-editform/scaffold-editform.component';
import { ScaffoldOverviewTable2Component } from './scaffold-overview-table-2/scaffold-overview-table-2.component';
import { ScaffoldTableComponent } from './scaffold-table/scaffold-table.component';
import { SearchableSelectComponent } from './searchable-select/searchable-select.component';
import { ShareDocumentComponent } from './share-document/share-document.component';
import { ShipmentTableComponent } from './shipment-table/shipment-table.component';
import { ShowHidePasswordComponent } from './show-hide-password/show-hide-password.component';
import { SITableComponent } from './si-table/si-table.component';
import { SignatureModalComponent } from './signature-modal/signature-modal.component';
import { SignaturePadComponent } from './signature-pad/signature-pad.component';
import { SiteFormComponent } from './site-form/site-form.component';
import { SkeletonTextComponent } from './skeleton-text/skeleton-text.component';
import { TitleBlockComponent } from './title-block/title-block.component';
import { TutorialGalleryComponent } from './tutorial-gallery/tutorial-gallery.component';
import { VideoPlayerComponent } from './tutorial-gallery/video-player/video-player.component';
import { UploaderComponent } from './uploader/uploader.component';
import { UserPickerComponent } from './user-picker/user-picker.component';
import { ViewStockLocationsComponent } from './view-stock-locations/view-stock-locations.component';
import { ViewTermsComponent } from './view-terms/view-terms.component';
import { WeightPipe } from './weight.pipe';
import { POTableComponent } from './po-table/po-table.component';
import { POSummaryComponent } from './po-summary/po-summary.component';
import { DateDiffPipe } from './dateDiff.pipe';

const COMPONENTS = [
  AddHandoverComponent,
  AddInspectionComponent,
  AddInstructionComponent,
  AddRequestComponent,
  AddReturnComponent,
  AddScaffoldComponent,
  AddShipmentComponent,
  AddSiteComponent,
  AddStockitemComponent,
  AddTransferComponent,
  AddressSearchComponent,
  CalculatePipe,
  CallbackPipe,
  CompanyInfoDetailComponent,
  CompanyPage,
  CustomerComponent,
  DashboardCardMiniComponent,
  DatepickerComponent,
  DismantleSummaryComponent,
  DropzoneDirective,
  DuplicateStockItemComponent,
  EditprofileComponent,
  EstimateSummaryV2Component,
  EstimateSummarySellComponent,
  EstimateV2TableComponent,
  FileItemComponent,
  FileUploadComponent,
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
  MultiuploaderComponent,
  NotificationsComponent,
  PagePlaceholderComponent,
  RepurposeInventoryComponent,
  RequestsTableComponent,
  ReturnsTableComponent,
  SITableComponent,
  ScaffoldEditformComponent,
  ScaffoldOverviewTable2Component,
  ScaffoldTableComponent,
  ShareDocumentComponent,
  ShipmentTableComponent,
  ShowHidePasswordComponent,
  SignatureModalComponent,
  SignaturePadComponent,
  SiteFormComponent,
  SkeletonTextComponent,
  TitleBlockComponent,
  TutorialGalleryComponent,
  UploadTaskComponent,
  UploaderComponent,
  UserPickerComponent,
  VideoPlayerComponent,
  ViewStockLocationsComponent,
  ViewTermsComponent,
  WeightPipe,
  HandoverTableComponent,
  AddAdminReturnComponent,
  POTableComponent,
  POSummaryComponent,
  DateDiffPipe,
];
const IMPORTS = [
  CommonModule,
  FormsModule,
  HttpClientModule,
  IonicModule,
  NgxDatatableModule,
  PermissionsSelectComponent,
  ReactiveFormsModule,
  ScrollingModule,
  SearchableSelectComponent,
  SignaturePadModule,
  SwiperModule,
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [IMPORTS],
  exports: [IMPORTS, COMPONENTS],
})
export class ComponentsModule {}
