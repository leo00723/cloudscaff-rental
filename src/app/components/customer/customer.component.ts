import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Customer } from 'src/app/models/customer.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styles: [],
})
export class CustomerComponent implements OnInit {
  @Input() customer = new Customer();
  @Output() newCustomer = new EventEmitter<Customer>();
  @Input() isUpdate = false;
  @Input() isDelete = false;
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
            .successToast('Customer added successfully!');
          this.newCustomer.emit(this.customer);
          this.form.reset();
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .errorToast(
              'Something went wrong creating your customer, try again!',
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
            .successToast('Customer updated successfully!');
        })
        .catch((err) => {
          this.loading = false;
          this.masterSvc
            .notification()
            .errorToast(
              'Something went wrong updating your customer, try again!',
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
            .successToast('Customer deleted successfully!');
        })
        .catch((err) => {
          this.loading = false;
          this.form.reset();
          this.masterSvc
            .notification()
            .errorToast(
              'Something went wrong deleting your customer, try again!',
              2000
            );
        });
    });
  }
}
