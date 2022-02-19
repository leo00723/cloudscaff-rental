import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AddEstimatePage } from './add-estimate/add-estimate.component';
import { Company } from '../models/company.model';
import { MasterService } from '../services/master.service';
import { Estimate } from '../models/estimate.model';
@Component({
  selector: 'app-estimates',
  templateUrl: './estimates.page.html',
})
export class EstimatesPage implements OnInit {
  estimates$: Observable<Estimate[] | any>;
  company$: Observable<Company>;
  user$: Observable<any>;
  isLoading = true;
  constructor(private masterSvc: MasterService) {
    this.company$ = this.masterSvc.auth().company$;
    this.user$ = this.masterSvc.auth().user$;
  }

  ngOnInit() {
    this.init();
  }

  async editEstimate(
    estimate: Estimate,
    data: { company: Company; user: any }
  ) {
    const modal = await this.masterSvc.modal().create({
      component: AddEstimatePage,
      componentProps: {
        company: data.company,
        user: data.user,
        estimate,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editEstimate',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async addEstimate(data: { company: Company; user: any }) {
    const modal = await this.masterSvc.modal().create({
      component: AddEstimatePage,
      componentProps: {
        company: data.company,
        user: data.user,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addEstimate',
    });
    return await modal.present();
  }

  init() {
    this.estimates$ = this.company$.pipe(
      switchMap((company) => {
        if (company) {
          return this.masterSvc
            .edit()
            .getDocsByCompanyIdOrdered(
              `company/${company.id}/estimates`,
              'date',
              'desc'
            );
        } else {
          return of(false);
        }
      })
    ) as Observable<any>;
  }
}
