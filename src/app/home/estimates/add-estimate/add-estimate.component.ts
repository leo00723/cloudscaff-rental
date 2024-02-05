import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { IonTextarea } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Comment, Estimate } from 'src/app/models/estimate.model';
import { Transport } from 'src/app/models/transport.model';
import { User } from 'src/app/models/user.model';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MasterService } from '../../../services/master.service';
import { AcceptEstimateComponent } from './accept-estimate/accept-estimate.component';
import cloneDeep from 'lodash/cloneDeep';
import { MultiuploaderComponent } from 'src/app/components/multiuploader/multiuploader.component';

@Component({
  selector: 'app-add-estimate',
  templateUrl: './add-estimate.component.html',
})
export class AddEstimatePage implements OnInit {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() enquiryId = '';
  @Input() siteName: string;
  @Input() customer: Customer;
  @Input() set value(val: Estimate) {
    if (val) {
      Object.assign(this.estimate, val);
      this.initEditForm();
    }
  }
  @Input() isEdit = false;
  @ViewChild('message') message: IonTextarea;
  estimate: Estimate = {
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
    status: 'pending',
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
    budget: {},
    enquiryId: '',
    excludeVAT: false,
    uploads: [],
  };
  user: User;
  company: Company;
  customers$: Observable<Customer[]>;
  rates$: Observable<any>;
  types$: Observable<any>;
  brokers$: Observable<any>;
  transport$: Observable<Transport[]>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  addingComment = false;
  active = 'overview';
  show = '';
  newComment = '';
  private subs = new Subscription();
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  ngOnInit() {
    this.customers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/customers`);
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

    if (this.isEdit) {
      this.show = 'editCustomer';
    } else {
      this.initFrom();
      this.isLoading = false;
    }
    this.subs.add(
      this.form.valueChanges.subscribe(() => {
        this.findInvalidControls();
      })
    );
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
      boardedLifts: ['', [Validators.nullValidator]],
      daysStanding: [''],
      description: ['', Validators.nullValidator],
      extraHire: ['', [Validators.nullValidator]],
      extraHirePercentage: ['', [Validators.nullValidator]],
      height: ['', [Validators.required, Validators.min(1)]],
      hireRate: [''],
      hireTotal: [0],
      isWeeks: ['', Validators.nullValidator],
      length: ['', [Validators.required, Validators.min(1)]],
      level: [''],
      lifts: ['', [Validators.nullValidator]],
      rate: ['', Validators.required],
      total: [0],
      type: ['', Validators.nullValidator],
      width: ['', [Validators.required, Validators.min(1)]],
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

  //update the totals for a category
  update(type: string, i?: number) {
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

  //create the estimate
  createEstimate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateEstimateTotal();
        this.estimate.enquiryId = this.enquiryId;
        this.estimate.type = 'measured';
        this.estimate.addedToPA = false;
        await this.upload();

        const estimate = await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.estimate.company.id}/estimates`,
            this.estimate
          );
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalEstimates: increment(1),
        });
        this.estimate.id = estimate.id;
        if (this.estimate.enquiryId.length > 0) {
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.estimate.company.id}/enquiries`,
              this.estimate.enquiryId,
              {
                status: 'estimate created',
                estimate: this.estimate,
                type: 'standard',
              }
            );
        }
        this.masterSvc
          .notification()
          .toast('Estimate created successfully!', 'success');
        this.close();
      } catch (error) {
        this.loading = false;
        this.masterSvc.log(error);
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
  updateEstimate(status: 'pending' | 'accepted' | 'rejected' | 'revised') {
    this.estimate.type = 'measured';
    if (status === 'accepted') {
      this.startAcceptance();
    } else {
      this.masterSvc.notification().presentAlertConfirm(async () => {
        this.loading = true;
        this.updateEstimateTotal();
        this.estimate.status = status;
        await this.upload();
        this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/estimates`,
            this.estimate.id,
            this.estimate
          )
          .then(async () => {
            if (this.estimate.enquiryId.length > 0) {
              await this.masterSvc
                .edit()
                .updateDoc(
                  `company/${this.estimate.company.id}/enquiries`,
                  this.estimate.enquiryId,
                  {
                    status:
                      status === 'rejected' ? 'rejected' : 'estimate created',
                    estimate: this.estimate,
                    type: 'standard',
                  }
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

  createRevision() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateEstimateTotal();
        this.estimate.status = 'revised';
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/estimates`,
            this.estimate.id,
            this.estimate
          );
        this.estimate.status = 'pending';
        this.estimate.enquiryId = this.enquiryId;
        if (this.estimate.revision) {
          this.estimate.revision++;
          this.estimate.code =
            this.estimate.code.split('-')[0] + '-R' + this.estimate.revision;
        } else {
          this.estimate.code = this.estimate.code + '-R1';
          this.estimate.revision = 1;
        }
        this.estimate.id = '';
        this.estimate.type = 'measured';
        this.estimate.addedToPA = false;
        const revision = await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.estimate.company.id}/estimates`,
            this.estimate
          );
        this.estimate.id = revision.id;
        if (this.estimate.enquiryId.length > 0) {
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.estimate.company.id}/enquiries`,
              this.estimate.enquiryId,
              {
                status: 'revision created',
                estimate: this.estimate,
                type: 'standard',
              }
            );
        }
        this.masterSvc
          .notification()
          .toast('Revision created successfully!', 'success');
        this.close();
      } catch (error) {
        this.loading = false;
        this.masterSvc.log(error);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your revision, try again!',
            'danger',
            2000
          );
      }
    });
  }
  deleteEstimate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.masterSvc.notification().presentAlertConfirm(
        async () => {
          this.masterSvc.notification().presentAlertConfirm(
            async () => {
              try {
                this.loading = true;
                await this.masterSvc
                  .edit()
                  .deleteDocById(
                    `company/${this.estimate.company.id}/estimates`,
                    this.estimate.id
                  );
                this.masterSvc
                  .notification()
                  .toast('Estimate deleted successfully!', 'success');
                this.close();
              } catch (error) {
                this.loading = false;
                this.masterSvc.log(error);
                this.masterSvc
                  .notification()
                  .toast(
                    'Something went wrong deleting your estimate, try again!',
                    'danger',
                    2000
                  );
              }
            },
            'Are you 200% sure?',
            'Okay here we go...'
          );
        },
        'Are you 100% sure?',
        'This cannot be undone!'
      );
    });
  }

  excludeVAT(args) {
    this.field('excludeVAT').setValue(args.detail.checked);
    this.updateEstimateTotal();
  }

  async addComment() {
    this.addingComment = true;
    const comment: Comment = {
      image: this.user.image ? this.user.image : 'assets/icons/user.svg',
      message: this.newComment,
      date: new Date(),
      name: this.user.name,
    };
    const comments = this.estimate.comments ? this.estimate.comments : [];
    comments.push(comment);
    try {
      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.estimate.company.id}/estimates`,
          this.estimate.id,
          {
            comments,
          }
        );
      this.estimate.comments = comments;
      if (this.estimate.enquiryId.length > 0) {
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.estimate.company.id}/enquiries`,
            this.estimate.enquiryId,
            {
              status: 'estimate created',
              estimate: this.estimate,
              type: 'standard',
            }
          );
      }
      this.masterSvc
        .notification()
        .toast('Comment added successfully!', 'success');
      this.newComment = '';
      this.addingComment = false;
    } catch (error) {
      console.error(error);
      this.addingComment = false;
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong adding comment, try again!',
          'danger',
          2000
        );
    }
  }

  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.estimate.uploads.push(...newFiles);
  }

  //start the acceptance process
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
      cssClass: 'fullscreen',
    });
    return await modal.present();
  }

  //update the estimate total
  private updateEstimateTotal() {
    if (
      this.estimate.status !== 'pending' &&
      this.estimate.status !== 'revised'
    ) {
      console.log(this.estimate.status);
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
    let tax = 0;
    let vat = 0;
    let total = 0;
    if (
      this.field('excludeVAT').value ||
      this.field('customer').value.excludeVAT
    ) {
      total = totalAfterDiscount + tax + vat;
    } else {
      tax = totalAfterDiscount * (this.company.salesTax / 100);
      vat = totalAfterDiscount * (this.company.vat / 100);
      total = totalAfterDiscount + tax + vat;
    }

    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    const code = this.masterSvc
      .edit()
      .generateDocCode(this.company.totalEstimates, 'EST');

    let estimateCopy = cloneDeep(this.estimate);
    estimateCopy = Object.assign(estimateCopy, {
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
        gst: this.company.gst,
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
    this.estimate = cloneDeep(estimateCopy);
  }
  // START: Functions to initialise the form
  private initEditForm() {
    const scaffoldFormGroup = this.masterSvc.fb().group({
      type: [this.estimate.scaffold.type || '', Validators.nullValidator],
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
      lifts: [this.estimate.scaffold.lifts, Validators.nullValidator],
      boardedLifts: [
        this.estimate.scaffold.boardedLifts,
        Validators.nullValidator,
      ],
      extraHirePercentage: [
        this.estimate.scaffold.extraHirePercentage,
        Validators.nullValidator,
      ],
      extraHire: [this.estimate.scaffold.extraHire, Validators.nullValidator],
      level: [0],
      total: [this.estimate.scaffold.total],
      hireRate: [this.estimate.scaffold.hireRate || ''],
      daysStanding: [this.estimate.scaffold.daysStanding || ''],
      hireTotal: [this.estimate.scaffold.hireTotal || 0],
      isWeeks: [this.estimate.scaffold.isWeeks || '', Validators.nullValidator],
    });

    const hireFormGroup = this.masterSvc.fb().group({
      rate: [this.estimate.hire.rate],
      daysStanding: [this.estimate.hire.daysStanding],
      total: [this.estimate.hire.total],
      isWeeks: [this.estimate.hire.isWeeks, Validators.nullValidator],
    });

    const formArray = {
      boards: this.masterSvc.fb().array([]),
      additionals: this.masterSvc.fb().array([]),
      attachments: this.masterSvc.fb().array([]),
      labour: this.masterSvc.fb().array([]),
      transport: this.masterSvc.fb().array([]),
    };

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
      scaffold: scaffoldFormGroup,
      hire: hireFormGroup,
      broker: [this.estimate.broker],
      transportProfile: [
        this.estimate.transportProfile || '',
        Validators.nullValidator,
      ],
      poNumber: [this.estimate.poNumber],
      woNumber: [this.estimate.woNumber],
      excludeVAT: [this.estimate.excludeVAT],
      code: [this.estimate.code],
      ...formArray,
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
    this.findInvalidControls();
    this.isLoading = false;
  }
  private initFrom() {
    if (this.customer) {
      this.show = 'editCustomer';
    }
    this.form = this.masterSvc.fb().group({
      customer: [this.customer || '', Validators.required],
      message: [
        // eslint-disable-next-line max-len
        'We thank you for your scaffolding enquiry as per the Scope of Work detailed below. We attach herewith our estimate for your perusal.',
        Validators.required,
      ],
      siteName: [this.siteName || '', Validators.required],
      startDate: ['', Validators.nullValidator],
      endDate: ['', Validators.nullValidator],
      discountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      scaffold: this.masterSvc.fb().group({
        rate: ['', Validators.required],
        type: ['', Validators.nullValidator],
        description: ['', Validators.nullValidator],
        length: ['', [Validators.required, Validators.min(1)]],
        width: ['', [Validators.required, Validators.min(1)]],
        height: ['', [Validators.required, Validators.min(1)]],
        lifts: ['', [Validators.nullValidator]],
        boardedLifts: ['', [Validators.nullValidator]],
        extraHirePercentage: ['', [Validators.nullValidator]],
        extraHire: ['', [Validators.nullValidator]],
        level: [0],
        total: [0],
        hireRate: [''],
        daysStanding: ['', [Validators.min(1)]],
        hireTotal: [0],
        isWeeks: ['', Validators.nullValidator],
      }),
      attachments: this.masterSvc.fb().array([]),
      hire: this.masterSvc.fb().group({
        rate: [''],
        daysStanding: [''],
        total: [0],
        isWeeks: ['', Validators.nullValidator],
      }),
      boards: this.masterSvc.fb().array([]),
      additionals: this.masterSvc.fb().array([]),
      broker: [''],
      transportProfile: [''],
      poNumber: [''],
      woNumber: [''],
      excludeVAT: [false],
      labour: this.masterSvc.fb().array([]),
      transport: this.masterSvc.fb().array([]),
    });
  }
  public findInvalidControls() {
    const invalid = [];
    const controls = this.form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(`${name} is invalid`);
        controls[name].markAllAsTouched();
      }
    }
    return invalid;
  }
}
