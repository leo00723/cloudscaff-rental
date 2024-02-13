import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { IonTextarea } from '@ionic/angular';
import { increment } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Transport } from 'src/app/models/transport.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { AddPaymentComponent } from '../add-payment/add-payment.component';

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddInvoiceComponent implements OnInit {
  @Input() set value(val: Invoice) {
    if (val) {
      Object.assign(this.invoice, val);
      this.initEditForm();
    }
  }
  @Input() isEdit = false;
  @ViewChild('message') message: IonTextarea;
  invoice: Invoice = {
    additionals: [],
    attachments: [],
    boards: [],
    broker: undefined,
    code: '',
    company: {},
    customer: undefined,
    date: undefined,
    discount: 0,
    discountPercentage: 0,
    endDate: undefined,
    hire: undefined,
    id: '',
    labour: [],
    transport: [],
    transportProfile: undefined,
    message: '',
    scaffold: undefined,
    siteName: '',
    startDate: undefined,
    status: '',
    subtotal: 0,
    tax: 0,
    total: 0,
    vat: 0,
    poNumber: '',
    woNumber: '',
    siteId: '',
    scaffoldId: '',
    scaffoldCode: '',
    createdBy: '',
    updatedBy: '',
    acceptedBy: '',
    rejectedBy: '',
  };
  user: User;
  company: Company;
  customers$: Observable<Customer[]>;
  rates$: Observable<any>;
  brokers$: Observable<any>;
  transport$: Observable<Transport[]>;

  form: FormGroup;
  loading = false;
  isLoading = true;
  active = 'overview';
  show = '';

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  ngOnInit() {
    this.rates$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/rateProfiles`, 'estimateRates');
    this.brokers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/brokers`);
    this.transport$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/transport`);

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

  // START: FORM CRUD
  get attachmentsForms() {
    return this.form.get('attachments') as FormArray;
  }
  get boardForms() {
    return this.form.get('boards') as FormArray;
  }
  get labourForms() {
    return this.form.get('labour') as FormArray;
  }
  get transportForms() {
    return this.form.get('transport') as FormArray;
  }
  get additionalForms() {
    return this.form.get('additionals') as FormArray;
  }
  addLabour() {
    const labour = this.masterSvc.fb().group({
      type: ['', Validators.required],
      hours: ['', Validators.required],
      days: ['', Validators.required],
      rate: ['', [Validators.required]],
      qty: ['', Validators.required],
      total: [0],
    });
    this.labourForms.push(labour);
  }
  addTransport() {
    const transport = this.masterSvc.fb().group({
      type: ['', Validators.required],
      hours: ['', Validators.required],
      days: ['', Validators.required],
      qty: ['', Validators.required],
      total: [''],
    });
    this.transportForms.push(transport);
  }
  addAdditional() {
    const additional = this.masterSvc.fb().group({
      rate: ['', Validators.required],
      qty: ['', [Validators.required, Validators.min(1)]],
      name: ['', Validators.required],
      daysStanding: ['', [Validators.required, Validators.min(1)]],
      total: [0],
    });
    this.additionalForms.push(additional);
  }
  addBoard() {
    const board = this.masterSvc.fb().group({
      rate: ['', Validators.required],
      length: ['', [Validators.required, Validators.min(1)]],
      width: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]],
      qty: ['', [Validators.required, Validators.min(1)]],
      total: [0],
    });
    this.boardForms.push(board);
  }
  addAttachment() {
    const attachment = this.masterSvc.fb().group({
      description: ['', Validators.nullValidator],
      rate: ['', Validators.required],
      length: ['', [Validators.required, Validators.min(1)]],
      width: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]],
      lifts: ['', [Validators.nullValidator, Validators.min(1)]],
      level: [''],
      total: [0],
    });
    this.attachmentsForms.push(attachment);
  }
  deleteAttachment(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.attachmentsForms.removeAt(i);
      this.calcHireRate();
    });
  }
  deleteBoard(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.boardForms.removeAt(i);
      this.calcHireRate();
    });
  }
  deleteAdditional(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.additionalForms.removeAt(i);
    });
  }
  deleteLabour(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.labourForms.removeAt(i);
    });
  }
  deleteTransport(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.transportForms.removeAt(i);
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

  // switch broker
  changeBroker() {
    this.labourForms.clear();
    this.addLabour();
  }

  // switch transport
  changeTransport() {
    this.transportForms.clear();
    this.addTransport();
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

  //switch between pages
  nextView(page: string) {
    this.active = page;
  }

  //event for switching between pages
  segmentChanged(ev: any) {
    if (ev.detail.value === 'summary') {
      this.updateInvoiceTotal();
      this.active = ev.detail.value;
    } else {
      this.active = ev.detail.value;
    }
  }

  //update the totals for a category
  update(type: string, i?: number) {
    switch (type) {
      case 'scaffold':
        {
          this.calcScaffoldRate();
        }
        break;
      case 'attachments':
        {
          this.calcAttachmentRate(i);
        }
        break;
      case 'boards':
        {
          this.calcBoardRate(i);
        }
        break;
      case 'hire':
        {
        }
        break;
      case 'additionals':
        {
          this.calcAdditionalRate(i);
        }
        break;
      case 'labour':
        {
          this.calcLabourRate(i);
        }
        break;
      case 'transport': {
        this.calcTransportRate(i);
      }
    }
    this.calcHireRate();
  }

  //Calculate total for a category base on rates
  updateRate(type: string, args: any, i?: number) {
    switch (type) {
      case 'scaffold':
        {
          this.field('scaffold.rate').patchValue({
            ...this.field('scaffold.rate').value,
            rate: +args,
          });
          this.calcScaffoldRate();
        }
        break;
      case 'attachments':
        {
          this.arrField('attachments', i, 'rate').patchValue({
            ...this.arrField('attachments', i, 'rate').value,
            rate: +args,
          });
          this.calcAttachmentRate(i);
        }
        break;
      case 'boards':
        {
          this.arrField('boards', i, 'rate').patchValue({
            ...this.arrField('boards', i, 'rate').value,
            rate: +args,
          });
          this.calcBoardRate(i);
        }
        break;
      case 'hire':
        {
          this.field('hire.rate').patchValue({
            ...this.field('hire.rate').value,
            rate: +args,
          });
        }
        break;
      case 'additionals':
        {
          this.arrField('additionals', i, 'rate').patchValue({
            ...this.arrField('additionals', i, 'rate').value,
            rate: +args,
          });
          this.calcAdditionalRate(i);
        }
        break;
      case 'labour':
        {
          this.arrField('labour', i, 'rate').patchValue({
            ...this.arrField('labour', i, 'rate').value,
            rate: +args,
          });
          this.calcLabourRate(i);
        }
        break;
      case 'transport': {
        this.arrField('transport', i, 'type').patchValue({
          ...this.arrField('transport', i, 'type').value,
          rate: +args,
        });
        this.calcTransportRate(i);
      }
    }
    this.calcHireRate();
  }

  //create the invoice
  createInvoice() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateInvoiceTotal();
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.invoice.company.id}/invoices`,
            this.invoice
          );
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalInvoices: increment(1),
        });
        this.masterSvc
          .notification()
          .toast('Invoice created successfully!', 'success');
        this.close();
      } catch (error) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your invoice, try again!',
            'danger',
            2000
          );
      }
    });
  }

  //update the invoice
  updateInvoice() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;
      this.updateInvoiceTotal();
      this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.company.id}/invoices`,
          this.invoice.id,
          this.invoice
        )
        .then(() => {
          this.masterSvc
            .notification()
            .toast('Invoice updated successfully!', 'success');
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong updating your invoice, try again!',
              'danger',
              2000
            );
        });
    });
  }

  //update the invoice total
  updateInvoiceTotal() {
    if (this.isEdit && this.invoice.status.startsWith('completed')) {
      return;
    }
    const scaffold = +this.field('scaffold.total').value;
    const hire = +this.field('hire.total').value;
    let attachments = 0;
    this.arr('attachments').controls.forEach((a) => {
      attachments += +a.get('total').value;
    });
    let boards = 0;
    this.arr('boards').controls.forEach((c) => {
      boards += +c.get('total').value;
    });
    let labour = 0;
    this.arr('labour').controls.forEach((c) => {
      labour += +c.get('total').value;
    });
    let transport = 0;
    this.arr('transport').controls.forEach((c) => {
      transport += +c.get('total').value;
    });
    let additionals = 0;
    this.arr('additionals').controls.forEach((c) => {
      additionals += +c.get('total').value;
    });

    const subtotal =
      scaffold + attachments + boards + hire + labour + transport + additionals;
    const discount = subtotal * (+this.field('discountPercentage').value / 100);
    const totalAfterDiscount = subtotal - discount;
    const tax = totalAfterDiscount * (this.company.salesTax / 100);
    const vat = totalAfterDiscount * (this.company.vat / 100);
    const total = totalAfterDiscount + tax + vat;

    const deposit = +this.field('deposit').value;
    const depositType = this.field('depositType').value;
    const totalPaid = this.invoice.totalPaid ? this.invoice.totalPaid : 0;
    const totalOutstanding = total - this.invoice.totalPaid;

    let depositTotal = 0;
    if (depositType === 'Percent') {
      depositTotal =
        deposit > 0 ? totalOutstanding * (deposit / 100) : totalOutstanding;
    } else {
      depositTotal = deposit > 0 ? deposit : totalOutstanding;
    }

    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    const code = `EST${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${(this.company.totalInvoices ? this.company.totalInvoices + 1 : 1)
      .toString()
      .padStart(6, '0')}`;

    this.invoice = {
      ...this.invoice,
      ...this.form.value,
      date: this.isEdit ? this.invoice.date : new Date(),
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
        gst: this.company?.gst,
      },
      code: this.isEdit ? this.invoice.code : code,
      status: this.isEdit ? this.invoice.status : 'pending-Not Sent',
      subtotal,
      discount,
      tax,
      vat,
      total,
      depositTotal,
      totalOutstanding,
      totalPaid,
      createdBy: this.isEdit ? this.invoice.createdBy : this.user.id,
      updatedBy: this.user.id,
    };
  }
  //start the acceptance process
  async enterPayment() {
    const modal = await this.masterSvc.modal().create({
      component: AddPaymentComponent,
      componentProps: {
        value: this.invoice,
      },
      id: 'addPayment',
      cssClass: 'accept',
    });
    return await modal.present();
  }

  // START: functions to update each rate category
  private calcScaffoldRate() {
    switch (this.field('scaffold.rate').value.code) {
      case 1:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.length').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 2:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.width').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 3:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.height').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 4:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.length').value *
              this.field('scaffold.width').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 5:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.length').value *
              this.field('scaffold.height').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 6:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.height').value *
              this.field('scaffold.width').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 7:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.length').value *
              this.field('scaffold.width').value *
              this.field('scaffold.height').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 8:
        {
          this.field('scaffold.total').setValue(
            ((this.field('scaffold.length').value *
              this.field('scaffold.height').value) /
              10) *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 9:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.length').value *
              this.field('scaffold.lifts').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 0: {
        this.field('scaffold.total').setValue(
          this.field('scaffold.rate').value.rate
        );
      }
    }
    this.field('scaffold.total').setValue(
      +this.field('scaffold.total').value.toFixed(2)
    );
  }

  private calcBoardRate(i: string | number) {
    const ref = this.boardForms.controls[i] as FormControl;
    switch (ref.get('rate').value.code) {
      case 1:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 2:
        {
          ref
            .get('total')
            .setValue(
              ref.get('width').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 3:
        {
          ref
            .get('total')
            .setValue(
              ref.get('height').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 4:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('width').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 0: {
        ref
          .get('total')
          .setValue(ref.get('qty').value * ref.get('rate').value.rate);
      }
    }
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
  }

  private calcAttachmentRate(i: string | number) {
    const ref = this.attachmentsForms.controls[i] as FormControl;
    switch (ref.get('rate').value.code) {
      case 1:
        {
          ref
            .get('total')
            .setValue(ref.get('length').value * ref.get('rate').value.rate);
        }
        break;
      case 2:
        {
          ref
            .get('total')
            .setValue(ref.get('width').value * ref.get('rate').value.rate);
        }
        break;
      case 3:
        {
          ref
            .get('total')
            .setValue(ref.get('height').value * ref.get('rate').value.rate);
        }
        break;
      case 4:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('width').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 5:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('height').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 6:
        {
          ref
            .get('total')
            .setValue(
              ref.get('height').value *
                ref.get('width').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 7:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('width').value *
                ref.get('height').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 8:
        {
          ref
            .get('total')
            .setValue(
              ((ref.get('length').value * ref.get('height').value) / 10) *
                ref.get('rate').value.rate
            );
        }
        break;
      case 9:
        {
          ref
            .get('total')
            .setValue(
              ref.get('length').value *
                ref.get('lifts').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 0: {
        ref.get('total').setValue(ref.get('rate').value.rate);
      }
    }
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
  }

  private calcHireRate() {
    let attachments = 0;
    this.arr('attachments').controls.forEach((c) => {
      attachments += +c.get('total').value;
    });
    let boards = 0;
    this.arr('boards').controls.forEach((c) => {
      boards += +c.get('total').value;
    });

    switch (this.field('hire.rate').value.code) {
      case 1:
        {
          const period = this.field('hire.isWeeks').value
            ? this.field('hire.daysStanding').value * 7
            : this.field('hire.daysStanding').value;
          this.field('hire.total').setValue(
            period * this.field('hire.rate').value.rate
          );
        }
        break;
      case 2:
        {
          this.field('hire.total').setValue(
            (this.field('scaffold.total').value + attachments + boards) *
              (this.field('hire.rate').value.rate / 100)
          );
        }
        break;
      case 3:
        {
          const period = this.field('hire.isWeeks').value
            ? this.field('hire.daysStanding').value * 7
            : this.field('hire.daysStanding').value;
          this.field('hire.total').setValue(
            (this.field('scaffold.total').value + attachments + boards) *
              period *
              (this.field('hire.rate').value.rate / 100)
          );
        }
        break;
      case 4:
        {
          const period = this.field('hire.isWeeks').value
            ? this.field('hire.daysStanding').value
            : this.field('hire.daysStanding').value / 7;
          this.field('hire.total').setValue(
            (this.field('scaffold.total').value + attachments + boards) *
              period *
              (this.field('hire.rate').value.rate / 100)
          );
        }
        break;
      case 5:
        {
          const period = this.field('hire.isWeeks').value
            ? this.field('hire.daysStanding').value
            : this.field('hire.daysStanding').value / 7;
          this.field('hire.total').setValue(
            period * this.field('hire.rate').value.rate
          );
        }
        break;
      case 0: {
        this.field('hire.total').setValue(this.field('hire.rate').value.rate);
      }
    }
    this.field('hire.total').setValue(
      +this.field('hire.total').value.toFixed(2)
    );
  }

  private calcAdditionalRate(i: string | number) {
    const ref = this.additionalForms.controls[i] as FormControl;

    switch (ref.get('rate').value.code) {
      case 1:
        {
          ref
            .get('total')
            .setValue(
              ref.get('daysStanding').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 0: {
        ref
          .get('total')
          .setValue(ref.get('qty').value * ref.get('rate').value.rate);
      }
    }
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
  }
  private calcLabourRate(i: string | number) {
    const ref = this.labourForms.controls[i] as FormControl;

    ref
      .get('total')
      .setValue(
        +(
          ref.get('days').value *
          ref.get('hours').value *
          ref.get('qty').value *
          ref.get('rate').value.rate
        ).toFixed(2)
      );
  }
  private calcTransportRate(i: string | number) {
    const ref = this.transportForms.controls[i] as FormControl;

    ref
      .get('total')
      .setValue(
        +(
          ref.get('days').value *
          ref.get('hours').value *
          ref.get('qty').value *
          ref.get('type').value.rate
        ).toFixed(2)
      );
  }
  // END: Calculations

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      customer: [this.invoice.customer, Validators.required],
      message: [this.invoice.message],
      siteName: [this.invoice.siteName, Validators.required],
      startDate: [this.invoice.startDate, Validators.nullValidator],
      endDate: [this.invoice.endDate, Validators.nullValidator],
      discountPercentage: [
        this.invoice.discountPercentage,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      deposit: [
        this.invoice.deposit === 0 ? 100 : this.invoice.deposit,
        [Validators.required, Validators.min(0)],
      ],
      depositType: [
        this.invoice.depositType ? this.invoice.depositType : 'Percent',
        [Validators.required],
      ],
      scaffold: this.masterSvc.fb().group({
        description: [
          this.invoice.scaffold.description,
          Validators.nullValidator,
        ],
        rate: [this.invoice.scaffold.rate, Validators.required],
        length: [
          this.invoice.scaffold.length,
          [Validators.required, Validators.min(1)],
        ],
        width: [
          this.invoice.scaffold.width,
          [Validators.required, Validators.min(1)],
        ],
        height: [
          this.invoice.scaffold.height,
          [Validators.required, Validators.min(1)],
        ],
        lifts: [
          this.invoice.scaffold.lifts,
          [Validators.nullValidator, Validators.min(1)],
        ],
        level: [0],
        total: [this.invoice.scaffold.total],
      }),
      boards: this.masterSvc.fb().array([]),
      hire: this.masterSvc.fb().group({
        rate: [this.invoice.hire.rate],
        daysStanding: [this.invoice.hire.daysStanding, [Validators.min(1)]],
        total: [this.invoice.hire.total],
        isWeeks: [this.invoice.hire.isWeeks, Validators.nullValidator],
      }),
      additionals: this.masterSvc.fb().array([]),
      attachments: this.masterSvc.fb().array([]),
      broker: [this.invoice.broker],
      transportProfile: [
        this.invoice.transportProfile ? this.invoice.transportProfile : '',
        Validators.nullValidator,
      ],
      labour: this.masterSvc.fb().array([]),
      transport: this.masterSvc.fb().array([]),
      poNumber: [this.invoice.poNumber],
      woNumber: [this.invoice.woNumber],
      code: [this.invoice.code],
    });
    this.invoice.attachments.forEach((a) => {
      const attachment = this.masterSvc.fb().group({
        description: [a.description, Validators.nullValidator],
        rate: [a.rate, Validators.required],
        length: [a.length, [Validators.required, Validators.min(1)]],
        width: [a.width, [Validators.required, Validators.min(1)]],
        height: [a.height, [Validators.required, Validators.min(1)]],
        lifts: [a.lifts, [Validators.nullValidator, Validators.min(1)]],
        level: [a.level],
        total: [a.total],
      });
      this.attachmentsForms.push(attachment);
    });
    this.invoice.boards.forEach((b) => {
      const board = this.masterSvc.fb().group({
        rate: [b.rate],
        length: [b.length, [Validators.required, Validators.min(1)]],
        width: [b.width, [Validators.required, Validators.min(1)]],
        height: [b.height, [Validators.required, Validators.min(1)]],
        qty: [b.qty, [Validators.required, Validators.min(1)]],
        total: [b.total],
      });
      this.boardForms.push(board);
    });
    this.invoice.labour.forEach((l) => {
      const labour = this.masterSvc.fb().group({
        type: [l.type, Validators.required],
        hours: [l.hours, Validators.required],
        days: [l.days, Validators.required],
        rate: [l.rate],
        qty: [l.qty, Validators.required],
        total: [l.total],
      });
      this.labourForms.push(labour);
    });
    this.invoice.transport.forEach((t) => {
      const transport = this.masterSvc.fb().group({
        type: [t.type, Validators.required],
        hours: [t.hours, Validators.required],
        days: [t.days, Validators.required],
        qty: [t.qty, Validators.required],
        total: [t.total],
      });
      this.transportForms.push(transport);
    });
    this.invoice.additionals.forEach((add) => {
      const additional = this.masterSvc.fb().group({
        rate: [add.rate, Validators.required],
        qty: [add.qty, [Validators.required, Validators.min(1)]],
        name: [add.name, Validators.required],
        daysStanding: [
          add.daysStanding,
          [Validators.required, Validators.min(1)],
        ],
        total: [add.total],
      });
      this.additionalForms.push(additional);
    });
    this.isLoading = false;
  }

  private initFrom() {
    this.form = this.masterSvc.fb().group({
      customer: ['', Validators.required],
      message: [
        // eslint-disable-next-line max-len
        'We thank you for your scaffolding enquiry as per the Scope of Work detailed below. We attach herewith our invoice for your perusal.',
        Validators.required,
      ],
      siteName: ['', Validators.required],
      startDate: ['', Validators.nullValidator],
      endDate: ['', Validators.nullValidator],
      discountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      deposit: [100, [Validators.required, Validators.min(0)]],
      depositType: ['Percentage', [Validators.required]],
      scaffold: this.masterSvc.fb().group({
        description: ['', Validators.nullValidator],
        rate: ['', Validators.required],
        length: ['', [Validators.required, Validators.min(1)]],
        width: ['', [Validators.required, Validators.min(1)]],
        height: ['', [Validators.required, Validators.min(1)]],
        lifts: ['', [Validators.nullValidator, Validators.min(1)]],
        level: [0],
        total: [0],
      }),
      attachments: this.masterSvc.fb().array([]),
      hire: this.masterSvc.fb().group({
        rate: [''],
        daysStanding: ['', [Validators.min(1)]],
        total: [0],
        isWeeks: ['', Validators.nullValidator],
      }),
      boards: this.masterSvc.fb().array([]),
      additionals: this.masterSvc.fb().array([]),
      broker: [''],
      transportProfile: [''],
      poNumber: [''],
      woNumber: [''],
      labour: this.masterSvc.fb().array([]),
      transport: this.masterSvc.fb().array([]),
    });
    // this.addBoard();
    // this.addLabour();
    // this.addAdditional();
  }
  // END: Form Init
}
