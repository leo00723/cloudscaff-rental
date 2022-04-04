import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SetSite } from 'src/app/home/sites/state/sites.actions';
import { Estimate } from 'src/app/models/estimate.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Site } from 'src/app/models/site.model';
import { MasterService } from 'src/app/services/master.service';
import { Navigate } from 'src/app/shared/router.state';
import { ViewEstimateComponent } from '../../components/view-estimate/view-estimate.component';
import { AddSiteComponent } from '../sites/add-site/add-site.component';

@Component({
  selector: 'app-view-site',
  templateUrl: './view-site.page.html',
})
export class ViewSitePage implements OnDestroy {
  site$: Observable<Site>;
  estimates$: Observable<Estimate[]>;
  scaffolds$: Observable<Scaffold[]>;
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
          // this.masterSvc.store().dispatch(new SetSite(site));
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

  ngOnDestroy(): void {
    this.masterSvc.store().dispatch(new SetSite(null));
  }
}
