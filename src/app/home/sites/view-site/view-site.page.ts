import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Estimate } from 'src/app/models/estimate.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Site } from 'src/app/models/site.model';
import { MasterService } from 'src/app/services/master.service';
import { Navigate } from 'src/app/shared/router.state';
import { SetSite } from 'src/app/home/sites/state/sites.actions';
import { ViewEstimateComponent } from './view-estimate/view-estimate.component';

@Component({
  selector: 'app-view-site',
  templateUrl: './view-site.page.html',
})
export class ViewSitePage implements OnDestroy {
  site$: Observable<Site>;
  estimates$: Observable<Estimate[]>;
  scaffolds$: Observable<Scaffold[]>;
  active = 'scaffolds';

  constructor(
    private masterSvc: MasterService,
    private activatedRoute: ActivatedRoute
  ) {
    const ids = this.activatedRoute.snapshot.paramMap.get('id').split('-');
    this.site$ = this.masterSvc
      .edit()
      .getDocById(`company/${ids[0]}/sites`, ids[1])
      .pipe(
        tap((site: Site) => {
          if (!site)
            this.masterSvc.store().dispatch(new Navigate('/dashboard/sites'));
          this.masterSvc.store().dispatch(new SetSite(site));
        })
      ) as Observable<Site>;
    this.estimates$ = this.masterSvc
      .edit()
      .getCollectionWhere(
        `company/${ids[0]}/estimates`,
        'siteId',
        '==',
        ids[1]
      ) as Observable<Estimate[]>;
    this.scaffolds$ = this.masterSvc
      .edit()
      .getCollectionWhere(
        `company/${ids[0]}/scaffolds`,
        'siteId',
        '==',
        ids[1]
      ) as Observable<Scaffold[]>;
  }

  async editEstimate(estimate: Estimate) {
    const modal = await this.masterSvc.modal().create({
      component: ViewEstimateComponent,
      componentProps: {
        estimate,
      },
      showBackdrop: false,
      id: 'editEstimate',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }

  ngOnDestroy(): void {
    this.masterSvc.store().dispatch(new SetSite(null));
  }
}
