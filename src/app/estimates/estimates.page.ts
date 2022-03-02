import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from '../shared/company/company.state';
import { AddEstimatePage } from './add-estimate/add-estimate.component';
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
  isLoading = true;
  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }

  async editEstimate(estimate: Estimate) {
    const modal = await this.masterSvc.modal().create({
      component: AddEstimatePage,
      componentProps: {
        estimate,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editEstimate',
      cssClass: 'fullscreen',
    });
    return await modal.present();
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

  init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        let estimates = !!this.masterSvc
          .store()
          .selectSnapshot(EstimatesState.estimates);
        if (!estimates) this.masterSvc.store().dispatch(new GetEstimates(id));
      } else {
        console.log(
          '-----------------------try estimates----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
