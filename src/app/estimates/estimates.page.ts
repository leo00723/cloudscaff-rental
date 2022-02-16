import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AddEstimatePage } from './add-estimate/add-estimate.page';
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
  isLoading = true;
  constructor(private masterSvc: MasterService) {
    this.company$ = this.masterSvc.auth().company$;
  }

  ngOnInit() {
    this.init();
  }

  async editEstimate(id: string) {
    const modal = await this.masterSvc.modal().create({
      component: AddEstimatePage,
      componentProps: {
        id,
      },
      showBackdrop: false,
      id: 'editEstimate',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async presentModal() {
    const modal = await this.masterSvc.modal().create({
      component: AddEstimatePage,
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
