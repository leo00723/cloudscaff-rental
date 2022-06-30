import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
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
export class SiteFormComponent implements OnInit {
  site: Site = {
    address: '',
    city: '',
    suburb: '',
    country: '',
    zip: '',
    code: '',
    id: '',
    name: '',
    totalScaffolds: 0,
    companyId: '',
    createdBy: '',
    updatedBy: '',
    customer: undefined,
    startDate: undefined,
    endDate: undefined,
    status: 'active',
    date: undefined,
    users: [],
  };
  @Output() newSite = new EventEmitter<Site>();
  @Input() isUpdate = false;
  @Input() isDelete = false;
  @Input() isCreate = true;

  @Input() set siteData(val: Site) {
    this.site = val;
    if (this.form && val) {
      this.form = this.masterSvc.fb().group({
        name: [this.site.name, Validators.required],
        address: [this.site.address, Validators.required],
        customer: [this.site.customer, Validators.required],
        suburb: [this.site.suburb],
        city: [this.site.city, Validators.required],
        startDate: [this.site.startDate, Validators.required],
        endDate: [this.site.endDate, Validators.required],
        zip: [this.site.zip],
        country: [this.site.country, Validators.required],
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
  }

  ngOnInit(): void {
    this.customers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/customers`);
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  checkStatus(field: FormControl) {
    return field.invalid && field.touched;
  }

  create() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;
      this.site.companyId = this.company.id;
      this.site.createdBy = this.user.name;
      const code = `SITE${new Date().toLocaleDateString('en', {
        year: '2-digit',
      })}${(this.company.totalSites ? this.company.totalSites + 1 : 1)
        .toString()
        .padStart(6, '0')}`;
      Object.assign(this.site, { ...this.form.value, code, date: new Date() });
      this.masterSvc
        .edit()
        .addDocument(`company/${this.site.companyId}/sites`, this.site)
        .then((data) => {
          this.loading = false;
          this.masterSvc.edit().updateDoc('company', this.company.id, {
            totalSites: increment(1),
          });
          this.masterSvc
            .notification()
            .toast('Site added successfully!', 'success');
          this.newSite.emit({ ...this.site, id: data.id });
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong creating your site, try again!',
              'danger',
              2000
            );
        });
    });
  }

  update() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;
      this.site.updatedBy = this.user.name;
      Object.assign(this.site, this.form.value);
      this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.site.companyId}/sites`,
          this.site.id,
          this.site
        )
        .then(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast('Site updated successfully!', 'success');
        })
        .catch((err) => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong updating your site, try again!',
              'danger',
              2000
            );
        });
    });
  }
  delete() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;
      this.masterSvc
        .edit()
        .deleteDocById(`company/${this.site.companyId}/sites`, this.site.id)
        .then(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast('Site deleted successfully!', 'success');
        })
        .catch((err) => {
          this.loading = false;
          this.form.reset();
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong deleting your site, try again!',
              'danger',
              2000
            );
        });
    });
  }

  updateAddress(address: Address) {
    this.form.patchValue(address);
  }

  test() {
    this.addUser().then();
  }

  private async addUser() {
    const modal = await this.masterSvc.modal().create({
      component: UserPickerComponent,
      componentProps: {
        selectedUsers: this.site.users ? this.site.users : [],
      },
      cssClass: 'accept',
      showBackdrop: true,
      id: 'selectUsers',
    });
    await modal.present();
    this.site.users = await (await modal.onWillDismiss()).data;

    return true;
  }

  private initFrom() {
    this.form = this.masterSvc.fb().group({
      name: ['', Validators.required],
      customer: ['', Validators.required],
      address: ['', Validators.required],
      suburb: [''],
      city: ['', Validators.required],
      zip: [''],
      country: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }
}
