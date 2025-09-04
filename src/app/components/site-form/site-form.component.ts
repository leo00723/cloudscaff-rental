import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { UserPickerComponent } from '../user-picker/user-picker.component';

@Component({
  selector: 'app-site-form',
  templateUrl: './site-form.component.html',
})
export class SiteFormComponent implements OnInit, OnDestroy {
  site: Site = {
    address: '',
    city: '',
    code: '',
    companyId: '',
    country: '',
    createdBy: '',
    customer: undefined,
    date: undefined,
    endDate: undefined,
    id: '',
    name: '',
    startDate: undefined,
    status: 'active',
    suburb: '',
    totalScaffolds: 0,
    updatedBy: '',
    users: [],
    zip: '',
  };
  @Output() newSite = new EventEmitter<Site>();
  @Output() oldSite = new EventEmitter<Site>();
  @Output() closeModal = new EventEmitter<any>();
  @Input() isUpdate = false;
  @Input() isDelete = false;
  @Input() isCreate = true;
  private subs = new Subscription();

  @Input() set siteData(val: Site) {
    this.site = val;
    if (this.form && val) {
      this.form = this.masterSvc.fb().group({
        name: [this.site.name, Validators.required],
        address: [this.site.address],
        customer: [this.site.customer, Validators.required],
        suburb: [this.site.suburb],
        city: [this.site.city],
        startDate: [this.site.startDate],
        endDate: [this.site.endDate],
        zip: [this.site.zip],
        country: [this.site.country],
        billingCycle: [this.site.billingCycle],
        billable: [this.site.billable],
      });
    }
  }
  user: User;
  company: Company;
  customers$: Observable<Customer[]>;
  form: FormGroup;
  loading = false;
  show = '';
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.initFrom();
    this.form.markAllAsTouched();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.customers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/customers`);
    this.subs.add(
      this.form.valueChanges.subscribe((form) => {
        Object.assign(this.site, form);
        this.oldSite.emit(this.site);
      })
    );
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  checkStatus(field: FormControl) {
    return field.invalid && field.touched;
  }

  create() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.site.companyId = this.company.id;
        this.site.createdBy = this.user.name;
        const code = this.masterSvc
          .edit()
          .generateDocCode(this.company.totalSites, 'SITE');

        Object.assign(this.site, {
          ...this.form.value,
          code,
          date: new Date(),
        });

        this.setUserIDs();
        const data = await this.masterSvc
          .edit()
          .addDocument(`company/${this.site.companyId}/sites`, this.site);
        this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalSites: increment(1),
        });
        this.masterSvc
          .notification()
          .toast('Site added successfully!', 'success');
        this.newSite.emit({ ...this.site, id: data.id });
        this.closeModal.emit();
      } catch (error) {
        console.log(error);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your site, try again!',
            'danger',
            2000
          );
      } finally {
        this.loading = false;
      }
    });
  }

  update(status: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.site.updatedBy = this.user.name;
        Object.assign(this.site, this.form.value);
        this.site.status = status;
        this.setUserIDs();
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.site.companyId}/sites`,
            this.site.id,
            this.site
          );
        this.loading = false;
        this.masterSvc
          .notification()
          .toast('Site updated successfully!', 'success');
      } catch (err) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating your site, try again!',
            'danger',
            2000
          );
      }
    });
  }
  delete() {
    this.masterSvc.notification().presentAlertConfirm(
      async () => {
        try {
          this.loading = true;
          this.site.updatedBy = this.user.name;
          this.site.status = 'deleted';
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.site.companyId}/sites`,
              this.site.id,
              this.site
            );
          this.loading = false;
          this.masterSvc
            .notification()
            .toast('Site deleted successfully!', 'success');
          this.masterSvc.modal().dismiss();
          this.masterSvc.router().navigateByUrl('/dashboard/sites');
        } catch (err) {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong deleting your site, try again!',
              'danger',
              2000
            );
        }
      },
      'Delete Site',
      'NB! A DELETED SITE CANNOT BE RECOVERED NOR CAN ANY INFORMATION BE ACCESSED'
    );
  }

  updateAddress(address: Address) {
    this.form.patchValue(address);
  }

  add() {
    this.addUser().then();
  }

  removeUser(i) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.site.users.splice(i, 1);
    });
  }

  changeBillingDate(days) {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    this.site.nextInvoiceDate = newDate;
  }

  // switch customer
  changeCustomer(event) {
    if (event[0] !== 'add') {
      this.field('customer').setValue({ ...event[0] });
      this.show = 'editCustomer';
    } else {
      this.show = 'addCustomer';
    }
  }

  //event for new customer added
  newCustomer(args) {
    this.field('customer').setValue({ ...args });
    this.show = 'editCustomer';
  }

  private async addUser() {
    const modal = await this.masterSvc.modal().create({
      component: UserPickerComponent,
      componentProps: {
        data: this.site.users ? this.site.users : [],
      },
      cssClass: 'accept',
      showBackdrop: true,
      id: 'selectUsers',
    });
    await modal.present();
    const modalData = await modal.onWillDismiss();
    if (modalData.role === 'close') {
      this.site.users = modalData.data;
    }

    return true;
  }

  setUserIDs() {
    const ids = [];
    this.site.users.forEach((users) => {
      ids.push(users.id);
    });
    this.site.userIDS = ids;
  }

  private initFrom() {
    this.form = this.masterSvc.fb().group({
      name: ['', Validators.required],
      customer: ['', Validators.required],
      address: [''],
      suburb: [''],
      city: [''],
      zip: [''],
      country: [''],
      startDate: [''],
      endDate: [''],
      billingCycle: [''],
      billable: [''],
    });
  }
}
