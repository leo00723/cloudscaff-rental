import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
})
export class ForgotPage implements OnInit {
  error = false;
  loading = false;
  errorMessage = 'Something went wrong.Please try again later.';
  form: FormGroup;
  page = 0;
  email = '';
  constructor(private masterSvc: MasterService, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {}

  async reset() {
    try {
      this.error = false;
      this.loading = true;
      this.email = this.field('email').value;
      await this.masterSvc.auth().resetPassword(this.email);
      this.page = 1;
      this.form.reset();
      this.loading = !this.loading;
    } catch (error) {
      this.loading = !this.loading;
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = `Seems like you dont have an account. Please contact your administrator.`;
      }
      this.error = true;
    }
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  checkStatus(field: FormControl) {
    return field.invalid && !field.pristine;
  }
}
