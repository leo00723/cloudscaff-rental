import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { InventoryEstimateRent } from 'src/app/models/inventory-estimate-rent.model';
import { InventoryEstimateSell } from 'src/app/models/inventory-estimate-sell.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { UserState } from 'src/app/shared/user/user.state';
import { CompanyState } from '../../shared/company/company.state';
import { AddBasicEstimateComponent } from './basic-estimate/add-basic-estimate.component';
import { InventoryEstimateRentComponent } from './inventory-estimate-rent/inventory-estimate-rent.component';
import { InventoryEstimateSellComponent } from './inventory-estimate-sell/inventory-estimate-sell.component';
@Component({
  selector: 'app-estimates',
  templateUrl: './estimates.page.html',
})
export class EstimatesPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;

  estimatesV2$: Observable<EstimateV2[]>;
  inventoryEstimatesRent$: Observable<InventoryEstimateRent[]>;
  inventoryEstimatesSell$: Observable<InventoryEstimateSell[]>;

  inventoryItems$: Observable<InventoryItem[]>;

  active = 'basic';
  isLoading = true;
  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }
  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }
  async addEstimateV2() {
    const modal = await this.masterSvc.modal().create({
      component: AddBasicEstimateComponent,
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addEstimate',
    });
    return await modal.present();
  }
  async editEstimateV2(estimate: EstimateV2) {
    const modal = await this.masterSvc.modal().create({
      component: AddBasicEstimateComponent,
      componentProps: {
        value: estimate,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editEstimate',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async addInvSellEstimate() {
    const modal = await this.masterSvc.modal().create({
      component: InventoryEstimateSellComponent,
      componentProps: { inventoryItems$: this.inventoryItems$ },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addInvSellEstimate',
    });
    return await modal.present();
  }
  async editInvSellEstimate(estimate: InventoryEstimateSell) {
    const modal = await this.masterSvc.modal().create({
      component: InventoryEstimateSellComponent,
      componentProps: {
        value: estimate,
        inventoryItems$: this.inventoryItems$,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editSellEstimate',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async addInvRentEstimate() {
    const modal = await this.masterSvc.modal().create({
      component: InventoryEstimateRentComponent,
      componentProps: { inventoryItems$: this.inventoryItems$ },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addRentEstimate',
    });
    return await modal.present();
  }
  async editInvRentEstimate(estimate: InventoryEstimateRent) {
    const modal = await this.masterSvc.modal().create({
      component: InventoryEstimateRentComponent,
      componentProps: {
        value: estimate,
        inventoryItems$: this.inventoryItems$,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editRentEstimate',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  help() {
    this.masterSvc
      .router()
      .navigateByUrl('/dashboard/settings/tutorial?ch=2&vid=0');
  }
  init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        const user = this.masterSvc.store().selectSnapshot(UserState.user);

        this.estimatesV2$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/estimatesV2`, 'code', 'desc');
        this.inventoryEstimatesRent$ = this.masterSvc
          .edit()
          .getCollectionOrdered(
            `company/${id}/inventoryEstimatesRent`,
            'code',
            'desc'
          );
        this.inventoryEstimatesSell$ = this.masterSvc
          .edit()
          .getCollectionOrdered(
            `company/${id}/inventoryEstimatesSell`,
            'code',
            'desc'
          );
        this.inventoryItems$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/stockItems`, 'category', 'asc');
      } else {
        this.masterSvc.log(
          '-----------------------try estimates----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
