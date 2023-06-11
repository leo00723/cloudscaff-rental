import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { Company } from 'src/app/models/company.model';
import { Currencies } from 'src/app/models/currencies.model';
import { XeroService } from 'src/app/services/xero.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { MasterService } from '../../../services/master.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
})
export class CompanyPage implements OnDestroy {
  @Input() title = 'Business Settings';
  @Input() showAll = true;
  @Input() onboarding = false;
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
    measurement: { name: 'Meters', symbol: 'm' },
    mass: { name: 'Kilograms', symbol: 'kg' },
    terminology: { boards: 'Boards', hire: 'Hire', scaffold: 'Scaffold' },
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
  page = 0;
  private subs = new Subscription();
  constructor(
    private fb: FormBuilder,
    private masterSvc: MasterService,
    private activatedRoute: ActivatedRoute,
    private xeroService: XeroService
  ) {
    this.init();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
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

  next(i: number) {
    this.page += i;
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
  async connect() {
    this.loading = true;
    const tokens = await this.xeroService.connect();
    if (tokens) {
      console.log(tokens);
    }
    this.loading = false;
  }
  async connectTenant() {
    this.loading = true;
    try {
      const connections = await this.xeroService.getConnections(this.company);
      if (connections[0]) {
        this.company.tokens = {
          ...this.company.tokens,
          tenantID: connections[0].tenantId,
          tenantName: connections[0].tenantName,
        };
        await this.masterSvc
          .edit()
          .updateDoc('company', this.company.id, this.company);
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
  init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;
    setTimeout(async () => {
      if (id) {
        Object.assign(
          this.company,
          this.masterSvc.store().selectSnapshot(CompanyState.company)
        );
        const code = this.activatedRoute.snapshot.queryParamMap.get('code');
        if (code) {
          const tokens = await this.xeroService.connect();
          if (tokens) {
            this.company.tokens = tokens;
            await this.masterSvc
              .edit()
              .updateDoc('company', this.company.id, this.company);
            this.masterSvc
              .notification()
              .toast('Xero connected successfully', 'success');
          }
        }
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
        });
        this.isLoading = false;
      } else {
        this.masterSvc.log(
          '-----------------------try company----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
