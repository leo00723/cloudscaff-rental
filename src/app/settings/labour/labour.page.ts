import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
  company$: Observable<Company>;
  isLoading = true;
  constructor(private masterSvc: MasterService) {
    this.company$ = this.masterSvc.auth().company$;
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
              'asc'
            );
        } else {
          return of(false);
        }
      })
    ) as Observable<any>;
  }
}
