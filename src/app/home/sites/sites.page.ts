import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, first } from 'rxjs';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from '../../shared/company/company.state';
import { Navigate } from '../../shared/router.state';
import { AddSiteComponent } from './add-site/add-site.component';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.page.html',
})
export class SitesPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  sites$: Observable<Site[]>;
  closedSites$: Observable<Site[]>;
  customers$: Observable<Customer[]>;
  isLoading = true;
  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }

  async viewSite(siteData: Site) {
    this.masterSvc
      .store()
      .dispatch(
        new Navigate(
          `/dashboard/site/${
            this.masterSvc.store().selectSnapshot(CompanyState.company).id
          }-${siteData.id}`
        )
      );
  }

  async addSite() {
    const modal = await this.masterSvc.modal().create({
      component: AddSiteComponent,
      componentProps: {
        isCreate: true,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addSite',
    });
    return await modal.present();
  }

  selectChange(event) {
    console.log(event);
  }

  update() {
    // this.masterSvc
    //   .edit()
    //   .getCollectionGroup('paymentApplications')
    //   // .pipe(first())
    //   .subscribe(async (data) => {
    //     let counter = 0;
    //     for (const i of data) {
    //       counter++;
    //       console.log(counter, i.company.id, i.company.name, i.code);
    //       // counter++;
    //       // try {
    //       //   await this.masterSvc
    //       //     .edit()
    //       //     .updateDoc(`company/${e.company.id}/bulkEstimates`, e.id, {
    //       //       addedToPA: false,
    //       //       type: 'bulk-measured',
    //       //     });
    //       //   console.log(counter, e.id, 'updated');
    //       // } catch (error) {
    //       //   console.error(error);
    //       // }
    //     }
    //   });
  }

  init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;

    setTimeout(() => {
      if (id) {
        this.sites$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/sites`,
            'status',
            '==',
            'active',
            'code',
            'desc'
          );
        this.closedSites$ = this.masterSvc
          .edit()
          .getCollectionWhereAndOrder(
            `company/${id}/sites`,
            'status',
            '==',
            'closed',
            'code',
            'desc'
          );
        this.customers$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/customers`, 'name', 'desc');
      } else {
        this.masterSvc.log(
          '-----------------------try sites----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
