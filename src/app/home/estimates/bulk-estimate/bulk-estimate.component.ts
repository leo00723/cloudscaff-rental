import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonTextarea } from '@ionic/angular';
import { increment } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Transport } from 'src/app/models/transport.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { AcceptBulkEstimateComponent } from './accept-bulk-estimate/accept-bulk-estimate.component';
import { Comment } from 'src/app/models/estimate.model';
import cloneDeep from 'lodash/cloneDeep';
import { MultiuploaderComponent } from 'src/app/components/multiuploader/multiuploader.component';

@Component({
  selector: 'app-bulk-estimate',
  templateUrl: './bulk-estimate.component.html',
  styles: [],
})
export class BulkEstimateComponent implements OnInit {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() enquiryId = '';
  @Input() siteName: string;
  @Input() customer: Customer;
  @Input() set value(val: BulkEstimate) {
    if (val) {
      Object.assign(this.bulkEstimate, val);
      this.initEditForm();
    }
  }
  @Input() isEdit = false;
  @ViewChild('message') message: IonTextarea;
  bulkEstimate: BulkEstimate = {
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
    status: 'pending',
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
    type: '',
    excludeVAT: false,
    uploads: [],
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
  addingComment = false;
  active = 'overview';
  activeScaffold = 1;
  show = '';
  newComment = '';

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  addScaffold() {
    this.bulkEstimate.estimates.push({
      additionals: [],
      attachments: [],
      boards: [],
      broker: {},
      code: '',
      company: {},
      customer: {},
      date: '',
      discount: 0,
      discountPercentage: 0,
      endDate: '',
      hire: {
        rate: '',
        daysStanding: 0,
        total: 0,
        isWeeks: false,
      },
      id: '',
      labour: [],
      transport: [],
      transportProfile: [],
      message: '',
      scaffold: {
        rate: '',
        description: '',
        length: '0',
        width: '0',
        height: '0',
        lifts: 1,
        extraHirePercentage: 0,
        extraHire: 0,
        level: 0,
        total: 0,
        hireRate: '',
        daysStanding: 0,
        hireTotal: 0,
        isWeeks: false,
      },
      siteName: '',
      startDate: '',
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
    });
  }

  duplicateScaffold(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const estimate = { ...this.bulkEstimate.estimates[i] };
      this.bulkEstimate.estimates.push(estimate);
      this.activeScaffold = this.bulkEstimate.estimates.length;
    }, `Are you sure you want to duplicate scaffold ${i + 1}?`);
  }
  deleteScaffold(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.bulkEstimate.estimates.splice(i, 1);
      if (i === 0) {
        this.activeScaffold = 0;
        setTimeout(() => {
          this.activeScaffold = 1;
        }, 200);
      } else {
        this.activeScaffold--;
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
    this.activeScaffold = +ev.detail.value;
  }

  //create the estimate
  createEstimate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateEstimateTotal();
        this.bulkEstimate.enquiryId = this.enquiryId;
        this.bulkEstimate.type = 'bulk-measured';
        this.bulkEstimate.addedToPA = false;
        await this.upload();
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.bulkEstimate.company.id}/bulkEstimates`,
            this.bulkEstimate
          );
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalBulkEstimates: increment(1),
        });
        if (this.bulkEstimate.enquiryId.length > 0) {
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.bulkEstimate.company.id}/enquiries`,
              this.bulkEstimate.enquiryId,
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
  updateEstimate(status: 'pending' | 'accepted' | 'rejected' | 'revised') {
    this.bulkEstimate.type = 'bulk-measured';
    if (status === 'accepted') {
      this.startAcceptance();
    } else {
      this.masterSvc.notification().presentAlertConfirm(async () => {
        this.loading = true;
        this.updateEstimateTotal();
        this.bulkEstimate.status = status;
        await this.upload();
        this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/bulkEstimates`,
            this.bulkEstimate.id,
            this.bulkEstimate
          )
          .then(async () => {
            if (
              status === 'rejected' &&
              this.bulkEstimate.enquiryId.length > 0
            ) {
              await this.masterSvc
                .edit()
                .updateDoc(
                  `company/${this.bulkEstimate.company.id}/enquiries`,
                  this.bulkEstimate.enquiryId,
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

  createRevision() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateEstimateTotal();
        this.bulkEstimate.status = 'revised';
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/bulkEstimates`,
            this.bulkEstimate.id,
            this.bulkEstimate
          );
        this.bulkEstimate.status = 'pending';
        this.bulkEstimate.enquiryId = this.enquiryId;
        if (this.bulkEstimate.revision) {
          this.bulkEstimate.revision++;
          this.bulkEstimate.code =
            this.bulkEstimate.code.split('-')[0] +
            '-R' +
            this.bulkEstimate.revision;
        } else {
          this.bulkEstimate.code = this.bulkEstimate.code + '-R1';
          this.bulkEstimate.revision = 1;
        }
        this.bulkEstimate.id = '';
        this.bulkEstimate.type = 'bulk-measured';
        this.bulkEstimate.addedToPA = false;
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.bulkEstimate.company.id}/bulkEstimates`,
            this.bulkEstimate
          );

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

  excludeVAT(args) {
    this.field('excludeVAT').setValue(args.detail.checked);
    this.updateEstimateTotal();
  }

  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.bulkEstimate.uploads.push(...newFiles);
  }

  async addComment() {
    this.addingComment = true;
    const comment: Comment = {
      image: this.user.image ? this.user.image : 'assets/icons/user.svg',
      message: this.newComment,
      date: new Date(),
      name: this.user.name,
    };
    const comments = this.bulkEstimate.comments
      ? this.bulkEstimate.comments
      : [];
    comments.push(comment);
    try {
      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.bulkEstimate.company.id}/bulkEstimates`,
          this.bulkEstimate.id,
          {
            comments,
          }
        );
      this.bulkEstimate.comments = comments;
      if (this.bulkEstimate.enquiryId.length > 0) {
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.bulkEstimate.company.id}/enquiries`,
            this.bulkEstimate.enquiryId,
            {
              status: 'estimate created',
              estimate: this.bulkEstimate,
              type: 'bulk',
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

  //start the acceptance process
  private async startAcceptance() {
    const modal = await this.masterSvc.modal().create({
      component: AcceptBulkEstimateComponent,
      componentProps: {
        company: this.company,
        user: this.user,
        bulkEstimate: this.bulkEstimate,
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
      this.bulkEstimate.status !== 'pending' &&
      this.bulkEstimate.status !== 'revised'
    ) {
      return;
    }
    let subtotal = 0;
    let extraHire = 0;
    this.bulkEstimate.estimates.forEach((e) => {
      subtotal += e.subtotal;
      extraHire += e.extraHire;
    });

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
      .generateDocCode(this.company.totalBulkEstimates, 'BEST');

    let estimateCopy = cloneDeep(this.bulkEstimate);
    estimateCopy = Object.assign(estimateCopy, {
      ...this.form.value,
      date: this.isEdit ? this.bulkEstimate.date : new Date(),
      company: this.company,
      code: this.isEdit ? this.bulkEstimate.code : code,
      status: this.isEdit ? this.bulkEstimate.status : 'pending',
      subtotal,
      discount,
      tax,
      vat,
      total,
      extraHire,
      createdBy: this.isEdit ? this.bulkEstimate.createdBy : this.user.id,
      updatedBy: this.user.id,
    });
    estimateCopy.estimates.forEach((e) => {
      e.customer = this.bulkEstimate.customer;
      e.startDate = this.bulkEstimate.startDate;
      e.endDate = this.bulkEstimate.endDate;
      e.discountPercentage = this.bulkEstimate.discountPercentage;
      e.message = this.bulkEstimate.message;
    });
    this.bulkEstimate = cloneDeep(estimateCopy);
  }

  // END: Calculations

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      customer: [this.bulkEstimate.customer, Validators.required],
      message: [this.bulkEstimate.message],
      siteName: [this.bulkEstimate.siteName, Validators.required],
      startDate: [this.bulkEstimate.startDate, Validators.nullValidator],
      endDate: [this.bulkEstimate.endDate, Validators.nullValidator],
      discountPercentage: [
        this.bulkEstimate.discountPercentage,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      poNumber: [this.bulkEstimate.poNumber],
      woNumber: [this.bulkEstimate.woNumber],
      code: [this.bulkEstimate.code],
      excludeVAT: [this.bulkEstimate.excludeVAT],
    });

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
      poNumber: [''],
      woNumber: [''],
      excludeVAT: [false],
    });
    this.addScaffold();
  }
}
