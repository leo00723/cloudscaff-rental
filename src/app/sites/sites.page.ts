import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SiteFormComponent } from '../components/site-form/site-form.component';
import { AddEstimatePage } from '../estimates/add-estimate/add-estimate.component';
import { Company } from '../models/company.model';
import { Estimate } from '../models/estimate.model';
import { Site } from '../models/site.model';
import { MasterService } from '../services/master.service';
import { AddSiteComponent } from './add-site/add-site.component';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.page.html',
})
export class SitesPage implements OnInit {
  sites$: Observable<Site[] | any>;
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
  async viewSite(siteData: Site, data: { company: Company; user: any }) {
    const modal = await this.masterSvc.modal().create({
      component: AddSiteComponent,
      componentProps: {
        company: data.company,
        user: data.user,
        siteData,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editSite',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async addSite(data: { company: Company; user: any }) {
    const modal = await this.masterSvc.modal().create({
      component: AddSiteComponent,
      componentProps: {
        company: data.company,
        user: data.user,
        isCreate: true,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addSite',
    });
    return await modal.present();
  }

  init() {
    this.sites$ = this.company$.pipe(
      switchMap((company) => {
        if (company) {
          return this.masterSvc
            .edit()
            .getDocsByCompanyIdOrdered(
              `company/${company.id}/sites`,
              'code',
              'desc'
            );
        } else {
          return of(false);
        }
      })
    ) as Observable<any>;
  }
}
