import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Company } from '../models/company.model';
import { Currencies } from '../models/currencies.model';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
  styleUrls: ['./company.page.scss'],
})
export class CompanyPage implements OnDestroy {
  company: Company;
  currencies = new Currencies().currencies;
  form: FormGroup;
  loading = false;
  isLoading = true;
  subs = new Subscription();
  constructor(private fb: FormBuilder, private masterSvc: MasterService) {}
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  save() {
    this.loading = true;
    Object.assign(this.company, this.form.value);
    this.masterSvc
      .edit()
      .updateDoc('company', this.company.id, this.company)
      .then(() => {
        this.masterSvc.auth().company$.next(this.company);
        this.masterSvc
          .notification()
          .successToast('Settings saved successfully')
          .then(() => {
            this.loading = false;
          });
      })
      .catch((error) => {
        console.error(error);
        this.masterSvc
          .notification()
          .errorToast('Something went wrong! Try again later.')
          .then(() => {
            this.loading = false;
          });
      });
  }

  ionViewWillEnter() {
    this.subs.add(
      this.masterSvc.auth().company$.subscribe((company) => {
        if (company) {
          this.company = company;
          this.initFrom();
          this.isLoading = false;
        }
      })
    );
  }
  private initFrom() {
    this.form = this.fb.group({
      name: [this.company.name, Validators.required],
      code: [this.company.code, Validators.required],
      email: [this.company.email, [Validators.required, Validators.email]],
      phone: [this.company.phone, Validators.required],
      address: [this.company.address, Validators.required],
      suburb: [this.company.suburb, Validators.required],
      city: [this.company.city, Validators.required],
      zip: [this.company.zip, Validators.required],
      country: [this.company.country, Validators.required],
      bankName: [this.company.bankName, Validators.required],
      accountNum: [this.company.accountNum, Validators.required],
      branchCode: [this.company.branchCode],
      swiftCode: [this.company.swiftCode],
      currency: [this.company.currency, Validators.required],
      // measurement: ['', Validators.required],
    });
  }
}
