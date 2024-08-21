import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ViewBulkEstimateComponent } from 'src/app/components/view-bulk-estimate/view-bulk-estimate.component';
import { ViewEstimateComponent } from 'src/app/components/view-estimate/view-estimate.component';
import { ViewInventoryEstimateComponent } from 'src/app/components/view-inventory-estimate/view-inventory-estimate.component';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { BulkInventoryEstimate } from 'src/app/models/bulkInventoryEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from '../../shared/company/company.state';
import { AddEstimatePage } from './add-estimate/add-estimate.component';
import { BulkEstimateComponent } from './bulk-estimate/bulk-estimate.component';
import { InventoryEstimateComponent } from './inventory-estimate/inventory-estimate.component';
import { AddEstimateV2Component } from './add-estimate-v2/add-estimate-v2.component';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { InventoryEstimateSellComponent } from './inventory-estimate-sell/inventory-estimate-sell.component';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { InventoryEstimateSell } from 'src/app/models/inventory-estimate-sell.model';
import { UserState } from 'src/app/shared/user/user.state';
@Component({
  selector: 'app-estimates',
  templateUrl: './estimates.page.html',
})
export class EstimatesPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  estimates$: Observable<Estimate[]>;
  bulkEstimates$: Observable<BulkEstimate[]>;
  inventoryEstimates$: Observable<BulkInventoryEstimate[]>;
  inventoryItems$: Observable<InventoryItem[]>;

  estimatesV2$: Observable<EstimateV2[]>;
  inventoryEstimatesSell$: Observable<InventoryEstimateSell[]>;

  active = 'standard';
  isLoading = true;
  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }
  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }

  async editEstimate(estimate: Estimate) {
    if (
      estimate.status === 'pending' ||
      estimate.status === 'revised' ||
      estimate.status === 'rejected'
    ) {
      const modal = await this.masterSvc.modal().create({
        component: AddEstimatePage,
        componentProps: {
          value: estimate,
          isEdit: true,
        },
        showBackdrop: false,
        id: 'editEstimate',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    } else {
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
  }
  async editEstimateV2(estimate: EstimateV2) {
    if (
      estimate.status === 'pending' ||
      estimate.status === 'revised' ||
      estimate.status === 'rejected' ||
      estimate.status === 'accepted'
    ) {
      const modal = await this.masterSvc.modal().create({
        component: AddEstimateV2Component,
        componentProps: {
          value: estimate,
          isEdit: true,
        },
        showBackdrop: false,
        id: 'editEstimate',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    } else {
      // const modal = await this.masterSvc.modal().create({
      //   component: ViewEstimateComponent,
      //   componentProps: {
      //     estimate,
      //   },
      //   showBackdrop: false,
      //   id: 'viewEstimate',
      //   cssClass: 'fullscreen',
      // });
      // return await modal.present();
    }
  }
  async editInvSellEstimate(estimate: InventoryEstimateSell) {
    if (
      estimate.status === 'pending' ||
      estimate.status === 'revised' ||
      estimate.status === 'rejected'
    ) {
      const modal = await this.masterSvc.modal().create({
        component: InventoryEstimateSellComponent,
        componentProps: {
          value: estimate,
          inventoryItems$: this.inventoryItems$,
          isEdit: true,
        },
        showBackdrop: false,
        id: 'editEstimate',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    } else {
      // const modal = await this.masterSvc.modal().create({
      //   component: ViewEstimateComponent,
      //   componentProps: {
      //     estimate,
      //   },
      //   showBackdrop: false,
      //   id: 'viewEstimate',
      //   cssClass: 'fullscreen',
      // });
      // return await modal.present();
    }
  }

  async editBulkEstimate(bulkEstimate: BulkEstimate) {
    if (
      bulkEstimate.status === 'pending' ||
      bulkEstimate.status === 'revised'
    ) {
      const modal = await this.masterSvc.modal().create({
        component: BulkEstimateComponent,
        componentProps: {
          value: bulkEstimate,
          isEdit: true,
        },
        showBackdrop: false,
        id: 'editEstimate',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    } else {
      const modal = await this.masterSvc.modal().create({
        component: ViewBulkEstimateComponent,
        componentProps: {
          bulkEstimate,
        },
        showBackdrop: false,
        id: 'viewEstimate',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    }
  }

  async editInventoryEstimate(inventoryEstimate: BulkInventoryEstimate) {
    if (inventoryEstimate.status === 'pending') {
      const modal = await this.masterSvc.modal().create({
        component: InventoryEstimateComponent,
        componentProps: {
          value: inventoryEstimate,
          isEdit: true,
        },
        showBackdrop: false,
        id: 'editEstimate',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    } else {
      const modal = await this.masterSvc.modal().create({
        component: ViewInventoryEstimateComponent,
        componentProps: {
          bulkInventoryEstimate: inventoryEstimate,
        },
        showBackdrop: false,
        id: 'viewEstimate',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    }
  }

  async addEstimate() {
    const modal = await this.masterSvc.modal().create({
      component: AddEstimatePage,
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addEstimate',
    });
    return await modal.present();
  }
  async addEstimateV2() {
    const modal = await this.masterSvc.modal().create({
      component: AddEstimateV2Component,
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addEstimate',
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

  async addInventoryEstimate() {
    const modal = await this.masterSvc.modal().create({
      component: InventoryEstimateComponent,
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addInventoryEstimate',
    });
    return await modal.present();
  }

  async addBulkEstimate() {
    const modal = await this.masterSvc.modal().create({
      component: BulkEstimateComponent,
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addBulkEstimate',
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
        this.active = user.permissionsList.includes('Standard Estimates')
          ? 'standard'
          : 'basic';
        this.estimates$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/estimates`, 'code', 'desc');
        this.estimatesV2$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/estimatesV2`, 'code', 'desc');
        this.inventoryEstimatesSell$ = this.masterSvc
          .edit()
          .getCollectionOrdered(
            `company/${id}/inventoryEstimatesSell`,
            'code',
            'desc'
          );
        this.bulkEstimates$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/bulkEstimates`, 'code', 'desc');
        this.inventoryEstimates$ = this.masterSvc
          .edit()
          .getCollectionOrdered(
            `company/${id}/inventoryEstimates`,
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
