import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Company } from '../models/company.model';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-add-estimate',
  templateUrl: './add-estimate.page.html',
  styleUrls: ['./add-estimate.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEstimatePage implements OnInit {
  company$: Observable<Company>;
  customers$: Observable<any[]>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  constructor(private masterSvc: MasterService, private fb: FormBuilder) {
    this.company$ = this.masterSvc.auth().company$;
    this.customers$ = this.masterSvc.auth().user$.pipe(
      switchMap((user) => {
        if (user) {
          return this.masterSvc.edit().getCustomers(user.company);
        } else {
          return of(false);
        }
      })
    ) as Observable<any[]>;
  }

  ngOnInit() {
    this.initFrom();
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  private initFrom() {
    this.form = this.fb.group({
      customer: ['', Validators.required],
      message: [
        // eslint-disable-next-line max-len
        'We thank you for your scaffolding enquiry as per the Scope of Work detailed below. We attach herewith our estimate for your perusal.',
        Validators.required,
      ],
      siteName: ['', Validators.required],
    });
  }
}
