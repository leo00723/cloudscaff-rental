import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ViewBulkEstimateComponent } from 'src/app/components/view-bulk-estimate/view-bulk-estimate.component';
import { ViewEstimateComponent } from 'src/app/components/view-estimate/view-estimate.component';
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
import { GetEstimates } from './state/estimate.actions';
import { EstimatesState } from './state/estimate.state';
@Component({
  selector: 'app-estimates',
  templateUrl: './estimates.page.html',
})
export class EstimatesPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  @Select() estimates$: Observable<Estimate[]>;
  bulkEstimates$: Observable<BulkEstimate[]>;
  inventoryEstimates$: Observable<BulkInventoryEstimate[]>;
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
    if (estimate.status === 'pending') {
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

  async editBulkEstimate(bulkEstimate: BulkEstimate) {
    if (bulkEstimate.status === 'pending') {
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
        component: ViewBulkEstimateComponent,
        componentProps: {
          bulkEstimate: inventoryEstimate,
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

  init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        let estimates = !!this.masterSvc
          .store()
          .selectSnapshot(EstimatesState.estimates);
        if (!estimates) this.masterSvc.store().dispatch(new GetEstimates(id));
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
      } else {
        this.masterSvc.log(
          '-----------------------try estimates----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
