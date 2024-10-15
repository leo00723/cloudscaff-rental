import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import { Observable, Subscription } from 'rxjs';
import { MultiuploaderComponent } from 'src/app/components/multiuploader/multiuploader.component';
import { Comment } from 'src/app/models/comment.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { User } from 'src/app/models/user.model';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { MasterService } from '../../../services/master.service';
import { AcceptBasicEstimateComponent } from './accept-basic-estimate/accept-basic-estimate.component';

@Component({
  selector: 'app-add-basic-estimate',
  templateUrl: './add-basic-estimate.component.html',
})
export class AddBasicEstimateComponent implements OnInit {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() set value(val: EstimateV2) {
    if (val) {
      this.estimate = cloneDeep(val);
      this.initEditForm();
    }
  }
  @Input() isEdit = false;
  estimate: EstimateV2 = {
    status: 'pending',
    items: [],
    uploads: [],
    comments: [],
  };
  user: User;
  company: Company;
  customers$: Observable<Customer[]>;
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

  // START: FORM CRUD

  get itemForms() {
    return this.form.get('items') as FormArray;
  }

  addItem() {
    const item = this.masterSvc.fb().group({
      code: ['', Validators.nullValidator],
      description: ['', Validators.nullValidator],
      note: ['', Validators.nullValidator],
      rate: [0, Validators.required],
      unit: [''],
      qty: [1, [Validators.required, Validators.min(1)]],
      duration: [1, [Validators.required]],
      total: [0],
    });
    this.itemForms.push(item);
  }

  deleteItem(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.itemForms.removeAt(i);
    });
  }

  // END: FORM CRUD

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

  //event for switching between pages
  segmentChanged(ev: any) {
    if (ev.detail.value === 'summary') {
      this.updateEstimateTotal();
      this.active = ev.detail.value;
    } else {
      this.active = ev.detail.value;
    }
  }

  //create the estimate
  createEstimate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        const id = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company).id;
        this.updateEstimateTotal();
        await this.upload();

        await this.masterSvc
          .edit()
          .addDocument(`company/${id}/estimatesV2`, this.estimate);
        await this.masterSvc.edit().updateDoc('company', id, {
          totalEstimates: increment(1),
        });
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
  updateEstimate(status: 'pending' | 'rejected' | 'revised') {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateEstimateTotal();
        this.estimate.status = status;
        await this.upload();
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/estimatesV2`,
            this.estimate.id,
            this.estimate
          );
        this.masterSvc
          .notification()
          .toast('Estimate updated successfully!', 'success');
      } catch (error) {
        console.error(error);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating your estimate, try again!',
            'danger',
            2000
          );
      } finally {
        this.loading = false;
      }
    });
  }

  //accept estimate
  acceptEstimate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      //start the acceptance process
      const modal = await this.masterSvc.modal().create({
        component: AcceptBasicEstimateComponent,
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
    const comments = this.estimate.comments || [];
    comments.push(comment);
    try {
      await this.masterSvc
        .edit()
        .updateDoc(
          `company/${this.estimate.company.id}/estimatesV2`,
          this.estimate.id,
          {
            comments,
          }
        );
      this.estimate.comments = comments;
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

  protected updateTotal(i) {
    const item = this.itemForms.controls[i];
    item
      .get('total')
      .setValue(
        +item.get('qty').value *
          +item.get('duration').value *
          +item.get('rate').value
      );
  }
  //update the estimate total
  private updateEstimateTotal() {
    if (
      this.estimate.status !== 'pending' &&
      this.estimate.status !== 'revised'
    ) {
      return;
    }

    let subtotal = 0;
    this.arr('items').controls.forEach((item) => {
      subtotal += +item.get('total').value;
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
      .generateDocCode(this.company.totalEstimates, 'EST');

    let estimateCopy = cloneDeep(this.estimate);
    estimateCopy = Object.assign(estimateCopy, {
      ...this.form.value,
      date: this.isEdit ? this.estimate.date : new Date(),
      company: this.company,
      code: this.isEdit ? this.estimate.code : code,
      status: this.isEdit ? this.estimate.status : 'pending',
      subtotal,
      discount,
      tax,
      vat,
      total,
      createdBy: this.user.id,
      createdByName: this.user.name,
    });
    this.estimate = cloneDeep(estimateCopy);
    if (this.estimate.customer) {
      this.estimate.customer.rep = this.estimate?.repName;
      this.estimate.customer.email = this.estimate?.repEmail;
      this.estimate.customer.phone = this.estimate?.repContact;
    }
  }
  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      code: [this.estimate.code],
      siteName: [this.estimate.siteName, Validators.required],
      repName: [this.estimate.repName],
      repEmail: [this.estimate.repEmail],
      repContact: [this.estimate.repContact],
      customer: [this.estimate.customer, Validators.required],
      scope: [this.estimate.scope, Validators.nullValidator],
      note1: [this.estimate.note1, Validators.nullValidator],
      note2: [this.estimate.note2, Validators.nullValidator],
      poNumber: [this.estimate.poNumber, Validators.nullValidator],

      discountPercentage: [
        this.estimate.discountPercentage || 0,
        [Validators.nullValidator, Validators.min(0), Validators.max(100)],
      ],
      items: this.masterSvc.fb().array([]),
      excludeVAT: [this.estimate.excludeVAT || false],
    });

    this.estimate.items.forEach((a) => {
      const item = this.masterSvc.fb().group({
        code: [a.code || ''],
        description: [a.description || '', Validators.nullValidator],
        note: [a.note || '', Validators.nullValidator],
        rate: [a.rate || 0, Validators.required],
        unit: [a.unit || ''],
        qty: [a.qty || 1, [Validators.required, Validators.min(1)]],
        duration: [a.duration || 1, [Validators.required]],
        total: [a.total],
      });
      this.itemForms.push(item);
    });
    this.findInvalidControls();
    this.isLoading = false;
  }
  private initFrom() {
    this.form = this.masterSvc.fb().group({
      code: [''],
      siteName: ['', Validators.required],
      repName: [''],
      repEmail: [''],
      repContact: [''],
      customer: ['', Validators.required],
      scope: ['', Validators.nullValidator],
      note1: ['', Validators.nullValidator],
      note2: ['', Validators.nullValidator],
      poNumber: ['', Validators.nullValidator],
      discountPercentage: [
        0,
        [Validators.nullValidator, Validators.min(0), Validators.max(100)],
      ],
      items: this.masterSvc.fb().array([]),
      excludeVAT: [false],
    });
    this.addItem();
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
}
