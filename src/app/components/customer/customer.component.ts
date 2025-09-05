/* eslint-disable @typescript-eslint/naming-convention */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
})
export class CustomerComponent {
  private customerData: Customer = {};
  @Output() newCustomer = new EventEmitter<Customer>();
  @Input() isUpdate = false;
  @Input() isDelete = false;
  @Input() isCreate = true;
  @Input() readOnly = false;
  @Input() companyId: string;
  @Input() set customer(val: Customer) {
    this.customerData = val;
    if (this.form && val) {
      this.form = this.masterSvc.fb().group({
        name: [this.customerData.name, Validators.required],
        tradingName: [this.customerData.tradingName, Validators.required],
        email: [
          this.customerData.email,
          [Validators.required, Validators.email],
        ],
        rep: [this.customerData.rep, Validators.required],
        phone: [this.customerData.phone, Validators.required],
        address: [this.customerData.address],
        suburb: [this.customerData.suburb],
        city: [this.customerData.city],
        zip: [this.customerData.zip],
        regNumber: [this.customerData.regNumber],
        vatNum: [this.customerData.vatNum],
        country: [this.customerData.country],
        xeroID: [this.customerData.xeroID],
        excludeVAT: [this.customerData.excludeVAT],
        reps: this.masterSvc.fb().array([]),
      });
      this.customerData?.reps?.forEach((item) => {
        const additional = this.masterSvc.fb().group({
          name: [item?.name || ''],
          phone: [item?.phone || ''],
          email: [item?.email || ''],
        });
        this.repForms.push(additional);
      });
    }
  }

  form: FormGroup;
  loading = false;

  protected user: User;
  protected company: Company;

  constructor(private masterSvc: MasterService) {
    this.form = this.masterSvc.fb().group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rep: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      suburb: [''],
      zip: [''],
      regNumber: [''],
      vatNum: [''],
      xeroID: [''],
      excludeVAT: [''],
      reps: this.masterSvc.fb().array([]),
    });
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  get repForms() {
    return this.form.get('reps') as FormArray;
  }
  addRep() {
    const additional = this.masterSvc.fb().group({
      name: [''],
      phone: [''],
      email: [''],
    });
    this.repForms.push(additional);
  }

  deleteRep(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.repForms.removeAt(i);
    });
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
      this.customerData.company = this.companyId;
      Object.assign(this.customerData, this.form.value);
      this.customerData.selected = false;
      this.masterSvc
        .edit()
        .addDocument(
          `company/${this.customerData.company}/customers`,
          this.customerData
        )
        .then((data) => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast('Customer added successfully!', 'success');
          this.newCustomer.emit({ ...this.customerData, id: data.id });
          this.form.reset();
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong creating your customer, try again!',
              'danger',
              2000
            );
        });
    });
  }

  update() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;

      Object.assign(this.customerData, this.form.value);
      this.customerData.selected = false;

      this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.customerData.company}/customers`,
          this.customerData.id,
          this.customerData
        )
        .then(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast('Customer updated successfully!', 'success');
        })
        .catch((err) => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong updating your customer, try again!',
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
        .deleteDocById(
          `company/${this.customerData.company}/customers`,
          this.customerData.id
        )
        .then(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast('Customer deleted successfully!', 'success');
        })
        .catch((err) => {
          this.loading = false;
          this.form.reset();
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong deleting your customer, try again!',
              'danger',
              2000
            );
        });
    });
  }

  excludeVAT(args) {
    this.field('excludeVAT').setValue(args.detail.checked);
  }

  updateAddress(address: Address) {
    this.form.patchValue(address);
  }
}
