import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AddBillableShipmentComponent } from 'src/app/components/add-billable-shipment/add-billable-shipment.component';
import { AddPaymentApplicationComponent } from 'src/app/components/add-payment-application/add-payment-application.component';
import { AddRequestComponent } from 'src/app/components/add-request/add-request.component';
import { AddReturnComponent } from 'src/app/components/add-return/add-return.component';
import { ShipmentInvoiceSummaryComponent } from 'src/app/components/shipment-invoice-summary/shipment-invoice-summary.component';
import { ViewShipmentInvoiceComponent } from 'src/app/components/view-shipment-invoice/view-shipment-invoice.component';
import { Estimate } from 'src/app/models/estimate.model';
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { PaymentApplication } from 'src/app/models/paymentApplication.model';
import { Request } from 'src/app/models/request.model';
import { Return } from 'src/app/models/return.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { ViewEstimateComponent } from '../../components/view-estimate/view-estimate.component';
import { AddSiteComponent } from '../sites/add-site/add-site.component';
import { AddScaffoldComponent } from 'src/app/components/add-scaffold/add-scaffold.component';

@Component({
  selector: 'app-view-site',
  templateUrl: './view-site.page.html',
})
export class ViewSitePage implements OnInit {
  @Select() user$: Observable<User>;
  site$: Observable<Site>;
  estimates$: Observable<Estimate[]>;
  scaffolds$: Observable<Scaffold[]>;
  requests$: Observable<Request[]>;
  returns$: Observable<Return[]>;
  billableShipments$: Observable<InventoryEstimate[]>;
  shipmentInvoices$: Observable<InventoryEstimate[]>;
  paymentApplications$: Observable<PaymentApplication[]>;
  operationApplications$: Observable<PaymentApplication[]>;

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
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/estimates`,
        'siteId',
        '==',
        this.ids[1],
        'date',
        'desc'
      ) as Observable<Estimate[]>;
    this.scaffolds$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/scaffolds`,
        'siteId',
        '==',
        this.ids[1],
        'date',
        'desc'
      ) as Observable<Scaffold[]>;
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
    this.returns$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/returns`,
        'site.id',
        '==',
        this.ids[1],
        'date',
        'desc'
      ) as Observable<Return[]>;
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

  async addScaffold(site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddScaffoldComponent,
      componentProps: { siteData: site },
      showBackdrop: false,
      id: 'addScaffold',
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

  help() {
    this.masterSvc
      .router()
      .navigateByUrl('/dashboard/settings/tutorial?ch=6&vid=0');
  }
}
