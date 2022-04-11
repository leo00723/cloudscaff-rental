import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { Company } from 'src/app/models/company.model';
import { Currencies } from 'src/app/models/currencies.model';
import { CompanyState } from 'src/app/shared/company/company.state';
import { MasterService } from '../../../services/master.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
})
export class CompanyPage {
  @Input() title = 'Business Settings';
  @Input() showBack = true;
  @Output() updated = new EventEmitter<boolean>();
  @Select() company$: Observable<Company>;
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
    regNumber: '',
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

  constructor(private fb: FormBuilder, private masterSvc: MasterService) {
    this.init();
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  updateAddress(address: Address) {
    this.form.patchValue(address);
  }
  save() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        Object.assign(this.company, this.form.value);
        this.company.needsSetup = false;
        await this.masterSvc
          .edit()
          .updateDoc('company', this.company.id, this.company);
        this.masterSvc
          .notification()
          .toast('Settings saved successfully', 'success');
        this.loading = false;
        this.updated.emit(true);
      } catch (error) {
        console.error(error);
        this.masterSvc
          .notification()
          .toast('Something went wrong! Try again later.', 'danger');
        this.loading = false;
      }
    });
  }

  async uploadImage(data: any) {
    try {
      this.company.logoUrl = data.url2;
      this.company.logoRef = data.ref;
      await this.masterSvc.edit().updateDoc('company', this.company.id, {
        thumb: data.url1,
        logoUrl: data.url2,
        logoRef: data.ref,
      });
      this.masterSvc
        .notification()
        .toast('Image uploaded successfully', 'success');
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong uploading your image. Please try again!',
          'danger'
        );
    }
  }
  init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(() => {
      if (id) {
        Object.assign(
          this.company,
          this.masterSvc.store().selectSnapshot(CompanyState.company)
        );
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
          regNumber: [this.company.regNumber],
          vatNum: [this.company.vatNum],
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
        this.isLoading = false;
      } else {
        console.log('-----------------------try company----------------------');
        this.init();
      }
    }, 200);
  }
}
