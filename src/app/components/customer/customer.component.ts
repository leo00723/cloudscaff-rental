import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Address } from 'src/app/models/address.model';
import { Customer } from 'src/app/models/customer.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
})
export class CustomerComponent implements OnInit {
  @Input() customer: Customer = {
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
  form: FormGroup;
  loading = false;
  constructor(private masterSvc: MasterService) {}

  ngOnInit(): void {
    this.form = this.masterSvc.fb().group({
      name: [this.customer.name, Validators.required],
      email: [this.customer.email, [Validators.required, Validators.email]],
      rep: [this.customer.rep, Validators.required],
      phone: [this.customer.phone, Validators.required],
      address: [this.customer.address, Validators.required],
      suburb: [this.customer.suburb],
      city: [this.customer.city, Validators.required],
      zip: [this.customer.zip],
      country: [this.customer.country, Validators.required],
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
      this.customer.company = this.companyId;
      Object.assign(this.customer, this.form.value);
      this.masterSvc
        .edit()
        .addDocument(
          `company/${this.customer.company}/customers`,
          this.customer
        )
        .then(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast('Customer added successfully!', 'success');
          this.newCustomer.emit(this.customer);
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
      this.customer.company = this.companyId;
      Object.assign(this.customer, this.form.value);
      this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.customer.company}/`,
          this.customer.id,
          this.customer
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
          `company/${this.customer.company}/customers`,
          this.customer.id
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
