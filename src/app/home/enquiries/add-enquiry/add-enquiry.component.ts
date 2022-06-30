import { Component, Input, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Enquiry } from 'src/app/models/enquiry.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { AddEstimatePage } from '../../estimates/add-estimate/add-estimate.component';
import { BulkEstimateComponent } from '../../estimates/bulk-estimate/bulk-estimate.component';

@Component({
  selector: 'app-add-enquiry',
  templateUrl: './add-enquiry.component.html',
  styles: [],
})
export class AddEnquiryComponent implements OnInit {
  @Input() set value(val: Enquiry) {
    if (val) {
      Object.assign(this.enquiry, val);
      this.initEditForm();
    }
  }
  @Input() isEdit = false;
  active = 'overview';
  user: User;
  company: Company;
  customers$: Observable<Customer[]>;
  form: FormGroup;
  show = '';
  enquiry: Enquiry = {
    code: '',
    company: undefined,
    customer: undefined,
    date: undefined,
    returnDate: undefined,
    id: '',
    message: '',
    siteName: '',
    recievedDate: undefined,
    status: '',
    estimateId: '',
    estimateCode: '',
    address: '',
    city: '',
    suburb: '',
    country: '',
    zip: '',
    createdBy: '',
    updatedBy: '',
    acceptedBy: '',
    rejectedBy: '',
  };
  isLoading = true;
  loading = false;

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  ngOnInit(): void {
    this.customers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/customers`);
    if (this.isEdit) {
      this.show = 'editCustomer';
    } else {
      this.initFrom();
      this.isLoading = false;
    }
  }

  // switch customer
  changeCustomer(args) {
    if (args !== 'add') {
      this.show = 'editCustomer';
    } else {
      this.show = 'addCustomer';
    }
  }

  //event for new customer added
  newCustomer(args) {
    this.field('customer').setValue({ ...args });
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  close() {
    this.masterSvc.modal().dismiss();
  }
  updateAddress(address: Address) {
    this.form.patchValue(address);
  }

  //create the enquiry
  createEnquiry() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.updateEnquiryData();
        this.loading = true;
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.enquiry.company.id}/enquiries`,
            this.enquiry
          );
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalEnquiries: increment(1),
        });
        this.masterSvc
          .notification()
          .toast('Enquiry created successfully!', 'success');
        this.close();
      } catch (error) {
        this.loading = false;
        this.masterSvc.log(error);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your enquiry, try again!',
            'danger',
            2000
          );
      }
    });
  }

  //update the enquiry
  updateEnquiry() {
    this.updateEnquiryData();
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;

      this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/enquiries`,
          this.enquiry.id,
          this.enquiry
        )
        .then(() => {
          this.masterSvc
            .notification()
            .toast('Enquiry updated successfully!', 'success');
          this.loading = false;
          this.close();
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong updating your enquiry, try again!',
              'danger',
              2000
            );
        });
    });
  }

  updateEnquiryData() {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    const code = `ENQ${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${(this.company.totalEnquiries ? this.company.totalEnquiries + 1 : 1)
      .toString()
      .padStart(6, '0')}`;

    Object.assign(this.enquiry, {
      ...this.form.value,
      date: this.isEdit ? this.enquiry.date : new Date(),
      company: this.company,
      code: this.isEdit ? this.enquiry.code : code,
      createdBy: this.isEdit ? this.enquiry.createdBy : this.user.id,
      updatedBy: this.user.id,
    });
  }

  async addEstimate() {
    this.close();

    const modal = await this.masterSvc.modal().create({
      component: AddEstimatePage,
      componentProps: {
        enquiryId: this.enquiry.id,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addEstimate',
    });
    return await modal.present();
  }

  async addBulkEstimate() {
    this.close();
    const modal = await this.masterSvc.modal().create({
      component: BulkEstimateComponent,
      componentProps: {
        enquiryId: this.enquiry.id,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addBulkEstimate',
    });
    return await modal.present();
  }

  createBulkEstimate() {}

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      customer: [this.enquiry.customer, Validators.required],
      message: [this.enquiry.message],
      siteName: [this.enquiry.siteName, Validators.required],
      recievedDate: [this.enquiry.recievedDate, Validators.nullValidator],
      returnDate: [this.enquiry.returnDate, Validators.nullValidator],
      code: [this.enquiry.code],
      address: [this.enquiry.address, Validators.required],
      suburb: [this.enquiry.suburb],
      city: [this.enquiry.city, Validators.required],
      zip: [this.enquiry.zip],
      country: [this.enquiry.country, Validators.required],
      status: [this.enquiry.status, Validators.required],
    });

    this.isLoading = false;
  }

  private initFrom() {
    this.form = this.masterSvc.fb().group({
      customer: ['', Validators.required],
      message: [''],
      siteName: ['', Validators.required],
      recievedDate: ['', Validators.nullValidator],
      returnDate: ['', Validators.nullValidator],
      address: ['', Validators.required],
      suburb: [''],
      city: ['', Validators.required],
      zip: [''],
      country: ['', Validators.required],
      status: ['pending', Validators.required],
    });
  }
}
