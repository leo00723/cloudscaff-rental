import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { IonTextarea } from '@ionic/angular';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { AcceptEstimateComponent } from 'src/app/home/estimates/add-estimate/accept-estimate/accept-estimate.component';
import { Company } from 'src/app/models/company.model';
import { Modification } from 'src/app/models/modification.model';
import { ScaffoldCost } from 'src/app/models/scaffold-cost';
import { Scaffold } from 'src/app/models/scaffold.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-modification',
  templateUrl: './add-modification.component.html',
})
export class AddModificationComponent implements OnInit, OnDestroy {
  @ViewChild('message') message: IonTextarea;
  @Input() isEdit = false;
  @Input() set value(val: Scaffold) {
    Object.assign(this.scaffold, val);
  }
  @Select() company$: Observable<Company>;
  site$: Observable<Site>;
  scaffold: Scaffold = {
    id: '',
    code: '',
    date: undefined,
    companyId: '',
    customerId: '',
    siteId: '',
    siteCode: '',
    createdBy: '',
    scaffold: undefined,
    attachments: [],
    boards: [],
    hire: undefined,
    labour: [],
    additionals: [],
    poNumber: '',
    woNumber: '',
    updatedBy: '',
    startDate: undefined,
    endDate: undefined,
    status: '',
    users: [],
    totalInspections: 0,
    totalHandovers: 0,
    totalModifications: 0,
    totalInvoices: 0,
  };
  @Input() modification: Modification = {
    additionals: [],
    boards: [],
    attachments: [],
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
  company: Company;
  user: User;
  rates$: Observable<any>;
  brokers$: Observable<any>;
  form: FormGroup;
  loading = false;
  ready = false;
  isLoading = true;
  active = 'overview';
  show = '';
  calcDimension = new ScaffoldCost();

  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.rates$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/rateProfiles`, 'estimateRates');
    this.brokers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/brokers`);

    if (this.isEdit) {
      this.modification = { ...this.modification };
      console.log(this.modification);
      this.initEditForm();
      this.show = 'editCustomer';
    } else {
      this.site$ = this.masterSvc
        .edit()
        .getDocById(
          `company/${this.company.id}/sites`,
          this.scaffold.siteId
        ) as Observable<Site>;
      this.subs.add(
        this.site$.subscribe((site) => {
          this.modification.customer = site.customer;
          this.modification.siteName = site.name;
          this.initFrom();
        })
      );
      this.isLoading = false;
    }
  }
  ionViewDidEnter() {
    this.ready = true;
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
  get additionalForms() {
    return this.form.get('additionals') as FormArray;
  }
  addLabour() {
    const labour = this.masterSvc.fb().group({
      type: ['', Validators.required],
      hours: ['', Validators.required],
      days: ['', Validators.required],
      rate: ['', Validators.nullValidator],
      qty: ['', Validators.required],
      total: [0],
    });
    this.labourForms.push(labour);
  }
  addAdditional() {
    const additional = this.masterSvc.fb().group({
      rate: ['', Validators.nullValidator],
      qty: ['', [Validators.required, Validators.min(1)]],
      name: ['', Validators.required],
      daysStanding: ['', [Validators.required, Validators.min(1)]],
      total: [0],
    });
    this.additionalForms.push(additional);
  }
  addBoard() {
    const board = this.masterSvc.fb().group({
      rate: ['', Validators.nullValidator],
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
      rate: ['', Validators.nullValidator],
      length: ['', [Validators.required, Validators.min(1)]],
      width: ['', [Validators.required, Validators.min(1)]],
      height: ['', [Validators.required, Validators.min(1)]],
      level: ['', [Validators.nullValidator]],
      breakdown: [{ dismantle: [], erection: [] }, [Validators.nullValidator]],
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

  //switch between pages
  nextView(page: string) {
    this.active = page;
  }

  //event for switching between pages
  segmentChanged(ev: any) {
    if (ev.detail.value === 'summary') {
      this.updateModificationTotal();
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
      case 'labour': {
        this.calcLabourRate(i);
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

  //create the modification
  createModification() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateModificationTotal();
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.modification.company.id}/modifications`,
            this.modification
          );
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalModifications: increment(1),
        });
        this.masterSvc
          .notification()
          .toast('Modification created successfully!', 'success');
        this.close();
      } catch (error) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your modification, try again!',
            'danger',
            2000
          );
      }
    });
  }

  //update the modification
  updateModification(status: 'pending' | 'accepted' | 'rejected') {
    if (status === 'accepted') {
      this.startAcceptance();
    } else {
      this.masterSvc.notification().presentAlertConfirm(() => {
        this.loading = true;
        this.updateModificationTotal();
        this.modification.status = status;
        this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/modifications`,
            this.modification.id,
            this.modification
          )
          .then(() => {
            this.masterSvc
              .notification()
              .toast('Modification updated successfully!', 'success');
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
            this.masterSvc
              .notification()
              .toast(
                'Something went wrong updating your modification, try again!',
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
        modification: this.modification,
        form: this.form,
      },
      id: 'acceptModification',
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  //update the modification total
  private updateModificationTotal() {
    if (this.isEdit && this.modification.status !== 'pending') {
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
    let additionals = 0;
    this.arr('additionals').controls.forEach((c) => {
      additionals += +c.get('total').value;
    });

    const subtotal =
      scaffold + attachments + boards + hire + labour + additionals;
    const discount = subtotal * (+this.field('discountPercentage').value / 100);
    const totalAfterDiscount = subtotal - discount;
    const tax = totalAfterDiscount * (this.company.salesTax / 100);
    const vat = totalAfterDiscount * (this.company.vat / 100);
    const total = totalAfterDiscount + tax + vat;

    const code = `MOD${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${(this.scaffold.totalModifications
      ? this.scaffold.totalModifications + 1
      : 1
    )
      .toString()
      .padStart(6, '0')}`;

    Object.assign(this.modification, {
      ...this.form.value,
      date: this.isEdit ? this.modification.date : new Date(),
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
      code: this.isEdit ? this.modification.code : code,
      status: this.isEdit ? this.modification.status : 'pending',
      subtotal,
      discount,
      tax,
      vat,
      total,
      createdBy: this.isEdit ? this.modification.createdBy : this.user.id,
      updatedBy: this.user.id,
      oldScaffold: this.scaffold,
      scaffoldId: this.scaffold.id,
      scaffoldCode: this.scaffold.code,
      siteId: this.scaffold.siteId,
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
      case 0: {
        this.field('scaffold.total').setValue(
          this.field('scaffold.rate').value.rate
        );
      }
    }
    this.field('scaffold.total').setValue(
      +this.field('scaffold.total').value.toFixed(2)
    );

    const newScaffold = this.field('scaffold').value;
    this.field('scaffold.breakdown').setValue(
      this.calcDimension.scaffoldCost(this.scaffold.scaffold, newScaffold)
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
      case 0: {
        ref.get('total').setValue(ref.get('rate').value.rate);
      }
    }
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    const newScaffold = ref.value;
    const oldScaffold = this.scaffold.attachments[i]
      ? this.scaffold.attachments[i]
      : { length: 0, width: 0, height: 0 };
    console.log(oldScaffold);
    ref
      .get('breakdown')
      .setValue(this.calcDimension.scaffoldCost(oldScaffold, newScaffold));
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
          this.field('hire.total').setValue(
            this.field('hire.daysStanding').value *
              this.field('hire.rate').value.rate
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
          this.field('hire.total').setValue(
            (this.field('scaffold.total').value + attachments + boards) *
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
  // END: Calculations

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      customer: [this.modification.customer, Validators.required],
      message: [this.modification.message, Validators.required],
      siteName: [this.modification.siteName, Validators.required],
      startDate: [this.modification.startDate, Validators.required],
      endDate: [this.modification.endDate, Validators.required],
      discountPercentage: [
        this.modification.discountPercentage,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      scaffold: this.masterSvc.fb().group({
        rate: [this.modification.scaffold.rate, Validators.required],
        length: [
          this.modification.scaffold.length,
          [Validators.required, Validators.min(1)],
        ],
        width: [
          this.modification.scaffold.width,
          [Validators.required, Validators.min(1)],
        ],
        height: [
          this.modification.scaffold.height,
          [Validators.required, Validators.min(1)],
        ],
        level: [0, [Validators.nullValidator]],
        breakdown: [
          this.modification.scaffold.breakdown,
          [Validators.nullValidator],
        ],
        total: [this.modification.scaffold.total],
      }),
      boards: this.masterSvc.fb().array([]),
      hire: this.masterSvc.fb().group({
        rate: [this.modification.hire.rate, Validators.required],
        daysStanding: [
          this.modification.hire.daysStanding,
          [Validators.required, Validators.min(1)],
        ],
        total: [this.modification.hire.total],
      }),
      additionals: this.masterSvc.fb().array([]),
      attachments: this.masterSvc.fb().array([]),
      broker: [this.modification.broker],
      labour: this.masterSvc.fb().array([]),
      poNumber: [this.modification.poNumber],
      woNumber: [this.modification.woNumber],
      code: [this.modification.code],
    });
    this.modification.attachments.forEach((a) => {
      const attachment = this.masterSvc.fb().group({
        rate: [a.rate, Validators.required],
        length: [a.length, [Validators.required, Validators.min(1)]],
        width: [a.width, [Validators.required, Validators.min(1)]],
        height: [a.height, [Validators.required, Validators.min(1)]],
        level: [a.level, [Validators.nullValidator]],
        breakdown: [a.breakdown, [Validators.nullValidator]],
        total: [a.total],
      });
      this.attachmentsForms.push(attachment);
    });
    this.modification.boards.forEach((b) => {
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
    this.modification.labour.forEach((l) => {
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
    this.modification.additionals.forEach((add) => {
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
      customer: [this.modification.customer, Validators.required],
      message: [
        // eslint-disable-next-line max-len
        'We thank you for your scaffolding enquiry as per the Scope of Work detailed below. We attach herewith our modification for your perusal.',
        Validators.required,
      ],
      siteName: [this.modification.siteName, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      discountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      scaffold: this.masterSvc.fb().group({
        rate: ['', Validators.nullValidator],
        length: [this.scaffold.scaffold.length, [, Validators.min(1)]],
        width: [this.scaffold.scaffold.width, [, Validators.min(1)]],
        height: [this.scaffold.scaffold.height, [, Validators.min(1)]],
        level: [0, [Validators.nullValidator]],
        breakdown: [
          { dismantle: [], erection: [] },
          [Validators.nullValidator],
        ],
        total: [0],
      }),
      hire: this.masterSvc.fb().group({
        rate: [''],
        daysStanding: ['', [Validators.min(1)]],
        total: [0],
      }),
      boards: this.masterSvc.fb().array([]),
      attachments: this.masterSvc.fb().array([]),
      additionals: this.masterSvc.fb().array([]),
      broker: [''],
      poNumber: [''],
      woNumber: [''],
      labour: this.masterSvc.fb().array([]),
    });
    this.scaffold.attachments.forEach((a) => {
      const attachment = this.masterSvc.fb().group({
        rate: ['', Validators.nullValidator],
        length: [a.length, [Validators.required, Validators.min(1)]],
        width: [a.width, [Validators.required, Validators.min(1)]],
        height: [a.height, [Validators.required, Validators.min(1)]],
        level: [a.level, [Validators.nullValidator]],
        breakdown: [
          { dismantle: [], erection: [] },
          [Validators.nullValidator],
        ],
        total: [0],
      });
      this.attachmentsForms.push(attachment);
    });
    this.scaffold.boards.forEach((b) => {
      const board = this.masterSvc.fb().group({
        rate: ['', Validators.nullValidator],
        length: [b.length, [Validators.required, Validators.min(1)]],
        width: [b.width, [Validators.required, Validators.min(1)]],
        height: [b.height, [Validators.required, Validators.min(1)]],
        qty: [b.qty, [Validators.required, Validators.min(1)]],
        total: [0],
      });
      this.boardForms.push(board);
    });
  }
  // END: Form Init
}
