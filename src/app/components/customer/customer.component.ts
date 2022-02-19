import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Address } from 'src/app/models/address.model';
import { Customer } from 'src/app/models/customer.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
})
export class CustomerComponent {
  private customerData: Customer = {
    id: '',
    name: '',
    email: '',
    rep: '',
    phone: '',
    address: '',
    suburb: '',
    city: '',
    zip: '',
    country: '',
    company: '',
  };
  @Output() newCustomer = new EventEmitter<Customer>();
  @Input() isUpdate = false;
  @Input() isDelete = false;
  @Input() isCreate = true;
  @Input() companyId: string;
  @Input() set customer(val: Customer) {
    this.customerData = val;
    if (this.form && val) {
      this.form = this.masterSvc.fb().group({
        name: [this.customerData.name, Validators.required],
        email: [
          this.customerData.email,
          [Validators.required, Validators.email],
        ],
        rep: [this.customerData.rep, Validators.required],
        phone: [this.customerData.phone, Validators.required],
        address: [this.customerData.address, Validators.required],
        suburb: [this.customerData.suburb],
        city: [this.customerData.city, Validators.required],
        zip: [this.customerData.zip],
        country: [this.customerData.country, Validators.required],
      });
    }
  }
  form: FormGroup;
  loading = false;
  constructor(private masterSvc: MasterService) {
    this.form = this.masterSvc.fb().group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rep: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      suburb: [''],
      city: ['', Validators.required],
      zip: [''],
      country: ['', Validators.required],
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
      this.masterSvc
        .edit()
        .addDocument(
          `company/${this.customerData.company}/customers`,
          this.customerData
        )
        .then(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast('Customer added successfully!', 'success');
          this.newCustomer.emit(this.customerData);
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

  updateAddress(address: Address) {
    this.form.patchValue(address);
  }
}
