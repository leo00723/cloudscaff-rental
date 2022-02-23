import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { CustomerComponent } from 'src/app/components/customer/customer.component';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { LabourBroker } from 'src/app/models/labour-broker.model';
import { MasterService } from 'src/app/services/master.service';
import { AddCustomerComponent } from './add-customer/add-customer.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
})
export class CustomersPage {
  user$: Observable<any>;
  customers$: Observable<Customer[] | any>;
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

  async editCustomer(customer: Customer, companyId: string) {
    const modal = await this.masterSvc.modal().create({
      component: AddCustomerComponent,
      componentProps: {
        customer,
        companyId,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editCustomer',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async addCustomer(companyId: string) {
    const modal = await this.masterSvc.modal().create({
      component: AddCustomerComponent,
      componentProps: {
        isCreate: true,
        companyId,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addCustomer',
    });
    return await modal.present();
  }

  init() {
    this.customers$ = this.company$.pipe(
      switchMap((company) => {
        if (company) {
          return this.masterSvc
            .edit()
            .getDocsByCompanyIdOrdered(
              `company/${company.id}/customers`,
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
