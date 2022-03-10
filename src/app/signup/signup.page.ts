import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
})
export class SignupPage implements OnInit {
  error = false;
  loading = false;
  errorMessage = 'Something went wrong.Please try again later.';
  form: FormGroup;
  constructor(private masterSvc: MasterService, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      company: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  async create() {
    try {
      this.error = false;
      this.loading = true;
      const data = this.form.value;
      const res = await this.masterSvc
        .edit()
        .callFunction('regiserCompany', data);
      if (res.data === '200') {
        this.masterSvc
          .notification()
          .toast('Account created successfully', 'success');
        this.masterSvc.auth().login(data);
        this.form.reset();
        this.loading = !this.loading;
      } else {
        this.loading = !this.loading;
        this.errorMessage =
          'Something went wrong creating your account please try again later.';
        this.error = true;
      }
    } catch (error) {
      this.loading = !this.loading;
      this.errorMessage = error;
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
