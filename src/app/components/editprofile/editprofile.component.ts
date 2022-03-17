import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { SetUser } from 'src/app/shared/user/user.actions';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-editprofile',
  templateUrl: './editprofile.component.html',
})
export class EditprofileComponent implements OnInit {
  @Input() title = 'Edit Profile';
  @Output() updated = new EventEmitter<boolean>();
  @Select() user$: Observable<User>;
  @Select() company$: Observable<Company>;
  user = this.masterSvc.store().selectSnapshot(UserState.user);
  form: FormGroup;
  loading = false;
  constructor(private masterSvc: MasterService) {
    this.form = this.masterSvc.fb().group({
      name: [this.user.name, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]],
      phone: [this.user.phone, Validators.required],
    });
  }

  ngOnInit(): void {}

  async uploadImage(data: any) {
    try {
      await this.masterSvc.edit().updateDoc('users', this.user.id, {
        thumb: data.url1,
        image: data.url2,
        imageRef: data.ref,
      });
      this.user = this.masterSvc.store().selectSnapshot(UserState.user);
      this.masterSvc
        .notification()
        .toast('Image uploaded successfully', 'success');
    } catch (e) {
      console.log(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong uploading your image. Please try again!',
          'danger'
        );
    }
  }

  async update() {
    this.loading = true;
    const user = { ...this.user, ...this.form.value, needsSetup: false };
    try {
      await this.masterSvc.edit().updateDoc('users', this.user.id, user);
      this.updated.emit(true);
      this.masterSvc
        .notification()
        .toast('Profile updated successfully', 'success');
      this.loading = false;
    } catch (e) {
      console.log(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong updating your profile. Please try again!',
          'danger'
        );
      this.loading = false;
    }
  }

  close() {
    this.masterSvc.modal().dismiss(undefined, 'close', 'editProfile');
  }
}
