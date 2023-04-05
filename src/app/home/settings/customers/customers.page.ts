import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { XeroService } from 'src/app/services/xero.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { AddCustomerComponent } from './add-customer/add-customer.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
})
export class CustomersPage implements OnInit {
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  customers$: Observable<Customer[] | any>;
  isLoading = true;
  constructor(
    private masterSvc: MasterService,
    private xero: XeroService,
    private change: ChangeDetectorRef
  ) {}

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
            .getCollectionOrdered(
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
