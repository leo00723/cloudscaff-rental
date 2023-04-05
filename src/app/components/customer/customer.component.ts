/* eslint-disable @typescript-eslint/naming-convention */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { User } from 'src/app/models/user.model';
import { XeroContact } from 'src/app/models/xero-contact.model';
import { MasterService } from 'src/app/services/master.service';
import { XeroService } from 'src/app/services/xero.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
})
export class CustomerComponent implements OnInit {
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
        regNumber: [this.customerData.regNumber],
        vatNum: [this.customerData.vatNum],
        country: [this.customerData.country, Validators.required],
        xeroID: [this.customerData.xeroID],
      });
    }
  }
  @Select() company$: Observable<Company>;
  form: FormGroup;
  loading = false;
  user: User;
  xeroCustomers: XeroContact[] = [];
  constructor(private masterSvc: MasterService, private xeroSvc: XeroService) {
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
    });
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
  }

  async ngOnInit(): Promise<void> {
    const company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    if (company.tokens && !this.customerData.xeroID) {
      this.xeroCustomers = await this.xeroSvc.getCustomers(company);
    }
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

  changeCustomer(contact: XeroContact) {
    this.field('xeroID').setValue(contact[0].ContactID);
  }

  xero(company: Company) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      Object.assign(this.customerData, this.form.value);
      const newContact: XeroContact = {
        Name: this.customerData.name,
        EmailAddress: this.customerData.email,
        FirstName: this.customerData.rep.split(' ')[0],
        LastName: this.customerData.rep.split(' ')[1],
        TaxNumber: this.customerData.vatNum,
        Addresses: [
          {
            AddressLine1: this.customerData.address,
            AddressLine2: this.customerData.suburb,
            City: this.customerData.city,
            Country: this.customerData.country,
            PostalCode: this.customerData.zip,
            Region: this.customerData.city,
          },
        ],
        IsCustomer: true,
      };
      try {
        const contacts = await this.xeroSvc.syncCustomers(company, [
          newContact,
        ]);
        this.customerData.xeroID = contacts[0].ContactID;
        this.field('xeroID').setValue(contacts[0].ContactID);
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.customerData.company}/customers`,
            this.customerData.id,
            this.customerData
          );
        this.masterSvc
          .notification()
          .toast('Customer synced successfully', 'success');
      } catch (error) {
        console.log(error);
        this.masterSvc
          .notification()
          .toast('Something went wrong, please try again!', 'danger');
      } finally {
        this.loading = false;
      }
    });
  }

  updateAddress(address: Address) {
    this.form.patchValue(address);
  }
}
