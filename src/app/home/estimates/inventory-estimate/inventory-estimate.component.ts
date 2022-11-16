import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonTextarea } from '@ionic/angular';
import { increment } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { BulkInventoryEstimate } from 'src/app/models/bulkInventoryEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Estimate } from 'src/app/models/estimate.model';
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';
import { Transport } from 'src/app/models/transport.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { AcceptInventoryEstimateComponent } from './accept-inventory-estimate/accept-inventory-estimate.component';

@Component({
  selector: 'app-inventory-estimate',
  templateUrl: './inventory-estimate.component.html',
  styles: [],
})
export class InventoryEstimateComponent implements OnInit {
  @Input() enquiryId = '';
  @Input() set value(val: InventoryEstimate) {
    if (val) {
      Object.assign(this.inventoryEstimate, val);
      this.initEditForm();
    }
  }
  @Input() isEdit = false;
  @ViewChild('message') message: IonTextarea;
  inventoryEstimate: BulkInventoryEstimate = {
    code: '',
    company: undefined,
    customer: undefined,
    date: undefined,
    discount: 0,
    discountPercentage: 0,
    estimates: [],
    endDate: undefined,
    id: '',
    message: '',
    siteName: '',
    startDate: undefined,
    status: '',
    subtotal: 0,
    tax: 0,
    total: 0,
    extraHire: 0,
    vat: 0,
    poNumber: '',
    woNumber: '',
    siteId: '',
    createdBy: '',
    updatedBy: '',
    acceptedBy: '',
    rejectedBy: '',
    budget: {},
    enquiryId: '',
  };
  user: User;
  company: Company;
  customers$: Observable<Customer[]>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  active = 'overview';
  activeShipment = 1;
  show = '';

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  addShipment() {
    this.inventoryEstimate.estimates.push({
      additionals: [],
      broker: {},
      code: '',
      company: {},
      customer: {},
      date: '',
      discount: 0,
      discountPercentage: 0,
      endDate: '',
      id: '',
      labour: [],
      transport: [],
      transportProfile: [],
      message: '',
      siteName: '',
      startDate: '',
      status: 'pending',
      daysOnHire: 0,
      minHire: 28,
      itemHire: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      extraHire: 0,
      vat: 0,
      poNumber: '',
      woNumber: '',
      createdBy: '',
      updatedBy: '',
      acceptedBy: '',
      rejectedBy: '',
      enquiryId: '',
      items: [],
    });
  }

  duplicateShipment(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const est = {};
      Object.assign(est, this.inventoryEstimate.estimates[i]);
      this.inventoryEstimate.estimates.push(est as InventoryEstimate);
      this.activeShipment = this.inventoryEstimate.estimates.length;
    }, `Are you sure you want to duplicate scaffold ${i + 1}?`);
  }
  deleteShipment(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.inventoryEstimate.estimates.splice(i, 1);
      if (i === 0) {
        this.activeShipment = 0;
        setTimeout(() => {
          this.activeShipment = 1;
        }, 200);
      } else {
        this.activeShipment--;
      }
    }, `Are you sure you want to delete scaffold ${i + 1}?`);
  }
  ngOnInit() {
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

  ionViewDidEnter() {
    if (this.message) {
      this.message.autoGrow = true;
      this.message.rows = 4;
    }
  }

  // END: FORM CRUD

  // START: Helper functions
  close() {
    this.masterSvc.modal().dismiss();
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  // END: Helper functions

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

  //switch between pages
  nextView(page: string) {
    this.active = page;
  }

  //event for switching between pages
  segmentChanged(ev: any) {
    if (ev.detail.value === 'summary' || ev.detail.value === 'budget') {
      this.updateEstimateTotal();
      this.active = ev.detail.value;
    } else {
      this.active = ev.detail.value;
    }
  }

  scaffoldSegmentChanged(ev: any) {
    this.activeShipment = +ev.detail.value;
  }

  //create the estimate
  createEstimate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateEstimateTotal();
        this.inventoryEstimate.enquiryId = this.enquiryId;
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.inventoryEstimate.company.id}/inventoryEstimates`,
            this.inventoryEstimate
          );
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalInventoryEstimates: increment(1),
        });
        if (this.inventoryEstimate.enquiryId.length > 0) {
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.inventoryEstimate.company.id}/enquiries`,
              this.inventoryEstimate.enquiryId,
              { status: 'estimate created' }
            );
        }
        this.masterSvc
          .notification()
          .toast('Estimate created successfully!', 'success');
        this.close();
      } catch (error) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your estimate, try again!',
            'danger',
            2000
          );
      }
    });
  }

  //update the estimate
  updateEstimate(status: 'pending' | 'accepted' | 'rejected') {
    if (status === 'accepted') {
      this.startAcceptance();
    } else {
      this.masterSvc.notification().presentAlertConfirm(() => {
        this.loading = true;
        this.updateEstimateTotal();
        this.inventoryEstimate.status = status;
        this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/inventoryEstimates`,
            this.inventoryEstimate.id,
            this.inventoryEstimate
          )
          .then(async () => {
            if (
              status === 'rejected' &&
              this.inventoryEstimate.enquiryId.length > 0
            ) {
              await this.masterSvc
                .edit()
                .updateDoc(
                  `company/${this.inventoryEstimate.company.id}/enquiries`,
                  this.inventoryEstimate.enquiryId,
                  { status: 'rejected' }
                );
            }
            this.masterSvc
              .notification()
              .toast('Estimate updated successfully!', 'success');
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
            this.masterSvc
              .notification()
              .toast(
                'Something went wrong updating your estimate, try again!',
                'danger',
                2000
              );
          });
      });
    }
  }

  //start the acceptance process
  private async startAcceptance() {
    const modal = await this.masterSvc.modal().create({
      component: AcceptInventoryEstimateComponent,
      componentProps: {
        company: this.company,
        user: this.user,
        inventoryEstimate: this.inventoryEstimate,
        form: this.form,
      },
      id: 'acceptEstimate',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  //update the estimate total
  private updateEstimateTotal() {
    if (this.isEdit && this.inventoryEstimate.status !== 'pending') {
      return;
    }
    let subtotal = 0;
    let extraHire = 0;
    this.inventoryEstimate.estimates.forEach((e) => {
      subtotal += e.subtotal;
      extraHire += e.extraHire;
    });

    const discount = subtotal * (+this.field('discountPercentage').value / 100);
    const totalAfterDiscount = subtotal - discount;
    const tax = totalAfterDiscount * (this.company.salesTax / 100);
    const vat = totalAfterDiscount * (this.company.vat / 100);
    const total = totalAfterDiscount + tax + vat;
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    const code = `IEST${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${(this.company.totalInventoryEstimates
      ? this.company.totalInventoryEstimates + 1
      : 1
    )
      .toString()
      .padStart(6, '0')}`;

    Object.assign(this.inventoryEstimate, {
      ...this.form.value,
      date: this.isEdit ? this.inventoryEstimate.date : new Date(),
      company: this.company,
      code: this.isEdit ? this.inventoryEstimate.code : code,
      status: this.isEdit ? this.inventoryEstimate.status : 'pending',
      subtotal,
      discount,
      tax,
      vat,
      total,
      extraHire,
      createdBy: this.isEdit ? this.inventoryEstimate.createdBy : this.user.id,
      updatedBy: this.user.id,
    });
    this.inventoryEstimate.estimates.forEach((e) => {
      e.customer = this.inventoryEstimate.customer;
      e.discountPercentage = this.inventoryEstimate.discountPercentage;
      e.message = this.inventoryEstimate.message;
    });
  }

  // END: Calculations

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      customer: [this.inventoryEstimate.customer, Validators.required],
      message: [this.inventoryEstimate.message],
      siteName: [this.inventoryEstimate.siteName, Validators.required],
      startDate: [this.inventoryEstimate.startDate, Validators.nullValidator],
      endDate: [this.inventoryEstimate.endDate, Validators.nullValidator],
      discountPercentage: [
        this.inventoryEstimate.discountPercentage,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      poNumber: [this.inventoryEstimate.poNumber],
      woNumber: [this.inventoryEstimate.woNumber],
      code: [this.inventoryEstimate.code],
    });

    this.isLoading = false;
  }

  private initFrom() {
    this.form = this.masterSvc.fb().group({
      customer: ['', Validators.required],
      message: [
        // eslint-disable-next-line max-len
        'We thank you for your scaffolding enquiry as per the Scope of Work detailed below. We attach herewith our estimate for your perusal.',
        Validators.required,
      ],
      siteName: ['', Validators.required],
      startDate: ['', Validators.nullValidator],
      endDate: ['', Validators.nullValidator],
      discountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      poNumber: [''],
      woNumber: [''],
    });
    this.addShipment();
  }
}
