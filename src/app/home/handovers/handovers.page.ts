import { Component, OnInit } from '@angular/core';
import { orderBy, where } from '@angular/fire/firestore';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { HandoverSummaryComponent } from 'src/app/components/handover-summary/handover-summary.component';
import { Company } from 'src/app/models/company.model';
import { Handover } from 'src/app/models/handover.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-handovers',
  templateUrl: './handovers.page.html',
})
export class HandoversPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  handovers$: Observable<any[]>;

  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }

  async addHandover() {
    this.masterSvc.router().navigateByUrl('/dashboard/sites');
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

  init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        this.handovers$ = this.masterSvc
          .edit()
          .getCollectionFiltered(`company/${id}/handovers`, [
            where('status', '==', 'active-Signed'),
            orderBy('date', 'desc'),
          ]) as Observable<Handover[]>;
      } else {
        this.masterSvc.log(
          '-----------------------try handovers----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
