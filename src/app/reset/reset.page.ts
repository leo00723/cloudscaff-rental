import { Component, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MasterService } from '../services/master.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.page.html',
})
export class ResetPage implements OnDestroy {
  error = false;
  loading = false;
  errorMessage = 'Something went wrong.Please try again later.';
  form: FormGroup;
  page = 0;
  code = '';
  private sub = new Subscription();
  constructor(
    private masterSvc: MasterService,
    private fb: FormBuilder,
    private active: ActivatedRoute
  ) {
    this.sub = this.active.queryParams.subscribe((data) => {
      if (data.mode !== 'resetPassword')
        this.masterSvc.store().dispatch(new Navigate('/login'));
      this.code = data.oobCode;
    });
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm: ['', [Validators.required, Validators.minLength(6)]],
      },
      { validators: this.checkPasswords, updateOn: 'change' }
    );
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  checkPasswords: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    let pass = group.get('password').value;
    let confirmPass = group.get('confirm').value;

    return pass === confirmPass ? null : { notSame: true };
  };

  async reset() {
    try {
      this.error = false;
      this.loading = true;
      await this.masterSvc
        .auth()
        .newPassword(this.code, this.form.get('password').value);
      this.page = 1;
      this.form.reset();
      this.loading = !this.loading;
    } catch (error) {
      this.loading = !this.loading;
      this.error = true;
    }
  }
}
