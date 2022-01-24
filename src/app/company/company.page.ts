import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Company } from '../models/company.model';
import { Currencies } from '../models/currencies.model';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
  styleUrls: ['./company.page.scss'],
})
export class CompanyPage implements OnInit, OnDestroy {
  company: Company;
  user$: Observable<any>;
  currencies = new Currencies().currencies;
  form: FormGroup;
  loading = false;
  isLoading = true;
  company$;
  constructor(
    private fb: FormBuilder,
    private masterSvc: MasterService,
    private activatedRoute: ActivatedRoute
  ) {
    this.company$ = this.masterSvc
      .edit()
      .getCompany(this.activatedRoute.snapshot.paramMap.get('id'))
      .subscribe((company) => {
        if (company) {
          this.company = company;
          this.initFrom();
          this.isLoading = false;
        } else {
          this.masterSvc.router().navigate(['/home'], { replaceUrl: true });
        }
      });
  }
  ngOnDestroy(): void {
    this.company$.unsubscribe();
  }
  ngOnInit() {}

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  checkStatus(field: FormControl) {
    return field.invalid && !field.pristine;
  }

  save() {
    this.loading = true;
    Object.assign(this.company, this.form.value);
    this.masterSvc
      .edit()
      .updateCompany(this.company.id, this.company)
      .then(() => {
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
