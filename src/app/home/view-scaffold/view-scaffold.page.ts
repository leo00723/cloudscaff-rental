import { Component, OnInit, inject } from '@angular/core';
import {
  increment,
  orderBy,
  serverTimestamp,
  where,
} from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Select } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import { Observable, tap } from 'rxjs';
import { AddHandoverComponent } from 'src/app/components/add-handover/add-handover.component';
import { AddInspectionComponent } from 'src/app/components/add-inspection/add-inspection.component';
import { AddInstructionComponent } from 'src/app/components/add-instruction/add-instruction.component';
import { DismantleSummaryComponent } from 'src/app/components/dismantle-summary/dismantle-summary.component';
import { HandoverSummaryComponent } from 'src/app/components/handover-summary/handover-summary.component';
import { InspectionSummaryComponent } from 'src/app/components/inspection-summary/inspection-summary.component';
import { Company } from 'src/app/models/company.model';
import { Handover } from 'src/app/models/handover.model';
import { Inspection } from 'src/app/models/inspection.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { SI } from 'src/app/models/si.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { Navigate } from 'src/app/shared/router.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-view-scaffold',
  templateUrl: './view-scaffold.page.html',
  styles: [
    `
      /* Styles for the scrollbar track */
      ::-webkit-scrollbar {
        width: 0.2rem;
        height: 0rem;
      }
    `,
  ],
})
export class ViewScaffoldPage implements OnInit {
  private loadingCtrl = inject(LoadingController);

  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  scaffold$: Observable<Scaffold>;
  instructions$: Observable<SI[]>;
  inspections$: Observable<Inspection[]>;
  handovers$: Observable<Handover[]>;
  dismantles$: Observable<Handover[]>;
  site$: Observable<Site>;
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
          if (!site) {
            this.masterSvc
              .store()
              .dispatch(
                new Navigate(`/dashboard/site/${this.ids[0]}-${this.ids[1]}`)
              );
          }
        })
      ) as Observable<Scaffold>;
    this.instructions$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/siteInstructions`, [
        where('scaffoldIDs', 'array-contains', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<SI[]>;
    this.inspections$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/inspections`, [
        where('scaffold.id', '==', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<Inspection[]>;
    this.handovers$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/handovers`, [
        where('scaffold.id', '==', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<Handover[]>;
    this.dismantles$ = this.masterSvc
      .edit()
      .getCollectionFiltered(`company/${this.ids[0]}/dismantles`, [
        where('scaffold.id', '==', this.ids[2]),
        orderBy('date', 'desc'),
      ]) as Observable<Handover[]>;

    this.site$ = this.masterSvc
      .edit()
      .getDocById(
        `company/${this.ids[0]}/sites`,
        this.ids[1]
      ) as Observable<Site>;
  }
  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }
  ngOnInit() {}

  async addInstruction(site: Site) {
    const modal = await this.masterSvc.modal().create({
      component: AddInstructionComponent,
      componentProps: { site, scaffoldID: this.ids[2] },
      showBackdrop: false,
      id: 'addInstruction',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async viewInstruction(instruction: SI) {
    const modal = await this.masterSvc.modal().create({
      component: AddInstructionComponent,
      componentProps: {
        isEdit: true,
        isScaffold: true,
        value: instruction,
        site: instruction.site,
      },
      showBackdrop: false,
      id: 'viewInstruction',
      cssClass: 'fullscreen',
    });
    modal.present();
    return;
  }

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
  async addDismantle(scaffold: Scaffold) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      const loading = await this.loadingCtrl.create({
        message: 'Creating Dismantle',
        mode: 'ios',
      });
      try {
        loading.present();
        const user = this.masterSvc.store().selectSnapshot(UserState.user);
        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);
        const dismantle = cloneDeep(scaffold.latestHandover);
        dismantle.date = serverTimestamp();
        dismantle.code = this.masterSvc
          .edit()
          .generateDocCode(company.totalDismantles, 'DIS');
        dismantle.createdBy = user.id;
        dismantle.createdByName = user.name;
        dismantle.company = company;
        dismantle.signature = null;
        dismantle.signatureRef = null;
        dismantle.signedBy = null;
        dismantle.status = 'Needs Signature';
        await this.masterSvc
          .edit()
          .addDocument(`company/${company.id}/dismantles`, dismantle);
        await this.masterSvc.edit().updateDoc('company', company.id, {
          totalDismantles: increment(1),
        });
        // await this.masterSvc
        //   .edit()
        //   .updateDoc(
        //     `company/${company.id}/handovers`,
        //     scaffold.latestHandover.id,
        //     {
        //       dismantled: true,
        //     }
        //   );
        this.masterSvc
          .notification()
          .toast('Dismantle created successfully', 'success');
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your Dismantle, Please try again!',
            'danger'
          );
      } finally {
        loading.dismiss();
      }
    });
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
  async viewDismantle(dismantle: Handover) {
    const modal = await this.masterSvc.modal().create({
      component: DismantleSummaryComponent,
      componentProps: {
        dismantle,
      },
      showBackdrop: false,
      id: 'viewDismantle',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }
}
