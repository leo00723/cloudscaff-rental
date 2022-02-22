import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
})
export class LoginPage implements OnInit {
  error = false;
  loading = false;
  errorMessage = 'Something went wrong.Please try again later.';
  form: FormGroup;
  constructor(private masterSvc: MasterService, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  login() {
    this.error = false;
    this.loading = true;
    this.masterSvc
      .auth()
      .login(this.field('email').value, this.field('password').value)
      .then(() => {
        this.form.reset();
        this.masterSvc.router().navigate(['/test'], { replaceUrl: true });
        this.loading = !this.loading;
      })
      .catch((error) => {
        this.loading = !this.loading;
        if (error.code === 'auth/user-not-found') {
          this.errorMessage = `Seems like you dont have an account.</br>Please contact your administrator.`;
        } else if (error.code === 'auth/wrong-password') {
          this.errorMessage = `Email address or Password is incorrect.`;
        }
        this.error = true;
      });
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  checkStatus(field: FormControl) {
    return field.invalid && !field.pristine;
  }
}
