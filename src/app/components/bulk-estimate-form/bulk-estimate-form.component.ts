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
  types$: Observable<any>;
  brokers$: Observable<any>;
  transport$: Observable<Transport[]>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  updating = false;

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
    this.types$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/templates`, 'scaffoldTypes');

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
      extraHirePercentage: ['', [Validators.nullValidator]],
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
      daysStanding: ['', [Validators.nullValidator]],
      extraHirePercentage: ['', [Validators.nullValidator]],
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
      extraHirePercentage: ['', [Validators.nullValidator]],
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
      lifts: ['', [Validators.nullValidator]],
      boardedLifts: ['', [Validators.nullValidator]],
      extraHirePercentage: ['', [Validators.nullValidator]],
      extraHire: ['', [Validators.nullValidator]],
      level: [''],
      total: [0],
      hireRate: [''],
      daysStanding: [''],
      hireTotal: [0],
      isWeeks: ['', Validators.nullValidator],
    });
    this.attachmentsForms.push(attachment);
  }
  deleteAttachment(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.attachmentsForms.removeAt(i);
      this.update('hire');
    });
  }
  deleteBoard(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.boardForms.removeAt(i);
      this.update('hire');
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
    this.updating = true;
    switch (type) {
      case 'scaffold':
        {
          this.masterSvc.calc().calcScaffoldRate(this.field('scaffold'));
        }
        break;
      case 'attachments':
        {
          this.masterSvc
            .calc()
            .calcAttachmentRate(
              this.attachmentsForms.controls[i] as FormControl
            );
        }
        break;
      case 'boards':
        {
          this.masterSvc
            .calc()
            .calcBoardRate(this.boardForms.controls[i] as FormControl);
        }
        break;
      case 'additionals':
        {
          this.masterSvc
            .calc()
            .calcAdditionalRate(
              this.additionalForms.controls[i] as FormControl
            );
        }
        break;
      case 'labour':
        {
          this.masterSvc
            .calc()
            .calcLabourRate(this.labourForms.controls[i] as FormControl);
        }
        break;
      case 'transport': {
        this.masterSvc
          .calc()
          .calcTransportRate(this.transportForms.controls[i] as FormControl);
      }
    }
    this.masterSvc
      .calc()
      .calcHireRate(
        this.field('hire'),
        +this.field('scaffold.total').value,
        this.arr('attachments'),
        this.arr('boards')
      );
    if (this.canUpdate) {
      this.updateEstimateTotal();
      this.updating = false;
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

          this.update('scaffold');
        }
        break;
      case 'scaffoldHire':
        {
          this.field('scaffold.hireRate').patchValue({
            ...this.field('scaffold.hireRate').value,
            rate: +args,
          });
          this.masterSvc.calc().calcHireRate2(this.field('scaffold'));
        }
        break;
      case 'attachments':
        {
          this.arrField('attachments', i, 'rate').patchValue({
            ...this.arrField('attachments', i, 'rate').value,
            rate: +args,
          });

          this.update('attachments', i);
        }
        break;
      case 'attachmentHire':
        {
          this.arrField('attachments', i, 'hireRate').patchValue({
            ...this.arrField('attachments', i, 'hireRate').value,
            rate: +args,
          });

          this.masterSvc
            .calc()
            .calcHireRate2(this.attachmentsForms.controls[i] as FormControl);
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
          this.update('boards', i);
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
          this.update('additionals', i);
        }
        break;
      case 'labour':
        {
          this.arrField('labour', i, 'rate').patchValue({
            ...this.arrField('labour', i, 'rate').value,
            rate: +args,
          });
          this.update('labour', i);
        }
        break;
      case 'transport': {
        if (args) {
          this.arrField('transport', i, 'type').patchValue({
            ...this.arrField('transport', i, 'type').value,
            rate: +args,
          });
        }
        this.update('transport', i);
      }
    }
    this.update('hire');
  }

  //update the estimate total
  private updateEstimateTotal() {
    if (this.isEdit && this.estimate.status !== 'pending') {
      return;
    }
    const scaffold =
      +this.field('scaffold.total').value +
      +this.field('scaffold.hireTotal').value;
    const hire = +this.field('hire.total').value;
    let extraHire = +this.field('scaffold.extraHire').value;
    let attachments = 0;
    this.arr('attachments').controls.forEach((a) => {
      attachments += +a.get('total').value + +a.get('hireTotal').value;
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
        type: [
          this.estimate.scaffold.type ? this.estimate.scaffold.type : '',
          Validators.nullValidator,
        ],
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
        boardedLifts: [
          this.estimate.scaffold.boardedLifts,
          [Validators.nullValidator],
        ],
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
        hireRate: [
          this.estimate.scaffold.hireRate
            ? this.estimate.scaffold.hireRate
            : '',
        ],
        daysStanding: [
          this.estimate.scaffold.daysStanding
            ? this.estimate.scaffold.daysStanding
            : '',
        ],
        hireTotal: [
          this.estimate.scaffold.hireTotal
            ? this.estimate.scaffold.hireTotal
            : 0,
        ],
        isWeeks: [
          this.estimate.scaffold.isWeeks ? this.estimate.scaffold.isWeeks : '',
          Validators.nullValidator,
        ],
      }),
      boards: this.masterSvc.fb().array([]),
      hire: this.masterSvc.fb().group({
        rate: [this.estimate.hire.rate],
        daysStanding: [this.estimate.hire.daysStanding],
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
        type: [a.type ? a.type : '', Validators.nullValidator],
        description: [a.description, Validators.nullValidator],
        rate: [a.rate, Validators.required],
        length: [a.length, [Validators.required, Validators.min(1)]],
        width: [a.width, [Validators.required, Validators.min(1)]],
        height: [a.height, [Validators.required, Validators.min(1)]],
        lifts: [a.lifts, [Validators.nullValidator]],
        boardedLifts: [a.boardedLifts, [Validators.nullValidator]],
        extraHirePercentage: [
          a.extraHirePercentage,
          [Validators.nullValidator],
        ],
        extraHire: [a.extraHire, [Validators.nullValidator]],
        level: [a.level],
        total: [a.total],
        hireRate: [a.hireRate ? a.hireRate : ''],
        daysStanding: [
          a.daysStanding ? a.daysStanding : '',
          [Validators.min(1)],
        ],
        hireTotal: [a.hireTotal ? a.hireTotal : 0],
        isWeeks: [a.isWeeks ? a.isWeeks : '', Validators.nullValidator],
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
          [Validators.nullValidator],
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
          [Validators.nullValidator],
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
        daysStanding: [add.daysStanding, [Validators.nullValidator]],
        extraHirePercentage: [
          add.extraHirePercentage,
          [Validators.nullValidator],
        ],
        extraHire: [add.extraHire, [Validators.nullValidator]],
        total: [add.total],
      });
      this.additionalForms.push(additional);
    });
    this.isLoading = false;
  }
}
