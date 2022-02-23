import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Company } from 'src/app/models/company.model';
import { LabourBroker } from 'src/app/models/labour-broker.model';
import { MasterService } from 'src/app/services/master.service';
import { AddBrokerComponent } from './add-broker/add-broker.component';

@Component({
  selector: 'app-labour',
  templateUrl: './labour.page.html',
})
export class LabourPage {
  brokers$: Observable<LabourBroker[] | any>;
  user$: Observable<any>;
  company$: Observable<Company>;
  isLoading = true;
  constructor(
    private masterSvc: MasterService,
    private change: ChangeDetectorRef
  ) {
    this.company$ = this.masterSvc.auth().company$;
    this.user$ = this.masterSvc.auth().user$;
  }

  ngOnInit() {
    this.init();
  }

  async editBroker(broker: LabourBroker, company: Company) {
    const modal = await this.masterSvc.modal().create({
      component: AddBrokerComponent,
      componentProps: {
        broker,
        company,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editBroker',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async addBroker(company: Company) {
    const modal = await this.masterSvc.modal().create({
      component: AddBrokerComponent,
      componentProps: {
        company,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addBroker',
    });
    return await modal.present();
  }

  init() {
    this.brokers$ = this.company$.pipe(
      switchMap((company) => {
        if (company) {
          return this.masterSvc
            .edit()
            .getDocsByCompanyIdOrdered(
              `company/${company.id}/brokers`,
              'name',
              'desc'
            )
            .pipe(
              tap(() => {
                this.isLoading = false;
                this.change.detectChanges();
              })
            );
        } else {
          return timer(1);
        }
      })
    ) as Observable<any>;
  }
}
