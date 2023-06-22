import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Enquiry } from 'src/app/models/enquiry.model';
import { UploadedFile } from 'src/app/models/uploadedFile.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { AddEstimatePage } from '../../estimates/add-estimate/add-estimate.component';
import { BulkEstimateComponent } from '../../estimates/bulk-estimate/bulk-estimate.component';
import { InventoryEstimateComponent } from '../../estimates/inventory-estimate/inventory-estimate.component';

@Component({
  selector: 'app-add-enquiry',
  templateUrl: './add-enquiry.component.html',
  styles: [],
})
export class AddEnquiryComponent implements OnInit, OnDestroy {
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
    customerName: '',
    date: undefined,
    returnDate: undefined,
    id: '',
    message: '',
    siteName: '',
    recievedDate: undefined,
    status: 'pending',
    address: '',
    city: '',
    suburb: '',
    country: '',
    zip: '',
    createdBy: '',
    updatedBy: '',
    acceptedBy: '',
    rejectedBy: '',
    upload: null,
    probability: '',
    type: '',
  };
  isLoading = true;
  importing = false;
  importCounter = 0;
  importSize = 0;
  loading = false;
  uploadSaved = false;

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  async ngOnDestroy(): Promise<void> {
    if (!this.uploadSaved && !this.isEdit && this.enquiry.upload) {
      await this.masterSvc.img().deleteFile(this.enquiry.upload.ref);
    }
  }
  uploadComplete(data: any[]) {
    console.log(data);
  }
  import(args: any) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      const files = args.target.files;
      if (files && files.length > 0) {
        const file: File = files.item(0);
        const reader: FileReader = new FileReader();
        reader.readAsText(file);
        reader.onload = async (e) => {
          this.importing = true;
          const csv: string = reader.result as string;
          csv.split('\r\n');
          const data = csv.split('\r\n') as string[];
          data.splice(0, 1);
          this.importSize = data.length;

          for await (const d of data) {
            this.importCounter++;
            this.company = this.masterSvc
              .store()
              .selectSnapshot(CompanyState.company);
            const code = `ENQ${new Date().toLocaleDateString('en', {
              year: '2-digit',
            })}${(this.company.totalEnquiries
              ? this.company.totalEnquiries + 1
              : 1
            )
              .toString()
              .padStart(6, '0')}`;
            const data2 = d.split(';');
            const enq = {
              code,
              company: this.company,
              customer: null,
              customerName: data2[0],
              date: new Date(),
              returnDate: data2[5].replace(/\//g, '-'),
              id: '',
              message: data2[3],
              siteName: data2[1],
              recievedDate: data2[4].replace(/\//g, '-'),
              status: data2[7],
              estimateId: '',
              estimateCode: '',
              address: '',
              city: '',
              suburb: '',
              country: '',
              zip: '',
              createdBy: this.user.id,
              updatedBy: this.user.id,
              acceptedBy: '',
              rejectedBy: '',
              upload: null,
              probability: data2[6],
            };
            try {
              await this.masterSvc
                .edit()
                .addDocument(`company/${this.company.id}/enquiries`, enq);
              await this.masterSvc
                .edit()
                .updateDoc('company', this.company.id, {
                  totalEnquiries: increment(1),
                });
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
          }
          this.importing = false;
          this.masterSvc
            .notification()
            .toast('Enquiry imported successfully!', 'success');
          this.close();
        };
      }
    });
  }

  ngOnInit(): void {
    this.customers$ = this.masterSvc
      .edit()
      .getCollectionOrdered(
        `company/${this.company.id}/customers`,
        'name',
        'asc'
      );
    if (this.isEdit) {
      this.show = this.enquiry.customer ? 'editCustomer' : '';
    } else {
      this.initFrom();
      this.isLoading = false;
    }
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
  newCustomer(event) {
    this.field('customer').setValue({ ...event });
    this.show = 'editCustomer';
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
    if (this.form.valid) {
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
          this.uploadSaved = true;
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
    } else {
      this.isLoading = true;
      this.form.markAllAsTouched();
      setTimeout(() => {
        this.isLoading = false;
      }, 1);
    }
  }

  //update the enquiry
  updateEnquiry() {
    this.updateEnquiryData();
    if (this.form.valid) {
      this.masterSvc.notification().presentAlertConfirm(async () => {
        try {
          this.loading = true;
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.company.id}/enquiries`,
              this.enquiry.id,
              this.enquiry
            );
          this.masterSvc
            .notification()
            .toast('Enquiry updated successfully!', 'success');
          this.loading = false;
          this.close();
        } catch (error) {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong updating your enquiry, try again!',
              'danger',
              2000
            );
        }
      });
    } else {
      this.isLoading = true;
      this.form.markAllAsTouched();
      setTimeout(() => {
        this.isLoading = false;
      }, 1);
    }
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
        siteName: this.enquiry.siteName,
        customer: this.enquiry.customer,
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
  async addInventoryEstimate() {
    this.close();
    const modal = await this.masterSvc.modal().create({
      component: InventoryEstimateComponent,
      componentProps: {
        enquiryId: this.enquiry.id,
      },
      cssClass: 'fullscreen',
      showBackdrop: false,
      id: 'addInventoryEstimate',
    });
    return await modal.present();
  }

  async viewEstimate() {
    const modal = await this.masterSvc.modal().create({
      component: AddEstimatePage,
      componentProps: {
        value: this.enquiry.estimate,
        isEdit: true,
      },
      showBackdrop: false,
      id: 'editEstimate',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  async saveUpload(data: UploadedFile | null) {
    this.enquiry.upload = data;
    if (this.isEdit) {
      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/enquiries`,
          this.enquiry.id,
          this.enquiry
        );
      this.masterSvc
        .notification()
        .toast('Enquiry updated successfully!', 'success');
    }
  }

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      customer: [
        this.enquiry.customer ? this.enquiry.customer : '',
        Validators.required,
      ],
      message: [this.enquiry.message ? this.enquiry.message : ''],
      customerName: [
        this.enquiry.customerName ? this.enquiry.customerName : '',
        Validators.nullValidator,
      ],
      siteName: [
        this.enquiry.siteName ? this.enquiry.siteName : '',
        Validators.required,
      ],
      recievedDate: [
        this.enquiry.recievedDate ? this.enquiry.recievedDate : '',
        Validators.required,
      ],
      returnDate: [
        this.enquiry.returnDate ? this.enquiry.returnDate : '',
        Validators.required,
      ],
      code: [this.enquiry.code ? this.enquiry.code : ''],
      address: [
        this.enquiry.address ? this.enquiry.address : '',
        Validators.required,
      ],
      suburb: [this.enquiry.suburb ? this.enquiry.suburb : ''],
      city: [this.enquiry.city ? this.enquiry.city : '', Validators.required],
      zip: [this.enquiry.zip ? this.enquiry.zip : ''],
      country: [
        this.enquiry.country ? this.enquiry.country : '',
        Validators.required,
      ],
      status: [
        this.enquiry.status ? this.enquiry.status : '',
        Validators.required,
      ],
      probability: [
        this.enquiry.probability ? this.enquiry.probability : '',
        Validators.required,
      ],
    });

    this.isLoading = false;
  }

  private initFrom() {
    this.form = this.masterSvc.fb().group({
      customer: ['', Validators.required],
      message: [''],
      customerName: ['', Validators.nullValidator],
      siteName: ['', Validators.required],
      recievedDate: ['', Validators.required],
      returnDate: ['', Validators.required],
      address: ['', Validators.required],
      suburb: [''],
      city: ['', Validators.required],
      zip: [''],
      country: ['', Validators.required],
      status: ['pending', Validators.required],
      probability: ['', Validators.required],
    });
  }
}
