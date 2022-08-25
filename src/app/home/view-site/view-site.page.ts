import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AddRequestComponent } from 'src/app/components/add-request/add-request.component';
import { AddReturnComponent } from 'src/app/components/add-return/add-return.component';
import { Estimate } from 'src/app/models/estimate.model';
import { Request } from 'src/app/models/request.model';
import { Return } from 'src/app/models/return.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { Navigate } from 'src/app/shared/router.state';
import { ViewEstimateComponent } from '../../components/view-estimate/view-estimate.component';
import { AddSiteComponent } from '../sites/add-site/add-site.component';

@Component({
  selector: 'app-view-site',
  templateUrl: './view-site.page.html',
})
export class ViewSitePage {
  @Select() user$: Observable<User>;
  site$: Observable<Site>;
  estimates$: Observable<Estimate[]>;
  scaffolds$: Observable<Scaffold[]>;
  requests$: Observable<Request[]>;
  returns$: Observable<Return[]>;
  inventoryItems$: Observable<any>;
  active = 'scaffolds';
  ids = [];
  constructor(
    private masterSvc: MasterService,
    private activatedRoute: ActivatedRoute
  ) {
    this.ids = this.activatedRoute.snapshot.paramMap.get('id').split('-');
    this.site$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.ids[0]}/sites`, this.ids[1])
      .pipe(
        tap((site: Site) => {
          if (!site)
            this.masterSvc.store().dispatch(new Navigate('/dashboard/sites'));
        })
      ) as Observable<Site>;
    this.estimates$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/estimates`,
        'siteId',
        '==',
        this.ids[1],
        'date',
        'desc'
      ) as Observable<Estimate[]>;
    this.scaffolds$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/scaffolds`,
        'siteId',
        '==',
        this.ids[1],
        'date',
        'desc'
      ) as Observable<Scaffold[]>;
    this.inventoryItems$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.ids[0]}/siteStock`, this.ids[1]);
    this.requests$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/requests`,
        'site.id',
        '==',
        this.ids[1],
        'startDate',
        'desc'
      ) as Observable<Request[]>;
    this.returns$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/returns`,
        'site.id',
        '==',
        this.ids[1],
        'date',
        'desc'
      ) as Observable<Return[]>;
  }

  async viewEstimate(estimate: Estimate) {
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

  async editSite(site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddSiteComponent,
      componentProps: {
        siteData: site,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editSite',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async addRequest(site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddRequestComponent,
      componentProps: { site: site },
      showBackdrop: false,
      id: 'addRequest',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewRequest(requestData: Request, site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddRequestComponent,
      componentProps: { isEdit: true, value: requestData },
      showBackdrop: false,
      id: 'viewRequest',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async addReturn(site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddReturnComponent,
      componentProps: { siteData: site },
      showBackdrop: false,
      id: 'addReturn',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewReturn(returnData: Return, site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddReturnComponent,
      componentProps: { isEdit: true, value: returnData, siteData: site },
      showBackdrop: false,
      id: 'viewReturn',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  viewScaffold(scaffold: Scaffold) {
    this.masterSvc
      .store()
      .dispatch(
        new Navigate(
          `/dashboard/scaffold/${this.ids[0]}-${this.ids[1]}-${scaffold.id}`
        )
      );
  }

  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }
}
