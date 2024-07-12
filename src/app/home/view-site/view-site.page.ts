import { Component, OnInit } from '@angular/core';
import { orderBy, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AddBillableShipmentComponent } from 'src/app/components/add-billable-shipment/add-billable-shipment.component';
import { AddPaymentApplicationComponent } from 'src/app/components/add-payment-application/add-payment-application.component';
import { AddRequestComponent } from 'src/app/components/add-request/add-request.component';
import { AddReturnComponent } from 'src/app/components/add-return/add-return.component';
import { AddScaffoldComponent } from 'src/app/components/add-scaffold/add-scaffold.component';
import { AddShipmentComponent } from 'src/app/components/add-shipment/add-shipment.component';
import { ViewShipmentInvoiceComponent } from 'src/app/components/view-shipment-invoice/view-shipment-invoice.component';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { PaymentApplication } from 'src/app/models/paymentApplication.model';
import { Request } from 'src/app/models/request.model';
import { Return } from 'src/app/models/return.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Shipment } from 'src/app/models/shipment.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { ViewEstimateComponent } from '../../components/view-estimate/view-estimate.component';
import { AddSiteComponent } from '../sites/add-site/add-site.component';
import { AddInstructionComponent } from 'src/app/components/add-instruction/add-instruction.component';
import { SI } from 'src/app/models/si.model';

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
export class ViewSitePage implements OnInit {
  @Select() company$: Observable<Company>;
  @Select() user$: Observable<User>;
  site$: Observable<Site>;
  estimates$: Observable<Estimate[]>;
  scaffolds$: Observable<Scaffold[]>;
  pendingScaffolds$: Observable<Scaffold[]>;
  inactiveScaffolds$: Observable<Scaffold[]>;
  erectedScaffolds$: Observable<Scaffold[]>;
  activeScaffolds$: Observable<Scaffold[]>;
  dismantledScaffolds$: Observable<Scaffold[]>;
  requests$: Observable<Request[]>;

  pendingReturns$: Observable<Return[]>;
  outboundReturns$: Observable<Return[]>;
  returns$: Observable<Return[]>;

  billableShipments$: Observable<InventoryEstimate[]>;
  shipmentInvoices$: Observable<InventoryEstimate[]>;
  paymentApplications$: Observable<PaymentApplication[]>;
  operationApplications$: Observable<PaymentApplication[]>;

  outboundDeliveries$: Observable<Shipment[]>;
  deliveries$: Observable<Shipment[]>;

  pendingInstructions$: Observable<SI[]>;
  signedInstructions$: Observable<SI[]>;
  instructions$: Observable<SI[]>;

  inventoryItems$: Observable<any>;
  active = 'scaffolds';
  ids = [];
  constructor(
    private masterSvc: MasterService,
    private activatedRoute: ActivatedRoute
  ) {
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
    this.estimates$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/estimates`, [
        where('siteId', '==', this.ids[1]),
        orderBy('date', 'desc'),
      ]) as Observable<Estimate[]>;
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
    this.requests$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/requests`,
        'site.id',
        '==',
        this.ids[1],
        'startDate',
        'desc'
      ) as Observable<Request[]>;
    this.outboundDeliveries$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/shipments`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['on-route']),
        orderBy('code', 'desc'),
      ]) as Observable<Shipment[]>;
    this.deliveries$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/shipments`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['received']),
        orderBy('code', 'desc'),
      ]) as Observable<Shipment[]>;
    this.pendingInstructions$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/siteInstructions`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['needs signature']),
        orderBy('code', 'desc'),
      ]) as Observable<Shipment[]>;
    this.signedInstructions$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/siteInstructions`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['signed', 'scaffold created']),
        orderBy('code', 'desc'),
      ]) as Observable<Shipment[]>;
    this.instructions$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/siteInstructions`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['completed']),
        orderBy('code', 'desc'),
      ]) as Observable<Shipment[]>;
    this.outboundReturns$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/returns`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['on-route', 'collected']),
        orderBy('code', 'desc'),
      ]) as Observable<Shipment[]>;
    this.returns$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/returns`, [
        where('site.id', '==', this.ids[1]),
        where('status', 'in', ['sent', 'received']),
        orderBy('code', 'desc'),
      ]) as Observable<Shipment[]>;
    this.billableShipments$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/billableShipments`,
        'site.id',
        '==',
        this.ids[1],
        'date',
        'desc'
      ) as Observable<InventoryEstimate[]>;
    this.shipmentInvoices$ = this.masterSvc
      .edit()
      .getCollectionWhereWhereAndOrder(
        `company/${this.ids[0]}/invoices`,
        'site.id',
        '==',
        this.ids[1],
        'type',
        '==',
        'shipment',
        'date',
        'desc'
      ) as Observable<InventoryEstimate[]>;
    this.paymentApplications$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/paymentApplications`,
        'site.id',
        '==',
        this.ids[1],
        'date',
        'desc'
      ) as Observable<PaymentApplication[]>;
    this.operationApplications$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/operationApplications`,
        'site.id',
        '==',
        this.ids[1],
        'date',
        'desc'
      ) as Observable<PaymentApplication[]>;
  }
  ngOnInit() {}

  async addPaymentApplication(isPA: boolean) {
    const modal = await this.masterSvc.modal().create({
      component: AddPaymentApplicationComponent,
      componentProps: {
        isPA,
        siteId: this.ids[1],
        site$: this.site$,
      },
      showBackdrop: false,
      id: 'addPaymentApplication',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewPaymentApplication(
    paymentApplication: PaymentApplication,
    isPA: boolean
  ) {
    const modal = await this.masterSvc.modal().create({
      component: AddPaymentApplicationComponent,
      componentProps: {
        isPA,
        siteId: this.ids[1],
        value: paymentApplication,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'viewPaymentApplication',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async viewEstimate(estimate: Estimate) {
    const modal = await this.masterSvc.modal().create({
      component: ViewEstimateComponent,
      componentProps: {
        estimate,
      },
      showBackdrop: false,
      id: 'viewEstimate',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewBillableShipment(inventoryEstimate: InventoryEstimate) {
    const modal = await this.masterSvc.modal().create({
      component: AddBillableShipmentComponent,
      componentProps: {
        isEdit: true,
        value: inventoryEstimate,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'editShipment',
    });
    return await modal.present();
  }
  async viewShipmentInvoices(inventoryEstimate: InventoryEstimate) {
    const modal = await this.masterSvc.modal().create({
      component: ViewShipmentInvoiceComponent,
      componentProps: {
        invoice: inventoryEstimate,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'viewShipmentInvoice',
    });
    return await modal.present();
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
  async viewReturn(returnData: Return, site: Site) {
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

  async viewShipment(shipment: Shipment) {
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
    const pdf = await this.masterSvc
      .pdf()
      .generateInventoryList(site, items, company);
    this.masterSvc
      .pdf()
      .handlePdf(pdf, `${site.code}-${site.name}-Inventory List`);
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
}
