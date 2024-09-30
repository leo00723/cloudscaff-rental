import { Component, OnInit } from '@angular/core';
import { orderBy, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import * as Papa from 'papaparse';
import { Observable, map } from 'rxjs';
import { AddRequestComponent } from 'src/app/components/add-request/add-request.component';
import { AddShipmentComponent } from 'src/app/components/add-shipment/add-shipment.component';
import { AddStockitemComponent } from 'src/app/components/add-stockitem/add-stockitem.component';
import { AddTransferComponent } from 'src/app/components/add-transfer/add-transfer.component';
import { DuplicateStockItemComponent } from 'src/app/components/duplicate-stock-item/duplicate-stock-item.component';
import { TransactionReturnComponent } from 'src/app/components/transaction-return/transaction-return.component';
import { ViewStockLocationsComponent } from 'src/app/components/view-stock-locations/view-stock-locations.component';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Request } from 'src/app/models/request.model';
import { Return } from 'src/app/models/return.model';
import { Shipment } from 'src/app/models/shipment.model';
import { Transfer } from 'src/app/models/transfer.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styles: [
    `
      ::-webkit-scrollbar {
        width: 0.2rem;
        height: 0rem;
      }
    `,
  ],
})
export class InventoryPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  inventoryItems$: Observable<InventoryItem[]>;

  shipments$: Observable<Shipment[]>;
  pendingShipments$: Observable<Shipment[]>;
  outboundShipments$: Observable<Shipment[]>;
  reservedShipments$: Observable<Shipment[]>;
  voidShipments$: Observable<Shipment[]>;

  transfers$: Observable<Transfer[]>;
  pendingTransfers$: Observable<Transfer[]>;

  requests$: Observable<Request[]>;
  submittedRequests$: Observable<Request[]>;
  partialRequests$: Observable<Request[]>;

  returns$: Observable<Return[]>;
  submittedReturns$: Observable<Return[]>;
  outboundReturns$: Observable<Return[]>;
  voidReturns$: Observable<Return[]>;

  active = 1;
  importing = false;
  uploading = false;
  uploadCounter = 0;
  uploadTotal = 0;

  constructor(
    private masterSvc: MasterService,
    private activatedRoute: ActivatedRoute
  ) {
    const page = Number(this.activatedRoute.snapshot.queryParamMap.get('page'));
    this.active = page >= 1 && page <= 6 ? page : 1;
  }
  ngOnInit() {
    this.init();
  }

  async addItem() {
    const modal = await this.masterSvc.modal().create({
      component: AddStockitemComponent,
      componentProps: {},
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addStockItem',
    });
    return await modal.present();
  }

  async editItem(item) {
    const modal = await this.masterSvc.modal().create({
      component: AddStockitemComponent,
      componentProps: {
        isEdit: true,
        value: item,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'editStockItem',
    });
    return await modal.present();
  }

  async duplicateItem(item) {
    const modal = await this.masterSvc.modal().create({
      component: DuplicateStockItemComponent,
      componentProps: {
        value: item,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'duplicateStockItem',
    });
    return await modal.present();
  }

  async viewItem(item: InventoryItem) {
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    const sites$ = this.masterSvc
      .edit()
      .getCollectionWhere(
        `company/${company.id}/siteStock`,
        'ids',
        'array-contains',
        item.id
      )
      .pipe(
        map((data) =>
          data.map((doc) => {
            const single = doc.items.find((i: any) => i.id === item.id);
            return { site: doc.site, item: single };
          })
        )
      );
    const modal = await this.masterSvc.modal().create({
      component: ViewStockLocationsComponent,
      componentProps: { locations$: sites$ },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'viewLocation',
    });
    return await modal.present();
  }

  async addShipment() {
    const modal = await this.masterSvc.modal().create({
      component: AddShipmentComponent,
      componentProps: { inventoryItems$: this.inventoryItems$ },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addShipment',
    });
    return await modal.present();
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

  async addReturn() {
    const modal = await this.masterSvc.modal().create({
      component: TransactionReturnComponent,
      componentProps: {},
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addReturn',
    });
    return await modal.present();
  }
  async viewReturn(returnData: Return) {
    const modal = await this.masterSvc.modal().create({
      component: TransactionReturnComponent,
      componentProps: { allowSend: true, isEdit: true, value: returnData },
      showBackdrop: false,
      id: 'viewReturn',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewRequest(requestData: Return) {
    const modal = await this.masterSvc.modal().create({
      component: AddRequestComponent,
      componentProps: { allowSend: true, isEdit: true, value: requestData },
      showBackdrop: false,
      id: 'viewRequest',
      cssClass: 'fullscreen',
    });
    await modal.present();
    const { role } = await modal.onDidDismiss();
    role === 'approved'
      ? this.masterSvc
          .store()
          .dispatch(new Navigate('/dashboard/inventory?page=2'))
      : null;
    return true;
  }
  async addTransfer() {
    const modal = await this.masterSvc.modal().create({
      component: AddTransferComponent,
      componentProps: {},
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addTransfer',
    });
    return await modal.present();
  }

  async viewTransfer(transfer: Transfer) {
    const modal = await this.masterSvc.modal().create({
      component: AddTransferComponent,
      componentProps: {
        isEdit: true,
        value: transfer,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'viewTransfer',
    });
    return await modal.present();
  }

  segmentChanged(ev: any) {
    this.active !== ev.detail.value
      ? (this.active = ev.detail.value)
      : console.log('same');
    this.importing = false;
  }

  help() {
    this.masterSvc
      .router()
      .navigateByUrl('/dashboard/settings/tutorial?ch=8&vid=0');
  }

  onFileChanged(event) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const file: File = event.target.files[0];
      const user = this.masterSvc.store().selectSnapshot(UserState.user);

      if (file) {
        Papa.parse(file, {
          header: true,
          worker: true,
          dynamicTyping: true,

          complete: async (result) => {
            this.uploading = true;
            const data = result.data.map((item) => ({
              code: item.Code || '',
              category: item.Category || '',
              size: item.Size || '',
              name: item.Description || '',
              location: item.Location || '',
              yardQty: +item.Yard_Qty || 0,
              availableQty: +item.Yard_Qty || 0,
              weight: parseFloat(item.Weight) || 0,
              inMaintenanceQty: 0,
              inUseQty: 0,
              damagedQty: 0,
              lostQty: 0,
              hireCost: parseFloat(item.Hire_Cost) || 0,
              replacementCost: parseFloat(item.Replacement_Cost) || 0,
              sellingCost: parseFloat(item.Selling_Cost) || 0,
              log: [
                {
                  message: `${user.name} added ${item.Yard_Qty} items to the yard.`,
                  user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image || '',
                  },
                  date: new Date(),
                  status: 'add',
                  comment: 'Imported',
                },
              ],
            }));
            const company = this.masterSvc
              .store()
              .selectSnapshot(CompanyState.company).id;
            this.uploadCounter = 0;
            this.uploadTotal = data.length || 0;
            for (const item of data) {
              try {
                await this.masterSvc
                  .edit()
                  .addDocument(`company/${company}/stockItems`, item);
              } catch (error) {
                console.log(error);
              } finally {
                this.uploadCounter++;
              }
            }
            if (this.uploadCounter === this.uploadTotal) {
              this.importing = false;
              this.uploading = false;
              this.masterSvc
                .notification()
                .toast('Import Successful', 'success');
            }
          },

          error: () => {
            this.importing = false;
            this.uploading = false;
            this.masterSvc
              .notification()
              .toast('Import Failed. Please try again.', 'danger');
          },
        });
      }
    });
  }

  private init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;

    setTimeout(() => {
      if (id) {
        this.inventoryItems$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/stockItems`, 'code', 'asc');

        // shipments
        this.shipments$ = this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${id}/shipments`, [
            where('status', 'in', ['sent', 'received']),
            orderBy('code', 'desc'),
          ]);
        this.pendingShipments$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/shipments`,
            'status',
            '==',
            'pending',
            'code',
            'asc'
          );
        this.outboundShipments$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/shipments`,
            'status',
            '==',
            'on-route',
            'code',
            'asc'
          );
        this.reservedShipments$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/shipments`,
            'status',
            '==',
            'reserved',
            'code',
            'asc'
          );
        this.voidShipments$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/shipments`,
            'status',
            '==',
            'void',
            'code',
            'asc'
          );

        // transfers
        this.transfers$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/transfers`,
            'status',
            '==',
            'sent',
            'code',
            'asc'
          );
        this.pendingTransfers$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/transfers`,
            'status',
            '==',
            'pending',
            'code',
            'asc'
          );
        // requests
        this.requests$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/requests`,
            'status',
            '==',
            'approved',
            'code',
            'asc'
          );
        this.submittedRequests$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/requests`,
            'status',
            '==',
            'submitted',
            'code',
            'asc'
          );
        this.partialRequests$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/requests`,
            'status',
            '==',
            'partial shipment',
            'code',
            'asc'
          );
        // returns
        this.returns$ = this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${id}/returns`, [
            where('status', 'in', ['sent', 'received']),
            orderBy('code', 'desc'),
          ]);
        this.submittedReturns$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/returns`,
            'status',
            '==',
            'submitted',
            'code',
            'desc'
          );
        this.outboundReturns$ = this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${id}/returns`, [
            where('status', 'in', ['on-route', 'collected']),
            orderBy('code', 'desc'),
          ]);
        this.voidReturns$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/returns`,
            'status',
            '==',
            'void',
            'code',
            'desc'
          );
      } else {
        this.masterSvc.log(
          '-----------------------try inventory----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
