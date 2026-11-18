import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { arrayUnion, increment, orderBy, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { lastValueFrom, Observable, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { AddInstructionComponent } from 'src/app/components/add-instruction/add-instruction.component';
import { AddRequestComponent } from 'src/app/components/add-request/add-request.component';
import { AddReturnComponent } from 'src/app/components/add-return/add-return.component';
import { AddScaffoldComponent } from 'src/app/components/add-scaffold/add-scaffold.component';
import { AddShipmentComponent } from 'src/app/components/add-shipment/add-shipment.component';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { JobReference } from 'src/app/models/jr.model';
import { Request } from 'src/app/models/request.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Delivery } from 'src/app/models/delivery.model';
import { SI } from 'src/app/models/si.model';
import { Site } from 'src/app/models/site.model';
import { TransactionInvoice } from 'src/app/models/transactionInvoice.model';
import { TransactionReturn } from 'src/app/models/transactionReturn.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { InvoiceComponent } from '../invoices/invoice/invoice.component';
import { AddSiteComponent } from '../sites/add-site/add-site.component';
import { JobReferenceComponent } from './job-reference/job-reference.component';
import { AddAdjustmentComponent } from 'src/app/components/add-adjustment/add-adjustment.component';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { UserState } from 'src/app/shared/user/user.state';
import { AlertController, LoadingController } from '@ionic/angular';
import * as XLSX from 'xlsx';
import { JobReferenceFormComponent } from './job-reference-form/job-reference-form.component';

@Component({
  selector: 'app-view-site',
  templateUrl: './view-site.page.html',
  styles: [
    `
      /* Styles for the scrollbar track */
      ::-webkit-scrollbar {
        width: 0.2rem;
        height: 0rem;
      }
    `,
  ],
})
export class ViewSitePage implements OnInit, OnDestroy {
  @Select() company$: Observable<Company>;
  @Select() user$: Observable<User>;
  site$: Observable<Site>;
  scaffolds$: Observable<Scaffold[]>;
  pendingScaffolds$: Observable<Scaffold[]>;
  inactiveScaffolds$: Observable<Scaffold[]>;
  erectedScaffolds$: Observable<Scaffold[]>;
  activeScaffolds$: Observable<Scaffold[]>;
  dismantledScaffolds$: Observable<Scaffold[]>;

  pendingRequests$: Observable<Request[]>;
  submittedRequests$: Observable<Request[]>;
  approvedRequests$: Observable<Request[]>;

  pendingAdjustments$: Observable<TransactionReturn[]>;
  adjustments$: Observable<TransactionReturn[]>;

  pendingReturns$: Observable<TransactionReturn[]>;
  outboundReturns$: Observable<TransactionReturn[]>;
  returns$: Observable<TransactionReturn[]>;

  outboundDeliveries$: Observable<Delivery[]>;
  deliveries$: Observable<Delivery[]>;

  pendingInstructions$: Observable<SI[]>;
  signedInstructions$: Observable<SI[]>;
  instructions$: Observable<SI[]>;

  jobReferences$: Observable<JobReference[]>;
  completedJobReference$: Observable<JobReference[]>;

  transactionInvoices$: Observable<TransactionInvoice[]>;

  inventoryItems$: Observable<any>;

  active = 'inventory';
  ids = [];

  private loading: any;

  private alertController = inject(AlertController);
  private loadingCtrl = inject(LoadingController);
  private masterSvc = inject(MasterService);
  private activatedRoute = inject(ActivatedRoute);

  private subs = new Subscription();

  constructor() {
    this.ids = this.activatedRoute.snapshot.paramMap.get('id').split('-');
    this.site$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.ids[0]}/sites`, this.ids[1])
      .pipe(
        tap((site: Site) => {
          if (!site) {
            this.masterSvc.store().dispatch(new Navigate('/dashboard/sites'));
          }
        })
      ) as Observable<Site>;

    this.scaffolds$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/scaffolds`, [
        where('siteId', '==', this.ids[1]),
        orderBy('date', 'desc'),
      ]) as Observable<Scaffold[]>;
    this.pendingScaffolds$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/scaffolds`, [
        where('siteId', '==', this.ids[1]),
        where('status', '==', 'pending-Work In Progress'),
        orderBy('date', 'desc'),
      ]) as Observable<Scaffold[]>;
    this.inactiveScaffolds$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/scaffolds`, [
        where('siteId', '==', this.ids[1]),
        where('status', '==', 'inactive-Failed Inspection'),
        orderBy('date', 'desc'),
      ]) as Observable<Scaffold[]>;
    this.erectedScaffolds$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/scaffolds`, [
        where('siteId', '==', this.ids[1]),
        where('status', '==', 'active-Handed over'),
        orderBy('date', 'desc'),
      ]) as Observable<Scaffold[]>;
    this.dismantledScaffolds$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/scaffolds`, [
        where('siteId', '==', this.ids[1]),
        where('status', '==', 'Dismantled'),
        orderBy('date', 'desc'),
      ]) as Observable<Scaffold[]>;
    this.activeScaffolds$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/scaffolds`, [
        where('siteId', '==', this.ids[1]),
        where('status', '!=', 'Dismantled'),
        orderBy('status', 'desc'),
        orderBy('date', 'desc'),
      ]) as Observable<Scaffold[]>;
    this.inventoryItems$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.ids[0]}/siteStock`, this.ids[1]);
    this.pendingRequests$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/requests`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['pending']),
        orderBy('code', 'desc'),
      ]) as Observable<Delivery[]>;
    this.submittedRequests$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/requests`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['submitted']),
        orderBy('code', 'desc'),
      ]) as Observable<Delivery[]>;
    this.approvedRequests$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/requests`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['approved']),
        orderBy('code', 'desc'),
      ]) as Observable<Delivery[]>;

    this.outboundDeliveries$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/shipments`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['on-route']),
        orderBy('code', 'desc'),
      ]) as Observable<Delivery[]>;
    this.deliveries$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/shipments`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['received']),
        orderBy('code', 'desc'),
      ]) as Observable<Delivery[]>;
    this.pendingInstructions$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/siteInstructions`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['needs signature']),
        orderBy('code', 'desc'),
      ]) as Observable<Delivery[]>;
    this.signedInstructions$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/siteInstructions`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['signed', 'scaffold created']),
        orderBy('code', 'desc'),
      ]) as Observable<Delivery[]>;
    this.instructions$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/siteInstructions`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['completed']),
        orderBy('code', 'desc'),
      ]) as Observable<Delivery[]>;
    this.pendingAdjustments$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/adjustments`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['pending', 'submitted']),
        orderBy('code', 'desc'),
      ]) as Observable<TransactionReturn[]>;
    this.adjustments$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/adjustments`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['sent', 'received']),
        orderBy('code', 'desc'),
      ]) as Observable<TransactionReturn[]>;
    this.pendingReturns$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/returns`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['pending', 'submitted']),
        orderBy('code', 'desc'),
      ]) as Observable<TransactionReturn[]>;
    this.outboundReturns$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/returns`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['on-route', 'collected']),
        orderBy('code', 'desc'),
      ]) as Observable<TransactionReturn[]>;
    this.returns$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/returns`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['sent', 'received']),
        orderBy('code', 'desc'),
      ]) as Observable<TransactionReturn[]>;

    this.jobReferences$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/jobReferences`, [
        where('site.id', '==', this.ids[1]),
        where('status', '==', 'pending'),
        orderBy('code', 'desc'),
      ]) as Observable<any[]>;
    this.completedJobReference$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/jobReferences`, [
        where('site.id', '==', this.ids[1]),
        where('status', '==', 'completed'),
        orderBy('code', 'desc'),
      ]) as Observable<any[]>;
    this.transactionInvoices$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/transactionInvoices`, [
        where('site.id', '==', this.ids[1]),
        orderBy('code', 'desc'),
      ]) as Observable<any[]>;
  }

  async ngOnInit(): Promise<void> {
    this.loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      mode: 'ios',
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  async editSite(site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddSiteComponent,
      componentProps: {
        siteData: site,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editSite',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async addRequest(site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddRequestComponent,
      componentProps: { site },
      showBackdrop: false,
      id: 'addRequest',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewRequest(requestData: Request, site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddRequestComponent,
      componentProps: { isEdit: true, value: requestData },
      showBackdrop: false,
      id: 'viewRequest',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async addAdjustment(site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddAdjustmentComponent,
      componentProps: { siteData: site },
      showBackdrop: false,
      id: 'addAdjustment',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewAdjustment(returnData: TransactionReturn, site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddAdjustmentComponent,
      componentProps: { isEdit: true, value: returnData, siteData: site },
      showBackdrop: false,
      id: 'viewAdjustment',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async addReturn(site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddReturnComponent,
      componentProps: { siteData: site },
      showBackdrop: false,
      id: 'addReturn',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewReturn(returnData: TransactionReturn, site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddReturnComponent,
      componentProps: { isEdit: true, value: returnData, siteData: site },
      showBackdrop: false,
      id: 'viewReturn',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async addInstruction(site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddInstructionComponent,
      componentProps: { site },
      showBackdrop: false,
      id: 'addInstruction',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async viewInstruction(instruction: SI, site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddInstructionComponent,
      componentProps: { isEdit: true, value: instruction, site },
      showBackdrop: false,
      id: 'viewInstruction',
      cssClass: 'fullscreen',
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'create-scaffold') {
      return await this.addScaffold(site, data);
    }
    return;
  }

  async viewShipment(shipment: Delivery) {
    const modal = await this.masterSvc.modal().create({
      component: AddShipmentComponent,
      componentProps: {
        isEdit: true,
        inventoryItems$: this.inventoryItems$,
        value: shipment,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'editShipment',
    });
    return await modal.present();
  }

  async addScaffold(site: Site, siData?: SI) {
    const modal = await this.masterSvc.modal().create({
      component: AddScaffoldComponent,
      componentProps: { siteData: site, siData },
      showBackdrop: false,
      id: 'addScaffold',
      cssClass: 'fullscreen',
    });

    return modal.present();
  }

  async addJobReference(site: Site) {
    //start the acceptance process
    const modal = await this.masterSvc.modal().create({
      component: JobReferenceFormComponent,
      componentProps: {
        data: {
          jobReference: {},
          site,
          isEdit: false,
        },
      },
      id: 'jobReferenceForm',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async viewJobReference(poData: JobReference, site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: JobReferenceComponent,
      componentProps: { value: poData, site },
      showBackdrop: false,
      id: 'viewJobReference',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async viewInvoice(invoiceData: TransactionInvoice) {
    const modal = await this.masterSvc.modal().create({
      component: InvoiceComponent,
      componentProps: { value: invoiceData },
      showBackdrop: false,
      id: 'viewInvoice',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  viewScaffold(scaffold: Scaffold) {
    this.masterSvc
      .store()
      .dispatch(
        new Navigate(
          `/dashboard/scaffold/${this.ids[0]}-${this.ids[1]}-${scaffold.id}`
        )
      );
  }

  async setUploads(uploads, site: Site) {
    site.uploads
      ? site.uploads.push(...uploads)
      : (site.uploads = [...uploads]);
    try {
      await this.masterSvc
        .edit()
        .updateDoc(`company/${site.companyId}/sites`, site.id, site);
      this.masterSvc
        .notification()
        .toast('Files uploaded successfully', 'success');
    } catch (error) {
      console.log(error);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong uploading files. Please try again.',
          'danger'
        );
    }
  }

  async removeUpload(index: number, site: Site) {
    site.uploads.splice(index, 1);
    try {
      await this.masterSvc
        .edit()
        .updateDoc(`company/${site.companyId}/sites`, site.id, site);
      this.masterSvc
        .notification()
        .toast('Files deleted successfully', 'success');
    } catch (error) {
      console.log(error);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong deleting file. Please try again.',
          'danger'
        );
    }
  }

  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }

  async downloadPDF(items: InventoryItem[], site: Site) {
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    // Get all stock items from masterlist
    const stockItems: InventoryItem[] = await lastValueFrom(
      this.masterSvc
        .edit()
        .getCollectionOrdered(`company/${company.id}/stockItems`, 'code', 'asc')
        .pipe(take(1))
    );

    // Get all transaction types (same as downloadHistoryExcel)
    const [
      deliveryData,
      adjustmentData,
      returnData,
      overageData,
      reversalData,
    ] = await Promise.all([
      lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${company.id}/transactionLog`, [
            where('siteId', '==', site.id),
            where('transactionType', '==', 'Delivery'),
          ])
          .pipe(take(1))
      ),
      lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${company.id}/transactionLog`, [
            where('siteId', '==', site.id),
            where('transactionType', '==', 'Adjustment'),
          ])
          .pipe(take(1))
      ),
      lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${company.id}/transactionLog`, [
            where('siteId', '==', site.id),
            where('transactionType', '==', 'Return'),
          ])
          .pipe(take(1))
      ),
      lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${company.id}/transactionLog`, [
            where('siteId', '==', site.id),
            where('transactionType', '==', 'Overage Return'),
          ])
          .pipe(take(1))
      ),
      lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${company.id}/transactionLog`, [
            where('siteId', '==', site.id),
            where('transactionType', '==', 'Overage Return Reversal'),
          ])
          .pipe(take(1))
      ),
    ]);

    // Combine all transaction data (same as downloadHistoryExcel)
    const allData = await this.excludeInvoiceDeliveries([
      ...deliveryData,
      ...adjustmentData,
      ...returnData,
      ...overageData,
      ...reversalData,
    ], company.id, site.id);

    // Use the same consolidation logic as downloadHistoryExcel
    const consolidatedItemsData = this.consolidateItemDataPDF(
      allData,
      stockItems
    );

    // Convert the consolidated data to the format expected by the PDF service
    const groupedList = Object.values(consolidatedItemsData).map(
      (item: any) => ({
        ...item,
        deliveredQty: item.totalDelivered,
        returnTotal: item.totalReturned,
        balanceQty: item.currentBalance,
        adjustmentTotal: item.totalAdjusted,
        overageReturnTotal: item.totalOverReturned,
        weight: item.weight, // Explicitly include weight for PDF
      })
    );

    const pdf = await this.masterSvc
      .pdf()
      .inventoryTransactionList(site, groupedList, company);
    await this.masterSvc
      .pdf()
      .handlePdf(pdf, `${site.code}-${site.name}-Inventory List`);
  }

  async downloadHistoryExcel(site: Site) {
    this.loading.present();
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    // Get all stock items from masterlist
    const stockItems: InventoryItem[] = await lastValueFrom(
      this.masterSvc
        .edit()
        .getCollectionOrdered(`company/${company.id}/stockItems`, 'code', 'asc')
        .pipe(take(1))
    );

    // Transfers are included through their delivery and return movements.
    const [
      deliveryData,
      adjustmentData,
      returnData,
      overageData,
      reversalData,
    ] = await Promise.all([
      lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${company.id}/transactionLog`, [
            where('siteId', '==', site.id),
            where('transactionType', '==', 'Delivery'),
          ])
          .pipe(take(1))
      ),
      lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${company.id}/transactionLog`, [
            where('siteId', '==', site.id),
            where('transactionType', '==', 'Adjustment'),
          ])
          .pipe(take(1))
      ),
      lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${company.id}/transactionLog`, [
            where('siteId', '==', site.id),
            where('transactionType', '==', 'Return'),
          ])
          .pipe(take(1))
      ),
      lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${company.id}/transactionLog`, [
            where('siteId', '==', site.id),
            where('transactionType', '==', 'Overage Return'),
          ])
          .pipe(take(1))
      ),
      lastValueFrom(
        this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${company.id}/transactionLog`, [
            where('siteId', '==', site.id),
            where('transactionType', '==', 'Overage Return Reversal'),
          ])
          .pipe(take(1))
      ),
    ]);

    // Combine all inventory movements.
    const allData = await this.excludeInvoiceDeliveries([
      ...deliveryData,
      ...adjustmentData,
      ...returnData,
      ...overageData,
      ...reversalData,
    ], company.id, site.id);

    // Generate Excel file
    await this.generateExcelHistory(allData, site, stockItems);
    this.loading.dismiss();
  }

  private async excludeInvoiceDeliveries(
    transactions: any[],
    companyId: string,
    siteId: string
  ): Promise<any[]> {
    const invoices: TransactionInvoice[] = await lastValueFrom(
      this.masterSvc.edit().getCollectionFiltered(
        `company/${companyId}/transactionInvoices`,
        [where('site.id', '==', siteId)]
      ).pipe(take(1))
    );
    return this.filterInventoryMovements(transactions, invoices);
  }

  private filterInventoryMovements(
    transactions: any[],
    invoices: TransactionInvoice[]
  ): any[] {
    // invoiceCreated writes billing carry-forwards as Delivery rows with the
    // invoice code. They retain the original deliveryId/date/quantity, so those
    // fields cannot distinguish billing renewals from physical stock movements.
    const invoiceCodes = new Set(invoices.map(invoice => invoice.code).filter(Boolean));
    return transactions.filter(item =>
      item.transactionType !== 'Delivery' ||
        (!item.isBillingCarryForward && !invoiceCodes.has(item.deliveryCode))
    );
  }

  async saveAsImage(parent: any, site: string) {
    let parentElement = null;
    // fetches base 64 data from canvas
    parentElement = parent.qrcElement.nativeElement
      .querySelector('canvas')
      .toDataURL('image/png');

    if (parentElement) {
      // converts base 64 encoded image to blobData
      const blobData = await (await fetch(parentElement)).blob();
      // saves as image
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // name of the file
      link.download = site;
      link.click();
    }
  }

  help() {
    this.masterSvc
      .router()
      .navigateByUrl('/dashboard/settings/tutorial?ch=6&vid=0');
  }

  async generateExcelHistory(
    allData: any[],
    site: Site,
    stockItems: InventoryItem[]
  ) {
    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    const worksheetData = [];

    // Get the latest delivery data for meta info
    const latestDelivery = allData
      .filter((item) => item.transactionType === 'Delivery')
      .sort(
        (a, b) =>
          this.getTimestamp(b.deliveryDate) - this.getTimestamp(a.deliveryDate)
      )[0];

    // Add meta information in first 3 rows
    worksheetData.push([`Project Name : ${site.name}`]);
    worksheetData.push([
      `Delivery Date : ${
        latestDelivery ? this.formatDate(latestDelivery.deliveryDate) : 'N/A'
      }`,
    ]);
    worksheetData.push([
      `Delivery Number : ${
        latestDelivery ? latestDelivery.deliveryCode || 'N/A' : 'N/A'
      }`,
    ]);

    // Keep one column per document, including distinct movements on the same day.
    // Sort raw timestamps, since formatted day/month strings do not sort by date.
    const columns = this.getExcelMovementColumns(allData).map(column => ({
      ...column,
      quantities: this.consolidateItemData(column.items, stockItems),
    }));
    const deliveryColumns = columns.filter(column => column.isDelivery);
    const returnColumns = columns.filter(column => !column.isDelivery);
    worksheetData.push([
      'SL NO', 'Item Code', 'Description', 'Weight (kg)',
      'Total Balance In Project',
      ...deliveryColumns.map(column => column.date),
      'Delivered to Project',
      ...returnColumns.map(column => column.date),
      'Total Returned from Project',
    ]);
    worksheetData.push([
      'Reference', '', '', '', '',
      ...deliveryColumns.map(column => column.reference),
      '',
      ...returnColumns.map(column => column.reference),
      '',
    ]);

    // Process items data
    const itemsData = this.consolidateItemData(allData, stockItems);
    let slNo = 1;

    Object.entries(itemsData).forEach(([key, item]: [string, any]) => {
      const row = [
        slNo++,
        item.code,
        item.name,
        item.weight || '',
        item.currentBalance || 0,
      ];

      deliveryColumns.forEach(column => {
        row.push(column.quantities[key]?.totalDelivered || '');
      });
      row.push(item.totalDelivered || 0);
      returnColumns.forEach(column => {
        row.push(column.quantities[key]?.totalReturned || '');
      });

      row.push(item.totalReturned || 0);

      worksheetData.push(row);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 8 }, // SL NO
      { wch: 15 }, // Item Code
      { wch: 35 }, // Description
      { wch: 12 }, // Weight (kg)
      { wch: 20 }, // Total Balance In Project
    ];

    // Add widths for delivery date columns
    deliveryColumns.forEach(() => {
      columnWidths.push({ wch: 12 });
    });

    columnWidths.push({ wch: 18 }); // Delivered to Project

    // Add widths for return date columns
    returnColumns.forEach(() => {
      columnWidths.push({ wch: 12 });
    });

    columnWidths.push({ wch: 25 }); // Total Returned To Company

    worksheet['!cols'] = columnWidths;

    // Add styling
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);

    // Style header row (row 4, index 3)
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 3, c: col });
      if (!worksheet[cellAddress]) {
        continue;
      }
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'CCCCCC' } },
        alignment: { horizontal: 'center' },
      };
    }

    // Style reference row (row 5, index 4)
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 4, c: col });
      if (!worksheet[cellAddress]) {
        continue;
      }
      worksheet[cellAddress].s = {
        font: { italic: true },
        fill: { fgColor: { rgb: 'F0F0F0' } },
        alignment: { horizontal: 'center' },
      };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate and download the file
    const fileName = `${site.code}-${site.name}-Delivery-Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  private getExcelMovementColumns(allData: any[]): any[] {
    const columns = new Map<string, any>();
    allData.forEach((item, index) => {
      const isDelivery = item.transactionType === 'Delivery';
      if (!isDelivery && ![
        'Return', 'Overage Return', 'Overage Return Reversal', 'Adjustment',
      ].includes(item.transactionType)) {
        return;
      }
      const date = isDelivery ? item.deliveryDate : item.returnDate;
      const timestamp = this.getTimestamp(date);
      const reference = isDelivery
        ? item.deliveryCode
        : item.adjustmentCode || item.returnCode;
      const documentId = isDelivery ? item.deliveryId : item.returnId;
      const kind = isDelivery ? 'delivery'
        : item.transactionType === 'Adjustment' ? 'adjustment' : 'return';
      // Regular and overage lines of a single return belong to the same column.
      // Anonymous legacy rows stay separate instead of merging all of one day.
      const identity = documentId ? ['id', documentId]
        : reference ? ['reference', reference] : ['row', item.id || index];
      const key = JSON.stringify([kind, ...identity]);
      if (!columns.has(key)) {
        columns.set(key, {
          isDelivery,
          timestamp: Number.isFinite(timestamp) && date ? timestamp : Infinity,
          date: this.formatDate(date) || 'N/A',
          reference: reference || '',
          items: [],
        });
      }
      const column = columns.get(key);
      column.items.push(item);
      // A document's lines can receive slightly different server timestamps.
      if (date && Number.isFinite(timestamp) && timestamp < column.timestamp) {
        column.timestamp = timestamp;
        column.date = this.formatDate(date) || 'N/A';
      }
    });
    return [...columns.values()].sort((a, b) =>
      (a.timestamp - b.timestamp) || a.reference.localeCompare(b.reference)
    );
  }

  private consolidateItemData(
    allData: any[],
    stockItems: InventoryItem[]
  ): any {
    const items = this.consolidateItemDataPDF(allData, stockItems);
    Object.values(items).forEach((item: any) => {
      item.totalReturned += item.totalOverReturned + item.totalAdjusted;
    });
    return items;
  }

  private consolidateItemDataPDF(
    allData: any[],
    stockItems: InventoryItem[]
  ): any {
    const items = Object.create(null);
    // transactionLog.itemId points to stockItems.id. Codes can change over time.
    const stockItemsById = new Map(stockItems.filter(item => item.id).map(item => [item.id, item]));
    const stockItemsByCode = new Map(stockItems.map(item => [item.code, item]));
    const movementDate = (item: any) => item.transactionType === 'Delivery'
      ? item.deliveryDate
      : item.returnDate;
    const sortedData = [...allData].sort((a, b) =>
      this.getTimestamp(movementDate(a)) - this.getTimestamp(movementDate(b))
    );

    sortedData.forEach((item) => {
      // Only legacy rows without itemId fall back to a code lookup. Never use a
      // reused code to associate a known ID with a different catalogue item.
      const stockItem = item.itemId
        ? stockItemsById.get(item.itemId)
        : stockItemsByCode.get(item.code);
      const itemId = item.itemId || stockItem?.id;
      const key = itemId ? `id:${itemId}` : `legacy-code:${item.code}`;

      if (!items[key]) {
        items[key] = {
          id: itemId,
          currentBalance: 0,
          totalDelivered: 0,
          totalReturned: 0,
          totalAdjusted: 0,
          totalOverReturned: 0,
          deliveryMovements: {},
          returnMovements: {},
        };
      }

      // Prefer current catalogue details; if deleted, use the latest movement.
      items[key].code = stockItem?.code ?? item.code ?? items[key].code;
      items[key].name = stockItem?.name ?? item.name ?? items[key].name;
      items[key].weight = stockItem?.weight ?? item.weight ?? items[key].weight;
      items[key].category = stockItem?.category ?? item.category ?? items[key].category;
      items[key].size = stockItem?.size ?? item.size ?? items[key].size;
      items[key].location = item.location || items[key].location;

      // Count each movement. Same-site transfers cancel as a delivery and return;
      // matching by a document code can incorrectly discard other item movements.
      switch (item.transactionType) {
        case 'Delivery':
          const deliveryDate = this.formatDate(item.deliveryDate);
          if (deliveryDate) {
            items[key].deliveryMovements[deliveryDate] =
              (items[key].deliveryMovements[deliveryDate] || 0) +
              (Number(item.deliveredQty) || 0);
          }
          items[key].totalDelivered += Number(item.deliveredQty) || 0;
          break;
        case 'Return':
          const returnDate = this.formatDate(item.returnDate);
          if (returnDate) {
            items[key].returnMovements[returnDate] =
              (items[key].returnMovements[returnDate] || 0) +
              (Number(item.returnQty) || 0);
          }
          items[key].totalReturned += Number(item.returnQty) || 0;
          break;
        case 'Overage Return':
          const overageReturnDate = this.formatDate(item.returnDate);
          if (overageReturnDate) {
            items[key].returnMovements[overageReturnDate] =
              (items[key].returnMovements[overageReturnDate] || 0) +
              (Number(item.returnQty) || 0);
          }
          items[key].totalOverReturned += Number(item.returnQty) || 0;
          break;
        case 'Overage Return Reversal':
          const reversalDate = this.formatDate(item.returnDate);
          if (reversalDate) {
            items[key].returnMovements[reversalDate] =
              (items[key].returnMovements[reversalDate] || 0) -
              (Number(item.returnQty) || 0);
          }
          items[key].totalOverReturned -= Number(item.returnQty) || 0; // Subtract reversal
          break;
        case 'Adjustment':
          // adjustmentTotal is cumulative on the source delivery. returnQty is
          // the signed quantity of this individual adjustment (including zero).
          const adjustmentQty = Number(item.returnQty ?? item.adjustmentTotal ?? 0) || 0;
          const adjustmentDate = this.formatDate(item.returnDate);

          // Treat adjustments as returns (they reduce inventory)
          if (adjustmentDate) {
            items[key].returnMovements[adjustmentDate] =
              (items[key].returnMovements[adjustmentDate] || 0) +
              adjustmentQty;
          }
          items[key].totalAdjusted += adjustmentQty;
          break;
      }
    });

    // Calculate the current balance for each item
    Object.keys(items).forEach((key) => {
      // Simple calculation: Balance = Delivered - Returned
      items[key].currentBalance =
        items[key].totalDelivered -
        items[key].totalReturned -
        items[key].totalOverReturned -
        items[key].totalAdjusted;
    });

    return items;
  }
  private getTimestamp(timestamp: any): number {
    if (!timestamp) {
      return 0;
    }

    if (timestamp.seconds) {
      return timestamp.seconds * 1000;
    } else if (timestamp instanceof Date) {
      return timestamp.getTime();
    } else {
      return new Date(timestamp).getTime();
    }
  }

  private formatDate(timestamp: any): string {
    if (!timestamp) {
      return '';
    }

    let date: Date;
    if (timestamp.seconds) {
      // Firestore timestamp
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
