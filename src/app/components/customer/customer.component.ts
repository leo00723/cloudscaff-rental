/* eslint-disable @typescript-eslint/naming-convention */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Address } from 'src/app/models/address.model';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
})
export class CustomerComponent {
  private static readonly MESSAGES = {
    SUCCESS: {
      CREATE: 'Customer added successfully!',
      UPDATE: 'Customer updated successfully!',
      DELETE: 'Customer deleted successfully!',
      UPLOAD: 'Files uploaded successfully',
      REMOVE_UPLOAD: 'Files deleted successfully',
    },
    ERROR: {
      CREATE: 'Something went wrong creating your customer, try again!',
      UPDATE: 'Something went wrong updating your customer, try again!',
      DELETE: 'Something went wrong deleting your customer, try again!',
      UPLOAD: 'Something went wrong uploading files. Please try again.',
      REMOVE_UPLOAD: 'Something went wrong deleting file. Please try again.',
    },
  };

  protected customerData: Customer = { uploads: [] };
  @Output() newCustomer = new EventEmitter<Customer>();
  @Input() isUpdate = false;
  @Input() isDelete = false;
  @Input() isCreate = true;
  @Input() readOnly = false;
  @Input() companyId: string;

  @Input() set customer(val: Customer) {
    Object.assign(this.customerData, val);
    if (this.form && val) {
      this.form = this.createCustomerForm(this.customerData);
      this.populateRepsFormArray();
    }
  }

  form: FormGroup;
  loading = false;
  protected user: User;
  protected company: Company;

  constructor(private masterSvc: MasterService) {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.form = this.createCustomerForm();
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  private createCustomerForm(customerData?: Customer): FormGroup {
    return this.masterSvc.fb().group({
      code: [customerData?.code || '', Validators.required],
      name: [customerData?.name || '', Validators.required],
      tradingName: [customerData?.tradingName || '', Validators.required],
      email: [
        customerData?.email || '',
        [Validators.required, Validators.email],
      ],
      rep: [customerData?.rep || '', Validators.required],
      phone: [customerData?.phone || '', Validators.required],
      officeRep: [customerData?.officeRep || ''],
      officeEmail: [customerData?.officeEmail || ''],
      officePhone: [customerData?.officePhone || ''],
      websiteUrl: [customerData?.websiteUrl || ''],
      address: [customerData?.address || ''],
      suburb: [customerData?.suburb || ''],
      city: [customerData?.city || ''],
      zip: [customerData?.zip || ''],
      abnNumber: [customerData?.abnNumber || ''],
      vatNum: [customerData?.vatNum || ''],
      country: [customerData?.country || ''],
      xeroID: [customerData?.xeroID || ''],
      excludeVAT: [customerData?.excludeVAT || ''],
      discountPercentage: [customerData?.discountPercentage || 0],
      minHire: [customerData?.minHire || 28],
      poRequired: [customerData?.poRequired || ''],
      reps: this.masterSvc.fb().array([]),
    });
  }

  private populateRepsFormArray(): void {
    const repsArray = this.repForms;
    repsArray.clear();
    this.customerData?.reps?.forEach((rep) => {
      const repGroup = this.createRepFormGroup(rep);
      repsArray.push(repGroup);
    });
  }

  private createRepFormGroup(rep?: any): FormGroup {
    return this.masterSvc.fb().group({
      name: [rep?.name || ''],
      phone: [rep?.phone || ''],
      email: [rep?.email || ''],
    });
  }

  private getCustomerCollectionPath(): string {
    return `company/${this.customerData.company || this.companyId}/customers`;
  }

  private async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
    onSuccess?: (result: T) => void
  ): Promise<void> {
    try {
      this.loading = true;
      const result = await operation();
      this.masterSvc.notification().toast(successMessage, 'success');
      onSuccess?.(result);
    } catch (error) {
      console.error(error);
      this.masterSvc.notification().toast(errorMessage, 'danger', 2000);
    } finally {
      this.loading = false;
    }
  }

  get repForms(): FormArray {
    return this.form.get('reps') as FormArray;
  }

  addRep(): void {
    const repGroup = this.createRepFormGroup({ name: 'Accounts' });
    this.repForms.push(repGroup);
  }

  deleteRep(index: number): void {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.repForms.removeAt(index);
    });
  }

  field(fieldName: string): FormControl {
    return this.form.get(fieldName) as FormControl;
  }

  checkStatus(field: FormControl): boolean {
    return field.invalid && field.touched;
  }

  create(): void {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.customerData.company = this.companyId;
      Object.assign(this.customerData, this.form.value);
      this.customerData.selected = false;

      this.handleAsyncOperation(
        () =>
          this.masterSvc
            .edit()
            .addDocument(this.getCustomerCollectionPath(), this.customerData),
        CustomerComponent.MESSAGES.SUCCESS.CREATE,
        CustomerComponent.MESSAGES.ERROR.CREATE,
        (data) => {
          this.newCustomer.emit({ ...this.customerData, id: data.id });
          this.form.reset();
        }
      );
    });
  }

  update(): void {
    this.masterSvc.notification().presentAlertConfirm(() => {
      Object.assign(this.customerData, this.form.value);
      this.customerData.selected = false;

      this.handleAsyncOperation(
        () =>
          this.masterSvc
            .edit()
            .updateDoc(
              this.getCustomerCollectionPath(),
              this.customerData.id,
              this.customerData
            ),
        CustomerComponent.MESSAGES.SUCCESS.UPDATE,
        CustomerComponent.MESSAGES.ERROR.UPDATE
      );
    });
  }

  delete(): void {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.handleAsyncOperation(
        () =>
          this.masterSvc
            .edit()
            .deleteDocById(
              this.getCustomerCollectionPath(),
              this.customerData.id
            ),
        CustomerComponent.MESSAGES.SUCCESS.DELETE,
        CustomerComponent.MESSAGES.ERROR.DELETE,
        () => this.form.reset()
      );
    });
  }

  async setUploads(uploads: any[]): Promise<void> {
    this.customerData?.uploads
      ? this.customerData.uploads.push(...uploads)
      : (this.customerData.uploads = [...uploads]);

    await this.handleAsyncOperation(
      () =>
        this.masterSvc
          .edit()
          .updateDoc(this.getCustomerCollectionPath(), this.customerData.id, {
            uploads: this.customerData?.uploads,
          }),
      CustomerComponent.MESSAGES.SUCCESS.UPLOAD,
      CustomerComponent.MESSAGES.ERROR.UPLOAD
    );
  }

  async removeUpload(index: number): Promise<void> {
    this.customerData?.uploads.splice(index, 1);

    await this.handleAsyncOperation(
      () =>
        this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/customers`,
            this.customerData.id,
            { uploads: this.customerData?.uploads }
          ),
      CustomerComponent.MESSAGES.SUCCESS.REMOVE_UPLOAD,
      CustomerComponent.MESSAGES.ERROR.REMOVE_UPLOAD
    );
  }

  excludeVAT(args: any): void {
    this.field('excludeVAT').setValue(args.detail.checked);
  }

  poRequired(args: any): void {
    this.field('poRequired').setValue(args.detail.checked);
  }

  updateAddress(address: Address): void {
    this.form.patchValue(address);
  }
}
