import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { AddHandoverComponent } from 'src/app/components/add-handover/add-handover.component';
import { AddInspectionComponent } from 'src/app/components/add-inspection/add-inspection.component';
import { AddModificationComponent } from 'src/app/components/add-modification/add-modification.component';
import { HandoverSummaryComponent } from 'src/app/components/handover-summary/handover-summary.component';
import { InspectionSummaryComponent } from 'src/app/components/inspection-summary/inspection-summary.component';
import { Company } from 'src/app/models/company.model';
import { Handover } from 'src/app/models/handover.model';
import { Inspection } from 'src/app/models/inspection.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { Navigate } from 'src/app/shared/router.state';
import { SetSite } from '../sites/state/sites.actions';

@Component({
  selector: 'app-view-scaffold',
  templateUrl: './view-scaffold.page.html',
})
export class ViewScaffoldPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  scaffold$: Observable<Scaffold>;
  inspections$: Observable<Inspection[]>;
  handovers$: Observable<Handover[]>;
  active = 'overview';
  ids = [];
  constructor(
    private masterSvc: MasterService,
    private activatedRoute: ActivatedRoute
  ) {
    this.ids = this.activatedRoute.snapshot.paramMap.get('id').split('-');
    this.scaffold$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.ids[0]}/scaffolds`, this.ids[2])
      .pipe(
        tap((site: Scaffold) => {
          if (!site)
            this.masterSvc
              .store()
              .dispatch(
                new Navigate(`/dashboard/site/${this.ids[0]}-${this.ids[1]}`)
              );
          // this.masterSvc.store().dispatch(new SetSite(site));
        })
      ) as Observable<Scaffold>;
    this.inspections$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/inspections`,
        'scaffold.id',
        '==',
        this.ids[2],
        'date',
        'desc'
      ) as Observable<Inspection[]>;
    this.handovers$ = this.masterSvc
      .edit()
      .getCollectionWhereAndOrder(
        `company/${this.ids[0]}/handovers`,
        'scaffold.id',
        '==',
        this.ids[2],
        'date',
        'desc'
      ) as Observable<Handover[]>;
  }
  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }
  ngOnInit() {}

  async addInspection(scaffold: Scaffold) {
    const modal = await this.masterSvc.modal().create({
      component: AddInspectionComponent,
      componentProps: {
        value: scaffold,
      },
      showBackdrop: false,
      id: 'addInspection',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async addHandover(scaffold: Scaffold) {
    const modal = await this.masterSvc.modal().create({
      component: AddHandoverComponent,
      componentProps: {
        value: scaffold,
      },
      showBackdrop: false,
      id: 'addHandover',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async addModification(scaffold: Scaffold) {
    const modal = await this.masterSvc.modal().create({
      component: AddModificationComponent,
      componentProps: {
        value: scaffold,
      },
      showBackdrop: false,
      id: 'addModification',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async viewInspection(inspection: Inspection) {
    const modal = await this.masterSvc.modal().create({
      component: InspectionSummaryComponent,
      componentProps: {
        inspection,
      },
      showBackdrop: false,
      id: 'viewInspection',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
  async viewHandover(handover: Handover) {
    const modal = await this.masterSvc.modal().create({
      component: HandoverSummaryComponent,
      componentProps: {
        handover,
      },
      showBackdrop: false,
      id: 'viewHandover',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
}
