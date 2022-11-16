import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
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

  init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;

    setTimeout(() => {
      if (id) {
        this.sites$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/sites`, 'code', 'desc');
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
