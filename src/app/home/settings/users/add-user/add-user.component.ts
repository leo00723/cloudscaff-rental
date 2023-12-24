import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
})
export class AddUserComponent {
  @Input() title = 'Add User';
  @Select() user$: Observable<User>;
  @Input() isCreate = true;
  @Input() isEdit: boolean;
  @Input() user: User;
  @Output() updated = new EventEmitter<boolean>();
  @Input() set value(user: User) {
    this.user = user;
    this.form = this.masterSvc.fb().group({
      email: [this.user.email],
      name: [this.user.name],
      phone: [this.user.phone],
      role: [this.user.role, [Validators.required]],
    });
  }
  form: FormGroup;
  loading = false;

  constructor(private masterSvc: MasterService) {
    if (this.isCreate) {
      this.form = this.masterSvc.fb().group({
        email: ['', [Validators.required, Validators.email]],
        role: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    }
  }

  async update() {
    this.loading = true;
    const user = { ...this.user, ...this.form.value };
    try {
      await this.masterSvc.edit().updateDoc('users', this.user.id, user);
      this.updated.emit(true);
      this.masterSvc
        .notification()
        .toast('User updated successfully', 'success');
      this.loading = false;
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong updating a user. Please try again!',
          'danger'
        );
      this.loading = false;
    }
  }

  create() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        const company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company).id;
        const user = {
          ...this.form.value,
          company,
        };
        const res = await this.masterSvc.edit().callFunction('addUser', user);
        if (res.data === '200') {
          this.masterSvc
            .notification()
            .toast('User created successfully', 'success');
          this.form.reset();
        } else {
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong creating your user. Please try again!',
              'danger'
            );
        }
        this.loading = !this.loading;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your user. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  delete() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        const res = await this.masterSvc
          .edit()
          .callFunction('deleteUser', { id: this.user.id });
        if (res.data === '200') {
          this.masterSvc
            .notification()
            .toast('User deleted successfully', 'success');
          this.close();
        } else {
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong deleting your user. Please try again!',
              'danger'
            );
        }
        this.loading = !this.loading;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong deleting your user. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  setRoles(permissions: any) {
    this.user.permissions = permissions;
    this.user.permissionsList = permissions.map((item) => item.name);
    // console.log(this.user.permissionsList);
  }
  setPermission(permission) {
    console.log(permission);
  }

  close() {
    this.masterSvc.modal().dismiss(undefined, 'close', 'editUser');
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  checkStatus(field: FormControl) {
    return field.invalid && !field.pristine;
  }
}
