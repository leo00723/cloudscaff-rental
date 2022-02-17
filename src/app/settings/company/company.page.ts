import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { Company } from '../../models/company.model';
import { Currencies } from '../../models/currencies.model';
import { MasterService } from '../../services/master.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
})
export class CompanyPage implements OnDestroy, OnInit {
  company: Company = {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    suburb: '',
    city: '',
    zip: '',
    country: '',
    bankName: '',
    accountNum: '',
    branchCode: '',
    swiftCode: '',
    currency: { name: '', symbol: '' },
    measurement: { name: '', symbol: '' },
    mass: { name: '', symbol: '' },
    terminology: { boards: '', hire: '', scaffold: '' },
    totalEstimates: 0,
    vat: 0,
    salesTax: 0,
    totalSites: 0,
    users: [],
    vatNum: '',
    logoUrl: '',
    logoRef: '',
  };
  currencies = new Currencies().currencies;
  measurements = [
    { name: 'Feet', symbol: 'ft' },
    { name: 'Meters', symbol: 'm' },
  ];
  masses = [
    { name: 'Pounds', symbol: 'lb' },
    { name: 'Kilograms', symbol: 'kg' },
  ];
  form: FormGroup;
  loading = false;
  isLoading = true;
  subs = new Subscription();
  constructor(private fb: FormBuilder, private masterSvc: MasterService) {}
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  ngOnInit(): void {
    this.subs.add(
      this.masterSvc.auth().company$.subscribe((company) => {
        if (company) {
          Object.assign(this.company, company);
          this.initFrom();
          this.isLoading = false;
        }
      })
    );
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  updateAddress(address: Address) {
    this.form.patchValue(address);
  }
  save() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;
      Object.assign(this.company, this.form.value);
      this.masterSvc
        .edit()
        .updateDoc('company', this.company.id, this.company)
        .then(() => {
          this.masterSvc.auth().company$.next(this.company);
          this.masterSvc
            .notification()
            .toast('Settings saved successfully', 'success')
            .then(() => {
              this.loading = false;
            });
        })
        .catch((error) => {
          console.error(error);
          this.masterSvc
            .notification()
            .toast('Something went wrong! Try again later.', 'danger')
            .then(() => {
              this.loading = false;
            });
        });
    });
  }

  private initFrom() {
    this.form = this.fb.group({
      name: [this.company.name, Validators.required],
      email: [this.company.email, [Validators.required, Validators.email]],
      phone: [this.company.phone, Validators.required],
      address: [this.company.address, Validators.required],
      suburb: [this.company.suburb],
      city: [this.company.city, Validators.required],
      zip: [this.company.zip, Validators.required],
      country: [this.company.country, Validators.required],
      bankName: [this.company.bankName],
      accountNum: [this.company.accountNum],
      branchCode: [this.company.branchCode],
      swiftCode: [this.company.swiftCode],
      currency: [this.company.currency, Validators.required],
      measurement: [this.company.measurement, Validators.required],
      mass: [this.company.mass, Validators.required],
      salesTax: [
        this.company.salesTax,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      vat: [
        this.company.vat,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      terminology: this.fb.group({
        scaffold: [this.company.terminology.scaffold, Validators.required],
        boards: [this.company.terminology.boards, Validators.required],
        hire: [this.company.terminology.hire, Validators.required],
      }),
      // measurement: ['', Validators.required],
    });
  }
}
