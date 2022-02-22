import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AddEstimatePage } from '../estimates/add-estimate/add-estimate.component';
import { Company } from '../models/company.model';
import { Estimate } from '../models/estimate.model';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
})
export class TestPage implements OnInit {
  estimates$: Observable<Estimate[]>;
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
    this.company$.subscribe((e) => {
      console.log(e);
    });
  }
}
