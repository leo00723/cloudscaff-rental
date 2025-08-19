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
import { PO } from 'src/app/models/po.model';
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
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { AddAdjustmentComponent } from 'src/app/components/add-adjustment/add-adjustment.component';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { UserState } from 'src/app/shared/user/user.state';
import { AlertController, LoadingController } from '@ionic/angular';
import * as XLSX from 'xlsx';

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

  purchaseOrders$: Observable<PO[]>;
  completedPO$: Observable<PO[]>;

  transactionInvoices$: Observable<TransactionInvoice[]>;

  inventoryItems$: Observable<any>;

  active = 'scaffolds';
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

    this.purchaseOrders$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/pos`, [
        where('site.id', '==', this.ids[1]),
        where('status', '==', 'pending'),
        orderBy('code', 'desc'),
      ]) as Observable<any[]>;
    this.completedPO$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/pos`, [
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

  async addPO(site: Site) {
    const alert = await this.alertController.create({
      header: 'Please enter PO number',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
        },
      ],
      inputs: [
        {
          type: 'text',
          placeholder: 'PO number',
          attributes: {
            minlength: 1,
          },
        },
      ],
      mode: 'ios',
    });

    await alert.present();
    const { role, data } = await alert.onDidDismiss();

    if (role !== 'confirm') {
      return;
    }

    const poNumber = data?.values[0];
    if (poNumber) {
      this.createPO(site, poNumber);
    } else {
      this.addPO(site);
      this.masterSvc.notification().toast('Enter a valid PO number', 'danger');
    }
  }

  createPO(site: Site, poNumber: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        const user = this.masterSvc.store().selectSnapshot(UserState.user);
        const estimate: EstimateV2 = {};
        estimate.poNumber = poNumber;
        estimate.siteId = site.id;
        estimate.siteName = site.name;
        estimate.customer = site.customer;
        estimate.acceptedBy = user.name;
        estimate.status = 'accepted';
        estimate.items = [];

        const po: PO = {};
        const code = this.masterSvc
          .edit()
          .generateDocCode(company.totalPOs, 'PO');
        Object.assign(po, {
          estimate,
          site,
          createdBy: user.id,
          createdByName: user.name,
          poNumber,
          code,
          id: '',
          date: new Date(),
          status: 'pending',
        });
        await this.masterSvc
          .edit()
          .addDocument(`company/${company.id}/pos`, po);
        await this.masterSvc.edit().updateDoc('company', company.id, {
          totalPOs: increment(1),
        });
        await this.masterSvc
          .edit()
          .updateDoc(`company/${company.id}/sites`, site.id, {
            poList: arrayUnion(poNumber),
          });
        this.masterSvc
          .notification()
          .toast('PO created successfully!', 'success');
      } catch (err) {
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your po, try again!',
            'danger',
            2000
          );
      }
    });
  }

  async viewPO(poData: PO, site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: PurchaseOrderComponent,
      componentProps: { value: poData, site },
      showBackdrop: false,
      id: 'viewPO',
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
    const allData = [
      ...deliveryData,
      ...adjustmentData,
      ...returnData,
      ...overageData,
      ...reversalData,
    ];

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

    // Get all transaction types (excluding transfers as they are detected from delivery/return pairs)
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

    // Combine all transaction data (excluding transfers to avoid double counting)
    const allData = [
      ...deliveryData,
      ...adjustmentData,
      ...returnData,
      ...overageData,
      ...reversalData,
    ];

    // Generate Excel file
    await this.generateExcelHistory(allData, site, stockItems);
    this.loading.dismiss();
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

    // Get all unique delivery and return dates
    const deliveryDates = [
      ...new Set(
        allData
          .filter(
            (item) =>
              (item.transactionType === 'Delivery' && item.deliveryDate) ||
              (item.transactionType === 'Adjustment' &&
                item.returnDate &&
                (item.adjustmentTotal || item.returnQty || 0) > 0)
          )
          .map((item) => this.formatDate(item.deliveryDate || item.returnDate))
          .filter((date) => date)
      ),
    ].sort();

    const returnDates = [
      ...new Set(
        allData
          .filter(
            (item) =>
              ((item.transactionType === 'Return' ||
                item.transactionType === 'Overage Return' ||
                item.transactionType === 'Overage Return Reversal') &&
                item.returnDate) ||
              (item.transactionType === 'Adjustment' &&
                item.returnDate &&
                (item.adjustmentTotal || item.returnQty || 0) < 0)
          )
          .map((item) => this.formatDate(item.returnDate))
          .filter((date) => date)
      ),
    ].sort();

    // Create table headers - Row 4
    const headers = [
      'SL NO',
      'Item Code',
      'Description',
      'Weight (kg)',
      'Total Balance In Project',
    ];

    // Add delivery date columns
    deliveryDates.forEach((date) => {
      headers.push(date);
    });

    headers.push('Delivered to Project');

    // Add return date columns
    returnDates.forEach((date) => {
      headers.push(date);
    });

    headers.push('Total Returned from Project');

    worksheetData.push(headers);

    // Create reference row - Row 5
    const referenceRow = ['Reference', '', '', '', ''];

    // Add delivery codes for each delivery date
    deliveryDates.forEach((date) => {
      const deliveryForDate = allData
        .filter(
          (item) =>
            item.transactionType === 'Delivery' &&
            this.formatDate(item.deliveryDate) === date
        )
        .map((item) => item.deliveryCode)
        .filter((code, index, self) => code && self.indexOf(code) === index)
        .join(', ');
      referenceRow.push(deliveryForDate);
    });

    referenceRow.push(''); // Empty cell for "Delivered to Project"

    // Add return codes for each return date
    returnDates.forEach((date) => {
      const returnForDate = allData
        .filter(
          (item) =>
            (item.transactionType === 'Return' ||
              item.transactionType === 'Overage Return') &&
            this.formatDate(item.returnDate) === date
        )
        .map((item) => item.returnCode)
        .filter((code, index, self) => code && self.indexOf(code) === index)
        .join(', ');

      const adjustmentForDate = allData
        .filter(
          (item) =>
            item.transactionType === 'Adjustment' &&
            this.formatDate(item.returnDate) === date
        )
        .map((item) => item.adjustmentCode || item.returnCode)
        .filter((code, index, self) => code && self.indexOf(code) === index)
        .join(', ');

      const combinedCodes = [returnForDate, adjustmentForDate]
        .filter((code) => code)
        .join(', ');

      referenceRow.push(combinedCodes);
    });

    referenceRow.push(''); // Empty cell for "Total Returned To Hayakel Company"

    worksheetData.push(referenceRow);

    // Process items data
    const itemsData = this.consolidateItemData(allData, stockItems);
    let slNo = 1;

    Object.values(itemsData).forEach((item: any) => {
      const row = [
        slNo++,
        item.code,
        item.name,
        item.weight || '',
        item.currentBalance || 0,
      ];

      // Add quantities for each delivery date
      deliveryDates.forEach((date) => {
        const qtyForDate = item.deliveryMovements[date] || 0;
        row.push(qtyForDate || '');
      });

      row.push(item.totalDelivered || 0);

      // Add quantities for each return date
      returnDates.forEach((date) => {
        const qtyForDate = item.returnMovements[date] || 0;
        row.push(qtyForDate || '');
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
    deliveryDates.forEach(() => {
      columnWidths.push({ wch: 12 });
    });

    columnWidths.push({ wch: 18 }); // Delivered to Project

    // Add widths for return date columns
    returnDates.forEach(() => {
      columnWidths.push({ wch: 12 });
    });

    columnWidths.push({ wch: 25 }); // Total Returned To Hayakel Company

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

  private consolidateItemData(
    allData: any[],
    stockItems: InventoryItem[]
  ): any {
    const items = {};

    // Create a lookup map for stockItems by code for efficient weight mapping
    const stockItemsMap = new Map();
    stockItems.forEach((stockItem) => {
      stockItemsMap.set(stockItem.code, stockItem);
    });

    // First, identify transfer transactions by matching delivery and return codes
    const transferCodes = new Set();
    const deliveryTransactions = allData.filter(
      (item) => item.transactionType === 'Delivery'
    );
    const returnTransactions = allData.filter(
      (item) => item.transactionType === 'Return'
    );

    // Find matching delivery and return codes (indicating same-site transfers)
    deliveryTransactions.forEach((delivery) => {
      const matchingReturn = returnTransactions.find(
        (returnItem) =>
          returnItem.returnCode === delivery.deliveryCode &&
          returnItem.itemId === delivery.itemId
      );
      if (matchingReturn) {
        transferCodes.add(delivery.deliveryCode);
      }
    });

    // Sort data by date to ensure we get the latest balance
    const sortedData = allData.sort((a, b) => {
      const dateA = a.deliveryDate || a.returnDate;
      const dateB = b.deliveryDate || b.returnDate;
      return this.getTimestamp(dateA) - this.getTimestamp(dateB);
    });

    sortedData.forEach((item) => {
      const key = item.code;

      if (!items[key]) {
        // Get weight from stockItems lookup, fallback to transaction item weight
        const masterStockItem = stockItemsMap.get(item.code);
        const weight = masterStockItem?.weight || item.weight;

        items[key] = {
          code: item.code,
          name: item.name,
          currentBalance: 0,
          totalDelivered: 0,
          totalReturned: 0,
          deliveryMovements: {},
          returnMovements: {},
          location: item.location,
          category: item.category,
          size: item.size,
          weight,
        };
      }

      // Update other fields with latest values
      items[key].location = item.location || items[key].location;
      // Update weight from stockItems if available
      const stockItem = stockItemsMap.get(item.code);
      if (stockItem?.weight) {
        items[key].weight = stockItem.weight;
      } else if (item.weight) {
        items[key].weight = item.weight;
      }

      // Check if this is a same-site transfer
      const isTransfer =
        (item.transactionType === 'Delivery' &&
          transferCodes.has(item.deliveryCode)) ||
        (item.transactionType === 'Return' &&
          transferCodes.has(item.returnCode));

      // Skip same-site transfers to avoid double counting
      if (!isTransfer) {
        // Track movements by date and accumulate totals
        switch (item.transactionType) {
          case 'Delivery':
            const deliveryDate = this.formatDate(item.deliveryDate);
            if (deliveryDate) {
              items[key].deliveryMovements[deliveryDate] =
                (items[key].deliveryMovements[deliveryDate] || 0) +
                (item.deliveredQty || 0);
            }
            items[key].totalDelivered += item.deliveredQty || 0;
            break;
          case 'Return':
          case 'Overage Return':
            const returnDate = this.formatDate(item.returnDate);
            if (returnDate) {
              items[key].returnMovements[returnDate] =
                (items[key].returnMovements[returnDate] || 0) +
                (item.returnQty || 0);
            }
            items[key].totalReturned += item.returnQty || 0;
            break;
          case 'Overage Return Reversal':
            const reversalDate = this.formatDate(item.returnDate);
            if (reversalDate) {
              items[key].returnMovements[reversalDate] =
                (items[key].returnMovements[reversalDate] || 0) -
                (item.returnQty || 0);
            }
            items[key].totalReturned -= item.returnQty || 0; // Subtract reversal
            break;
          case 'Adjustment':
            const adjustmentQty = item.adjustmentTotal || item.returnQty || 0;
            const adjustmentDate = this.formatDate(item.returnDate);

            // Treat adjustments as returns (they reduce inventory)
            if (adjustmentDate) {
              items[key].returnMovements[adjustmentDate] =
                (items[key].returnMovements[adjustmentDate] || 0) +
                Math.abs(adjustmentQty);
            }
            items[key].totalReturned += Math.abs(adjustmentQty);
            break;
        }
      }
    });

    // Calculate the current balance for each item
    Object.keys(items).forEach((key) => {
      // Simple calculation: Balance = Delivered - Returned
      items[key].currentBalance =
        items[key].totalDelivered - items[key].totalReturned;
    });

    return items;
  }

  private consolidateItemDataPDF(
    allData: any[],
    stockItems: InventoryItem[]
  ): any {
    const items = {};

    // Create a lookup map for stockItems by code for efficient weight mapping
    const stockItemsMap = new Map();
    stockItems.forEach((stockItem) => {
      stockItemsMap.set(stockItem.code, stockItem);
    });

    // First, identify transfer transactions by matching delivery and return codes
    const transferCodes = new Set();
    const deliveryTransactions = allData.filter(
      (item) => item.transactionType === 'Delivery'
    );
    const returnTransactions = allData.filter(
      (item) => item.transactionType === 'Return'
    );

    // Find matching delivery and return codes (indicating same-site transfers)
    deliveryTransactions.forEach((delivery) => {
      const matchingReturn = returnTransactions.find(
        (returnItem) =>
          returnItem.returnCode === delivery.deliveryCode &&
          returnItem.itemId === delivery.itemId
      );
      if (matchingReturn) {
        transferCodes.add(delivery.deliveryCode);
      }
    });

    // Sort data by date to ensure we get the latest balance
    const sortedData = allData.sort((a, b) => {
      const dateA = a.deliveryDate || a.returnDate;
      const dateB = b.deliveryDate || b.returnDate;
      return this.getTimestamp(dateA) - this.getTimestamp(dateB);
    });

    sortedData.forEach((item) => {
      const key = item.code;

      if (!items[key]) {
        // Get weight from stockItems lookup, fallback to transaction item weight
        const masterStockItem = stockItemsMap.get(item.code);
        const weight = masterStockItem?.weight || item.weight;

        items[key] = {
          code: item.code,
          name: item.name,
          currentBalance: 0,
          totalDelivered: 0,
          totalReturned: 0,
          totalAdjusted: 0,
          totalOverReturned: 0,
          deliveryMovements: {},
          returnMovements: {},
          location: item.location,
          category: item.category,
          size: item.size,
          weight,
        };
      }

      // Update other fields with latest values
      items[key].location = item.location || items[key].location;
      // Update weight from stockItems if available
      const stockItem = stockItemsMap.get(item.code);
      if (stockItem?.weight) {
        items[key].weight = stockItem.weight;
      } else if (item.weight) {
        items[key].weight = item.weight;
      }

      // Check if this is a same-site transfer
      const isTransfer =
        (item.transactionType === 'Delivery' &&
          transferCodes.has(item.deliveryCode)) ||
        (item.transactionType === 'Return' &&
          transferCodes.has(item.returnCode));

      // Skip same-site transfers to avoid double counting
      if (!isTransfer) {
        // Track movements by date and accumulate totals
        switch (item.transactionType) {
          case 'Delivery':
            const deliveryDate = this.formatDate(item.deliveryDate);
            if (deliveryDate) {
              items[key].deliveryMovements[deliveryDate] =
                (items[key].deliveryMovements[deliveryDate] || 0) +
                (item.deliveredQty || 0);
            }
            items[key].totalDelivered += item.deliveredQty || 0;
            break;
          case 'Return':
          case 'Overage Return':
            const returnDate = this.formatDate(item.returnDate);
            if (returnDate) {
              items[key].returnMovements[returnDate] =
                (items[key].returnMovements[returnDate] || 0) +
                (item.returnQty || 0);
            }
            items[key].totalOverReturned += item.returnQty || 0;
            break;
          case 'Overage Return Reversal':
            const reversalDate = this.formatDate(item.returnDate);
            if (reversalDate) {
              items[key].returnMovements[reversalDate] =
                (items[key].returnMovements[reversalDate] || 0) -
                (item.returnQty || 0);
            }
            items[key].totalOverReturned -= item.returnQty || 0; // Subtract reversal
            break;
          case 'Adjustment':
            const adjustmentQty = item.adjustmentTotal || item.returnQty || 0;
            const adjustmentDate = this.formatDate(item.returnDate);

            // Treat adjustments as returns (they reduce inventory)
            if (adjustmentDate) {
              items[key].returnMovements[adjustmentDate] =
                (items[key].returnMovements[adjustmentDate] || 0) +
                Math.abs(adjustmentQty);
            }
            items[key].totalAdjusted += Math.abs(adjustmentQty);
            break;
        }
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
