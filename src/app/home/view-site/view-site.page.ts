import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { arrayUnion, increment, orderBy, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
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
import { AlertController } from '@ionic/angular';

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
export class ViewSitePage implements OnDestroy {
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

  private alertController = inject(AlertController);
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

  downloadPDF(items: InventoryItem[], site: Site) {
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    this.subs.add(
      this.masterSvc
        .edit()
        .getCollectionFiltered(`company/${company.id}/transactionLog`, [
          where('siteId', '==', site.id),
          where('transactionType', '==', 'Delivery'),
        ])
        .pipe(take(1))
        .subscribe(async (data) => {
          const groupedData = data.reduce((acc, item) => {
            const { itemId, deliveredQty, balanceQty, returnTotal } = item;

            // If the itemId is not in the accumulator, initialize it
            if (!acc[itemId]) {
              acc[itemId] = {
                ...item,
                deliveredQty: 0,
                balanceQty: 0,
                returnTotal: 0,
              };
            }

            // Sum the quantities
            acc[itemId].deliveredQty += deliveredQty || 0;
            acc[itemId].balanceQty += balanceQty || 0;
            acc[itemId].returnTotal += returnTotal || 0;

            return acc;
          }, {});

          // Convert the grouped object back to an array
          const groupedList = Object.values(groupedData);

          const pdf = await this.masterSvc
            .pdf()
            .inventoryTransactionList(site, groupedList, company);
          this.masterSvc
            .pdf()
            .handlePdf(pdf, `${site.code}-${site.name}-Inventory List`);
        })
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
}
