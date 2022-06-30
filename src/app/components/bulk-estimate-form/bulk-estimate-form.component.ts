import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Transport } from 'src/app/models/transport.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-bulk-estimate-form',
  templateUrl: './bulk-estimate-form.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkEstimateFormComponent implements OnInit {
  @Input() isEdit = false;
  @Input() canUpdate = true;
  @Input() estimate: Estimate = {
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
    extraHire: 0,
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
    budget: undefined,
    enquiryId: '',
  };
  company: Company;
  user: User;
  rates$: Observable<any>;
  brokers$: Observable<any>;
  transport$: Observable<Transport[]>;
  form: FormGroup;
  loading = false;
  isLoading = true;

  constructor(
    private masterSvc: MasterService,
    private change: ChangeDetectorRef
  ) {
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

    this.initEditForm();
    this.form.valueChanges.subscribe(() => {
      this.updateEstimateTotal();
      this.change.detectChanges();
    });
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
      extraHirePercentage: ['', [Validators.nullValidator, Validators.min(1)]],
      extraHire: ['', [Validators.nullValidator]],
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
      extraHirePercentage: ['', [Validators.nullValidator, Validators.min(1)]],
      extraHire: ['', [Validators.nullValidator]],
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
      extraHirePercentage: ['', [Validators.nullValidator, Validators.min(1)]],
      extraHire: ['', [Validators.nullValidator]],
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
      extraHirePercentage: ['', [Validators.nullValidator, Validators.min(1)]],
      extraHire: ['', [Validators.nullValidator]],
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
    if (this.canUpdate) {
      this.updateEstimateTotal();
    }
  }

  //Calculate total for a category base on rates
  updateRate(type: string, args?: any, i?: number) {
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
          if (args) {
            this.arrField('boards', i, 'rate').patchValue({
              ...this.arrField('boards', i, 'rate').value,
              rate: +args,
            });
          }
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
          if (args) {
            this.arrField('additionals', i, 'rate').patchValue({
              ...this.arrField('additionals', i, 'rate').value,
              rate: +args,
            });
          }
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
        if (args) {
          this.arrField('transport', i, 'type').patchValue({
            ...this.arrField('transport', i, 'type').value,
            rate: +args,
          });
        }
        this.calcTransportRate(i);
      }
    }
    this.calcHireRate();
  }

  //update the estimate total
  private updateEstimateTotal() {
    if (this.isEdit && this.estimate.status !== 'pending') {
      return;
    }
    const scaffold = +this.field('scaffold.total').value;
    const hire = +this.field('hire.total').value;
    let extraHire = +this.field('scaffold.extraHire').value;
    let attachments = 0;
    this.arr('attachments').controls.forEach((a) => {
      attachments += +a.get('total').value;
      extraHire += +a.get('extraHire').value;
    });
    let boards = 0;
    this.arr('boards').controls.forEach((b) => {
      boards += +b.get('total').value;
      extraHire += +b.get('extraHire').value;
    });
    let labour = 0;
    this.arr('labour').controls.forEach((l) => {
      labour += +l.get('total').value;
    });
    let transport = 0;
    this.arr('transport').controls.forEach((t) => {
      transport += +t.get('total').value;
      extraHire += +t.get('extraHire').value;
    });
    let additionals = 0;
    this.arr('additionals').controls.forEach((a) => {
      additionals += +a.get('total').value;
      extraHire += +a.get('extraHire').value;
    });

    const subtotal =
      scaffold + attachments + boards + hire + labour + transport + additionals;
    const discount = subtotal * (+this.field('discountPercentage').value / 100);
    const totalAfterDiscount = subtotal - discount;
    const tax = totalAfterDiscount * (this.company.salesTax / 100);
    const vat = totalAfterDiscount * (this.company.vat / 100);
    const total = totalAfterDiscount + tax + vat;
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    const code = `EST${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${(this.company.totalEstimates ? this.company.totalEstimates + 1 : 1)
      .toString()
      .padStart(6, '0')}`;

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
      extraHire,
      createdBy: this.isEdit ? this.estimate.createdBy : this.user.id,
      updatedBy: this.user.id,
    });
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
    this.field('scaffold.extraHire').setValue(
      +this.field('scaffold.total').value *
        (+this.field('scaffold.extraHirePercentage').value / 100)
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
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    ref
      .get('extraHire')
      .setValue(
        +ref.get('total').value * (+ref.get('extraHirePercentage').value / 100)
      );
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
    ref
      .get('extraHire')
      .setValue(
        +ref.get('total').value * (+ref.get('extraHirePercentage').value / 100)
      );
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
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    ref
      .get('extraHire')
      .setValue(
        +ref.get('total').value * (+ref.get('extraHirePercentage').value / 100)
      );
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
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    ref
      .get('extraHire')
      .setValue(
        +ref.get('total').value * (+ref.get('extraHirePercentage').value / 100)
      );
  }
  // END: Calculations

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      customer: [this.estimate.customer, Validators.required],
      message: [this.estimate.message],
      siteName: [this.estimate.siteName, Validators.required],
      startDate: [this.estimate.startDate, Validators.nullValidator],
      endDate: [this.estimate.endDate, Validators.nullValidator],
      discountPercentage: [
        this.estimate.discountPercentage,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      scaffold: this.masterSvc.fb().group({
        description: [
          this.estimate.scaffold.description,
          Validators.nullValidator,
        ],
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
        lifts: [this.estimate.scaffold.lifts, [Validators.nullValidator]],
        extraHirePercentage: [
          this.estimate.scaffold.extraHirePercentage,
          [Validators.nullValidator],
        ],
        extraHire: [
          this.estimate.scaffold.extraHire,
          [Validators.nullValidator],
        ],
        level: [0],
        total: [this.estimate.scaffold.total],
      }),
      boards: this.masterSvc.fb().array([]),
      hire: this.masterSvc.fb().group({
        rate: [this.estimate.hire.rate],
        daysStanding: [this.estimate.hire.daysStanding, [Validators.min(1)]],
        total: [this.estimate.hire.total],
        isWeeks: [this.estimate.hire.isWeeks, Validators.nullValidator],
      }),
      additionals: this.masterSvc.fb().array([]),
      attachments: this.masterSvc.fb().array([]),
      broker: [this.estimate.broker],
      transportProfile: [
        this.estimate.transportProfile ? this.estimate.transportProfile : '',
        Validators.nullValidator,
      ],
      labour: this.masterSvc.fb().array([]),
      transport: this.masterSvc.fb().array([]),
      poNumber: [this.estimate.poNumber],
      woNumber: [this.estimate.woNumber],
      code: [this.estimate.code],
    });
    this.estimate.attachments.forEach((a) => {
      const attachment = this.masterSvc.fb().group({
        description: [a.description, Validators.nullValidator],
        rate: [a.rate, Validators.required],
        length: [a.length, [Validators.required, Validators.min(1)]],
        width: [a.width, [Validators.required, Validators.min(1)]],
        height: [a.height, [Validators.required, Validators.min(1)]],
        lifts: [a.lifts, [Validators.nullValidator, Validators.min(1)]],
        extraHirePercentage: [
          a.extraHirePercentage,
          [Validators.nullValidator, Validators.min(1)],
        ],
        extraHire: [a.extraHire, [Validators.nullValidator]],
        level: [a.level],
        total: [a.total],
      });
      this.attachmentsForms.push(attachment);
    });
    this.estimate.boards.forEach((b) => {
      const board = this.masterSvc.fb().group({
        rate: [b.rate],
        length: [b.length, [Validators.required, Validators.min(1)]],
        width: [b.width, [Validators.required, Validators.min(1)]],
        height: [b.height, [Validators.required, Validators.min(1)]],
        qty: [b.qty, [Validators.required, Validators.min(1)]],
        extraHirePercentage: [
          b.extraHirePercentage,
          [Validators.nullValidator, Validators.min(1)],
        ],
        extraHire: [b.extraHire, [Validators.nullValidator]],
        total: [b.total],
      });
      this.boardForms.push(board);
    });
    this.estimate.labour.forEach((l) => {
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
    this.estimate.transport.forEach((t) => {
      const transport = this.masterSvc.fb().group({
        type: [t.type, Validators.required],
        hours: [t.hours, Validators.required],
        days: [t.days, Validators.required],
        qty: [t.qty, Validators.required],
        extraHirePercentage: [
          t.extraHirePercentage,
          [Validators.nullValidator, Validators.min(1)],
        ],
        extraHire: [t.extraHire, [Validators.nullValidator]],
        total: [t.total],
      });
      this.transportForms.push(transport);
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
        extraHirePercentage: [
          add.extraHirePercentage,
          [Validators.nullValidator, Validators.min(1)],
        ],
        extraHire: [add.extraHire, [Validators.nullValidator]],
        total: [add.total],
      });
      this.additionalForms.push(additional);
    });
    this.isLoading = false;
  }
}
