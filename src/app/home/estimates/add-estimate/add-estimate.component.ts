import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { IonTextarea } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Term } from 'src/app/models/term.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Estimate } from 'src/app/models/estimate.model';
import { MasterService } from '../../../services/master.service';
import { AcceptEstimateComponent } from './accept-estimate/accept-estimate.component';
import { CompanyState } from 'src/app/shared/company/company.state';
import { User } from 'src/app/models/user.model';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-estimate',
  templateUrl: './add-estimate.component.html',
})
export class AddEstimatePage implements OnInit {
  @Input() estimate: Estimate;
  @Input() isEdit = false;
  @ViewChild('message') message: IonTextarea;
  user: User;
  company: Company;
  customers$: Observable<Customer[]>;
  terms$: Observable<any>;
  rates$: Observable<any>;
  brokers$: Observable<any>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  active = 'overview';
  show = '';

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  get boardForms() {
    return this.form.get('boards') as FormArray;
  }
  get labourForms() {
    return this.form.get('labour') as FormArray;
  }
  get additionalForms() {
    return this.form.get('additionals') as FormArray;
  }

  async download(terms: Term | null) {
    const pdf = await this.masterSvc
      .pdf()
      .generateEstimate(this.estimate, this.company, terms);
    this.masterSvc.handlePdf(pdf, this.estimate.code);
  }

  close() {
    this.masterSvc.modal().dismiss();
  }

  ngOnInit() {
    this.customers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/customers`);
    this.rates$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/rateProfiles`, 'estimateRates');
    this.terms$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/terms`, 'Estimate');
    this.brokers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/brokers`);

    if (this.isEdit) {
      this.estimate = { ...this.estimate };
      this.initEditForm();
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

  arr(field: string) {
    return this.form.get(field) as FormArray;
  }

  arrField(arr: string, index: number, field: string) {
    return this.arr(arr).controls[index].get(field) as FormControl;
  }

  changeCustomer(args) {
    if (args !== 'add') {
      this.show = 'editCustomer';
    } else {
      this.show = 'addCustomer';
    }
  }
  changeBroker() {
    this.labourForms.clear();
    this.addLabour();
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  newCustomer(args) {
    this.field('customer').setValue({ ...args });
  }

  nextView(page: string) {
    this.active = page;
  }

  segmentChanged(ev: any) {
    if (ev.detail.value === 'summary') {
      this.updateEstimateTotal();
      this.active = ev.detail.value;
    } else {
      this.active = ev.detail.value;
    }
  }

  update(type: string, i?: number) {
    switch (type) {
      case 'scaffold':
        {
          this.calcScaffoldRate();
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
      case 'labour': {
        this.calcLabourRate(i);
      }
    }
    this.calcHireRate();
  }

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
      case 'labour': {
        this.arrField('labour', i, 'rate').patchValue({
          ...this.arrField('labour', i, 'rate').value,
          rate: +args,
        });
        this.calcLabourRate(i);
      }
    }
    this.calcHireRate();
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

  createEstimate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateEstimateTotal();
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.estimate.company.id}/estimates`,
            this.estimate
          );
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalEstimates: increment(1),
        });
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

  updateEstimate(status: 'pending' | 'accepted' | 'rejected') {
    if (status === 'accepted') {
      this.startAcceptance();
    } else {
      this.masterSvc.notification().presentAlertConfirm(() => {
        this.loading = true;
        this.updateEstimateTotal();
        this.estimate.status = status;
        this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/estimates`,
            this.estimate.id,
            this.estimate
          )
          .then(() => {
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

  private async startAcceptance() {
    const modal = await this.masterSvc.modal().create({
      component: AcceptEstimateComponent,
      componentProps: {
        company: this.company,
        user: this.user,
        estimate: this.estimate,
        form: this.form,
      },
      id: 'acceptEstimate',
      cssClass: 'accept',
    });
    return await modal.present();
  }

  // private reset() {
  //   this.active = 'overview';
  //   this.show = '';
  //   this.initFrom();
  //   this.loading = false;
  // }

  private updateEstimateTotal() {
    if (this.isEdit && this.estimate.status !== 'pending') {
      return;
    }
    const scaffold = +this.field('scaffold.total').value;
    const hire = +this.field('hire.total').value;
    let boards = 0;
    this.arr('boards').controls.forEach((c) => {
      boards += +c.get('total').value;
    });
    let labour = 0;
    this.arr('labour').controls.forEach((c) => {
      labour += +c.get('total').value;
    });
    let additionals = 0;
    this.arr('additionals').controls.forEach((c) => {
      additionals += +c.get('total').value;
    });

    const subtotal = scaffold + boards + hire + labour + additionals;
    const discount = subtotal * (+this.field('discountPercentage').value / 100);
    const totalAfterDiscount = subtotal - discount;
    const tax = totalAfterDiscount * (this.company.salesTax / 100);
    const vat = totalAfterDiscount * (this.company.vat / 100);
    const total = totalAfterDiscount + tax + vat;

    const code = `EST${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${(this.company.totalEstimates + 1).toString().padStart(6, '0')}`;

    Object.assign(this.estimate, {
      ...this.form.value,
      date: this.isEdit ? this.estimate.date : new Date(),
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
      code: this.isEdit ? this.estimate.code : code,
      status: this.isEdit ? this.estimate.status : 'pending',
      subtotal,
      discount,
      tax,
      vat,
      total,
      createdBy: this.isEdit ? this.estimate.createdBy : this.user.id,
      updatedBy: this.user.id,
    });
  }

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

  private calcHireRate() {
    let boards = 0;
    this.arr('boards').controls.forEach((c) => {
      boards += +c.get('total').value;
    });
    switch (this.field('hire.rate').value.code) {
      case 1:
        {
          this.field('hire.total').setValue(
            this.field('hire.daysStanding').value *
              this.field('hire.rate').value.rate
          );
        }
        break;
      case 2:
        {
          this.field('hire.total').setValue(
            (this.field('scaffold.total').value + boards) *
              (this.field('hire.rate').value.rate / 100)
          );
        }
        break;
      case 3:
        {
          this.field('hire.total').setValue(
            (this.field('scaffold.total').value + boards) *
              this.field('hire.daysStanding').value *
              (this.field('hire.rate').value.rate / 100)
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

  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      customer: [this.estimate.customer, Validators.required],
      message: [this.estimate.message, Validators.required],
      siteName: [this.estimate.siteName, Validators.required],
      startDate: [this.estimate.startDate, Validators.required],
      endDate: [this.estimate.endDate, Validators.required],
      discountPercentage: [
        this.estimate.discountPercentage,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      scaffold: this.masterSvc.fb().group({
        rate: [this.estimate.scaffold.rate, Validators.required],
        length: [
          this.estimate.scaffold.length,
          [Validators.required, Validators.min(1)],
        ],
        width: [
          this.estimate.scaffold.width,
          [Validators.required, Validators.min(1)],
        ],
        height: [
          this.estimate.scaffold.height,
          [Validators.required, Validators.min(1)],
        ],
        total: [this.estimate.scaffold.total],
      }),
      boards: this.masterSvc.fb().array([]),
      hire: this.masterSvc.fb().group({
        rate: [this.estimate.hire.rate, Validators.required],
        daysStanding: [
          this.estimate.hire.daysStanding,
          [Validators.required, Validators.min(1)],
        ],
        total: [this.estimate.hire.total],
      }),
      additionals: this.masterSvc.fb().array([]),
      broker: [this.estimate.broker],
      labour: this.masterSvc.fb().array([]),
      poNumber: [this.estimate.poNumber],
      woNumber: [this.estimate.woNumber],
      code: [this.estimate.code],
    });
    this.estimate.boards.forEach((b) => {
      const board = this.masterSvc.fb().group({
        rate: [b.rate, Validators.required],
        length: [b.length, [Validators.required, Validators.min(1)]],
        width: [b.width, [Validators.required, Validators.min(1)]],
        height: [b.height, [Validators.required, Validators.min(1)]],
        qty: [b.qty, [Validators.required, Validators.min(1)]],
        total: [b.total],
      });
      this.boardForms.push(board);
    });
    this.estimate.labour.forEach((l) => {
      const labour = this.masterSvc.fb().group({
        type: [l.type, Validators.required],
        hours: [l.hours, Validators.required],
        days: [l.days, Validators.required],
        rate: [l.rate, [Validators.required]],
        qty: [l.qty, Validators.required],
        total: [l.total],
      });
      this.labourForms.push(labour);
    });
    this.estimate.additionals.forEach((add) => {
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
    this.estimate = {
      vat: 0,
      total: 0,
      siteName: '',
      scaffold: undefined,
      status: 'pending',
      additionals: [],
      date: undefined,
      startDate: undefined,
      endDate: undefined,
      company: {},
      broker: undefined,
      subtotal: 0,
      hire: undefined,
      customer: undefined,
      labour: [],
      code: '',
      message: '',
      tax: 0,
      boards: [],
      id: '',
      discountPercentage: 0,
      discount: 0,
    };
    this.form = this.masterSvc.fb().group({
      customer: ['', Validators.required],
      message: [
        // eslint-disable-next-line max-len
        'We thank you for your scaffolding enquiry as per the Scope of Work detailed below. We attach herewith our estimate for your perusal.',
        Validators.required,
      ],
      siteName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      discountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      scaffold: this.masterSvc.fb().group({
        rate: ['', Validators.required],
        length: ['', [Validators.required, Validators.min(1)]],
        width: ['', [Validators.required, Validators.min(1)]],
        height: ['', [Validators.required, Validators.min(1)]],
        total: [0],
      }),
      hire: this.masterSvc.fb().group({
        rate: ['', Validators.required],
        daysStanding: ['', [Validators.required, Validators.min(1)]],
        total: [0],
      }),
      boards: this.masterSvc.fb().array([]),
      additionals: this.masterSvc.fb().array([]),
      broker: [''],
      poNumber: [''],
      woNumber: [''],
      labour: this.masterSvc.fb().array([]),
    });
    // this.addBoard();
    // this.addLabour();
    // this.addAdditional();
  }
}
