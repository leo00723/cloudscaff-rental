import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { map, Observable } from 'rxjs';
import { AddShipmentComponent } from 'src/app/components/add-shipment/add-shipment.component';
import { AddStockitemComponent } from 'src/app/components/add-stockitem/add-stockitem.component';
import { AddTransferComponent } from 'src/app/components/add-transfer/add-transfer.component';
import { ViewStockLocationsComponent } from 'src/app/components/view-stock-locations/view-stock-locations.component';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Shipment } from 'src/app/models/shipment.model';
import { Transfer } from 'src/app/models/transfer.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
})
export class InventoryPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  inventoryItems$: Observable<InventoryItem[]>;
  shipments$: Observable<Shipment[]>;
  transfers$: Observable<Transfer[]>;
  active = 1;
  constructor(private masterSvc: MasterService) {}
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
        map((data) => {
          return data.map((doc) => {
            const single = doc.items.find((i: any) => i.id === item.id);
            return { site: doc.site, item: single };
          });
        })
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
    this.active = ev.detail.value;
  }

  private init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;

    setTimeout(() => {
      if (id) {
        this.inventoryItems$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/stockItems`, 'code', 'asc');
        this.shipments$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/shipments`, 'code', 'desc');
        this.transfers$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/transfers`, 'code', 'desc');
      } else {
        console.log(
          '-----------------------try inventory----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
