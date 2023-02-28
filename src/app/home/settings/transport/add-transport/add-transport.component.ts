import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Company } from 'src/app/models/company.model';
import { Transport } from 'src/app/models/transport.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-transport',
  templateUrl: './add-transport.component.html',
  styles: [],
})
export class AddTransportComponent implements OnInit {
  @Input() set value(val: Transport) {
    if (val) {
      Object.assign(this.transport, val);
      this.initEditForm();
    }
  }
  @Input() isEdit = false;
  @Input() isDelete = false;
  transport: Transport = {};
  form: FormGroup;
  user: User;
  company: Company;
  loading = false;
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  get typesForms() {
    return this.form.get('types') as FormArray;
  }
  addType() {
    const type = this.masterSvc.fb().group({
      name: ['', Validators.required],
      rate: ['', [Validators.required, Validators.min(1)]],
      maxLoad: ['', [Validators.required, Validators.min(1)]],
    });
    this.typesForms.push(type);
  }
  deleteType(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.typesForms.removeAt(i);
    });
  }
  ngOnInit(): void {
    if (!this.isEdit) {
      this.initForm();
    }
  }

  close() {
    this.masterSvc.modal().dismiss();
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  createTransport() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const transport: Transport = { ...this.form.value };

        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/transport`, transport);

        this.masterSvc
          .notification()
          .toast('Transport profile created successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating transport profile. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }
  updateTransport() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        Object.assign(this.transport, this.form.value);
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/transport`,
            this.transport.id,
            this.transport
          );
        this.masterSvc
          .notification()
          .toast('Transport profile updated successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating transport profile. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }
  removeTransport() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        await this.masterSvc
          .edit()
          .deleteDocById(
            `company/${this.company.id}/transport`,
            this.transport.id
          );
        this.masterSvc
          .notification()
          .toast('Transport profile deleted successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong deleting transport profile. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      name: [this.transport.name, Validators.required],
      types: this.masterSvc.fb().array(
        this.transport.types.map((type) =>
          this.masterSvc.fb().group({
            name: [type.name, Validators.required],
            rate: [type.rate, [Validators.required, Validators.min(1)]],
            maxLoad: [type.maxLoad, [Validators.required, Validators.min(1)]],
          })
        )
      ),
    });
  }
  private initForm() {
    this.form = this.masterSvc.fb().group({
      name: ['', Validators.required],
      types: this.masterSvc.fb().array([]),
    });
    this.addType();
  }
}
