import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from '../../shared/company/company.state';
import { Navigate } from '../../shared/router.state';
import { AddSiteComponent } from './add-site/add-site.component';
import { GetSites } from './state/sites.actions';
import { SitesState } from './state/sites.state';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.page.html',
})
export class SitesPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  @Select() sites$: Observable<Site[]>;
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

    // const modal = await this.masterSvc.modal().create({
    //   component: ViewSitePage,
    //   componentProps: {
    //     company: data.company,
    //     user: data.user,
    //     siteData,
    //     isEdit: true,
    //   },
    //   showBackdrop: false,
    //   id: 'editSite',
    //   cssClass: 'fullscreen',
    // });
    // return await modal.present();
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

  init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;

    setTimeout(() => {
      if (id) {
        let sites = !!this.masterSvc.store().selectSnapshot(SitesState.sites);
        if (!sites) this.masterSvc.store().dispatch(new GetSites(id));
      } else {
        console.log('-----------------------try sites----------------------');
        this.init();
      }
    }, 200);
  }
}
