import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from '../shared/company/company.state';
import { GetSites } from '../shared/sites/sites.actions';
import { AddSiteComponent } from './add-site/add-site.component';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.page.html',
})
export class SitesPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  @Select() sites$: Observable<Site[]>;
  isLoading = true;
  constructor(
    private masterSvc: MasterService,
    private change: ChangeDetectorRef
  ) {}

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
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.masterSvc.store().dispatch(new GetSites(id));
      } else {
        console.log('-----------------------try----------------------');
        this.init();
      }
    }, 200);

    // this.sites$ = this.company$.pipe(
    //   switchMap((company) => {
    //     if (company) {
    //       return this.masterSvc
    //         .edit()
    //         .getDocsByCompanyIdOrdered(
    //           `company/${company.id}/sites`,
    //           'code',
    //           'desc'
    //         )
    //         .pipe(
    //           tap(() => {
    //             this.isLoading = false;
    //             this.change.detectChanges();
    //           })
    //         );
    //     } else {
    //       return timer(1);
    //     }
    //   })
    // ) as Observable<any>;
  }
}
