import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { IonTextarea, Platform } from '@ionic/angular';
import { increment } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { AcceptEstimateComponent } from 'src/app/home/estimates/add-estimate/accept-estimate/accept-estimate.component';
import { Company } from 'src/app/models/company.model';
import { Credit } from 'src/app/models/credit.model';
import { Customer } from 'src/app/models/customer.model';
import { Scaffold } from 'src/app/models/scaffold.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-credit',
  templateUrl: './add-credit.component.html',
})
export class AddCreditComponent implements OnInit {
  @Input() set scaffoldValue(val: Scaffold) {
    if (val) {
      Object.assign(this.scaffold, val);
    }
  }
  @Input() set value(val: Credit) {
    if (val) {
      Object.assign(this.credit, val);
      this.initEditForm();
    }
  }
  @Input() isEdit = false;
  @ViewChild('message') message: IonTextarea;
  credit: Credit = {
    additionals: [],
    code: '',
    company: {},
    customer: undefined,
    date: undefined,
    discount: 0,
    discountPercentage: 0,
    endDate: undefined,
    id: '',
    message: '',
    siteCode: '',
    scaffoldCode: '',
    startDate: undefined,
    status: '',
    subtotal: 0,
    tax: 0,
    total: 0,
    vat: 0,
    poNumber: '',
    woNumber: '',
    siteId: '',
    createdBy: '',
    updatedBy: '',
    acceptedBy: '',
    rejectedBy: '',
  };
  scaffold: Scaffold = {};
  user: User;
  company: Company;
  customers$: Observable<Customer[]>;
  rates$: Observable<any>;
  brokers$: Observable<any>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  active = 'overview';
  show = '';

  constructor(private masterSvc: MasterService, private platform: Platform) {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.masterSvc.log('-----------------------------sub');
    });
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  ngOnInit() {
    this.customers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/customers`)
      .pipe(
        map((customers) => {
          if (this.scaffold && !this.isEdit) {
            const customer = customers.find(
              (cus) => cus.id === this.scaffold.customerId
            );
            this.field('customer').setValue(customer);
            this.show = 'editCustomer';
          }
          return customers;
        })
      );

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

  get additionalForms() {
    return this.form.get('additionals') as FormArray;
  }

  addAdditional() {
    const additional = this.masterSvc.fb().group({
      rate: ['', Validators.required],
      code: ['', Validators.required],
      discountPercentage: [0, Validators.required],
      discount: [0, Validators.required],
      unit: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      name: ['', Validators.required],
      total: [0],
    });
    this.additionalForms.push(additional);
  }

  deleteAdditional(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.additionalForms.removeAt(i);
    });
  }

  // END: FORM CRUD

  // START: Helper functions
  close() {
    this.masterSvc.modal().dismiss();
  }

  arr(field: string) {
    return this.form.get(field) as FormArray;
  }

  arrField(arr: string, index: number, field: string) {
    return this.arr(arr).controls[index].get(field) as FormControl;
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
    if (ev.detail.value === 'summary') {
      this.updateCreditTotal();
      this.active = ev.detail.value;
    } else {
      this.active = ev.detail.value;
    }
  }

  //update the totals for a category
  update(type: string, i?: number) {
    switch (type) {
      case 'additionals':
        {
          this.calcAdditionalRate(i);
        }
        break;
    }
  }

  //Calculate total for a category base on rates
  updateRate(type: string, args: any, i?: number) {
    this.arrField('additionals', i, 'rate').patchValue({
      ...this.arrField('additionals', i, 'rate').value,
      rate: +args,
    });
    this.calcAdditionalRate(i);
  }

  //create the credit
  createCredit() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateCreditTotal();
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.credit.company.id}/credits`,
            this.credit
          );
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalCredits: increment(1),
        });
        this.masterSvc
          .notification()
          .toast('Credit Note created successfully!', 'success');
        this.close();
      } catch (error) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your credit note, try again!',
            'danger',
            2000
          );
      }
    });
  }

  //update the credit
  updateCredit(status: 'pending' | 'accepted' | 'rejected') {
    if (status === 'accepted') {
      this.startAcceptance();
    } else {
      this.masterSvc.notification().presentAlertConfirm(() => {
        this.loading = true;
        this.updateCreditTotal();
        this.credit.status = status;
        this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/credits`,
            this.credit.id,
            this.credit
          )
          .then(() => {
            this.masterSvc
              .notification()
              .toast('Credit Note updated successfully!', 'success');
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
            this.masterSvc
              .notification()
              .toast(
                'Something went wrong updating your credit note, try again!',
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
      component: AcceptEstimateComponent,
      componentProps: {
        company: this.company,
        user: this.user,
        credit: this.credit,
        form: this.form,
      },
      id: 'acceptCredit',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  //update the credit total
  private updateCreditTotal() {
    if (this.isEdit && this.credit.status !== 'pending') {
      return;
    }
    let additionals = 0;
    this.arr('additionals').controls.forEach((c) => {
      additionals += +c.get('total').value;
    });

    const subtotal = additionals;
    const discount = subtotal * (+this.field('discountPercentage').value / 100);
    const totalAfterDiscount = subtotal - discount;
    const tax = totalAfterDiscount * (this.company.salesTax / 100);
    const vat = totalAfterDiscount * (this.company.vat / 100);
    const total = totalAfterDiscount + tax + vat;

    const code = `CRE${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${(this.company.totalCredits ? this.company.totalCredits + 1 : 1)
      .toString()
      .padStart(6, '0')}`;

    Object.assign(this.credit, {
      ...this.form.value,
      date: this.isEdit ? this.credit.date : new Date(),
      company: {
        name: this.company.name,
        address: this.company.address,
        suburb: this.company.suburb,
        city: this.company.city,
        zip: this.company.zip,
        country: this.company.country,
        currency: this.company.currency.symbol,
        phone: this.company.phone,
        email: this.company.email,
        accountNum: this.company.accountNum,
        bankName: this.company.bankName,
        swiftCode: this.company.swiftCode,
        id: this.company.id,
      },
      code: this.isEdit ? this.credit.code : code,
      status: this.isEdit ? this.credit.status : 'pending',
      subtotal,
      discount,
      tax,
      vat,
      total,
      createdBy: this.isEdit ? this.credit.createdBy : this.user.id,
      updatedBy: this.user.id,
    });
  }

  private calcAdditionalRate(i: string | number) {
    const ref = this.additionalForms.controls[i] as FormControl;
    const total = ref.get('qty').value * ref.get('rate').value;
    const discount = total * (ref.get('discountPercentage').value / 100);
    const subtotal = total - discount;
    ref.get('discount').setValue(discount.toFixed(2));
    ref.get('total').setValue(subtotal.toFixed(2));
  }
  // END: Calculations

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      customer: [this.credit.customer, Validators.required],
      message: [this.credit.message, Validators.required],
      siteCode: [this.credit.siteCode, Validators.required],
      siteId: [this.credit.siteId, Validators.required],
      scaffoldCode: [this.credit.scaffoldCode, Validators.required],
      scaffoldId: [this.credit.siteId, Validators.required],
      startDate: [this.credit.startDate, Validators.required],
      endDate: [this.credit.endDate, Validators.required],
      discountPercentage: [
        this.credit.discountPercentage,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      additionals: this.masterSvc.fb().array([]),
      poNumber: [this.credit.poNumber],
      woNumber: [this.credit.woNumber],
      code: [this.credit.code],
    });
    this.credit.additionals.forEach((add) => {
      const additional = this.masterSvc.fb().group({
        code: [add.code, Validators.required],
        unit: [add.unit, Validators.required],
        rate: [add.rate, Validators.required],
        discount: [add.discount, Validators.required],
        discountPercentage: [
          add.discountPercentage,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],

        qty: [add.qty, [Validators.required, Validators.min(1)]],
        name: [add.name, Validators.required],
        total: [add.total],
      });
      this.additionalForms.push(additional);
    });
    this.isLoading = false;
  }

  private initFrom() {
    this.form = this.masterSvc.fb().group({
      customer: [this.scaffold.customerId, Validators.required],
      message: ['', Validators.required],
      siteCode: [this.scaffold.siteCode, Validators.required],
      siteId: [this.scaffold.siteId, Validators.required],
      scaffoldCode: [this.scaffold.code, Validators.required],
      scaffoldId: [this.scaffold.id, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      discountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      additionals: this.masterSvc.fb().array([]),
      broker: [''],
      poNumber: [''],
      woNumber: [''],
      labour: this.masterSvc.fb().array([]),
    });
    this.addAdditional();
  }
  // END: Form Init
}
