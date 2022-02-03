import { Component, OnDestroy, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Company } from '../models/company.model';
import { Customer } from '../models/customer.model';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-add-estimate',
  templateUrl: './add-estimate.page.html',
  styleUrls: ['./add-estimate.page.scss'],
})
export class AddEstimatePage implements OnInit, OnDestroy {
  company$: Observable<Company>;
  customers$: Observable<Customer[]>;
  rates$: Observable<any>;
  brokers$: Observable<any>;
  estimateCode$: Observable<any>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  active = 'overview';
  show = '';
  selectedCustomer: Customer;
  estimate: any = {};
  private subs = new Subscription();
  private company: Company;
  constructor(private masterSvc: MasterService, private fb: FormBuilder) {
    this.company$ = this.masterSvc.auth().company$;
    this.customers$ = this.masterSvc.auth().user$.pipe(
      switchMap((user) => {
        if (user) {
          return this.masterSvc
            .edit()
            .getDocsByCompanyId(`company/${user.company}/customers`);
        } else {
          return of(false);
        }
      })
    ) as Observable<Customer[]>;
    this.rates$ = this.masterSvc.auth().user$.pipe(
      switchMap((user) => {
        if (user) {
          return this.masterSvc
            .edit()
            .getDocById(
              `company/${user.company}/rateProfiles`,
              'estimateRates'
            );
        } else {
          return of(false);
        }
      })
    ) as Observable<any>;
    this.brokers$ = this.masterSvc.auth().user$.pipe(
      switchMap((user) => {
        if (user) {
          return this.masterSvc
            .edit()
            .getDocsByCompanyId(`company/${user.company}/brokers`);
        } else {
          return of(false);
        }
      })
    ) as Observable<any>;
    this.subs.add(
      this.company$.subscribe((company) => {
        if (company) {
          this.company = company;
        }
      })
    );
  }

  get labourForms() {
    return this.form.get('labour') as FormArray;
  }
  get additionalForms() {
    return this.form.get('additionals') as FormArray;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  ngOnInit() {
    this.initFrom();
  }

  arr(field: string) {
    return this.form.get(field) as FormArray;
  }

  arrField(arr: string, index: number, field: string) {
    return this.arr(arr).controls[index].get(field) as FormControl;
  }

  changeCustomer(args) {
    this.show = '';
    if (args !== 'add') {
      setTimeout(() => {
        this.show = 'editCustomer';
      }, 1);
    } else {
      this.show = 'addCustomer';
    }
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  newCustomer(args) {
    this.field('customer').setValue({ ...args });
    this.show = 'editCustomer';
  }

  nextView(page: string) {
    this.active = page;
  }

  segmentChanged(ev: any) {
    if (ev.detail.value === 'summary') {
      this.updateEstimate();
      this.active = ev.detail.value;
    } else {
      this.active = ev.detail.value;
    }
  }

  update(type: string, i?: number) {
    switch (type) {
      case 'scaffold':
        {
          this.calcScaffoldRate();
        }
        break;
      case 'boards':
        {
          this.calcBoardRate();
        }
        break;
      case 'hire':
        {
          this.calcHireRate();
        }
        break;
      case 'additionals':
        {
          this.calcAdditionalRate(i);
        }
        break;
      case 'labour': {
        this.calcLabourRate(i);
      }
    }
  }

  updateRate(type: string, args: any, i?: number) {
    switch (type) {
      case 'scaffold':
        {
          this.field('scaffold.rate').patchValue({
            ...this.field('scaffold.rate').value,
            rate: +args,
          });
          this.calcScaffoldRate();
        }
        break;
      case 'boards':
        {
          this.field('boards.rate').patchValue({
            ...this.field('boards.rate').value,
            rate: +args,
          });
          this.calcBoardRate();
        }
        break;
      case 'hire':
        {
          this.field('hire.rate').patchValue({
            ...this.field('hire.rate').value,
            rate: +args,
          });
          this.calcHireRate();
        }
        break;
      case 'additionals':
        {
          this.arrField('additionals', i, 'rate').patchValue({
            ...this.arrField('additionals', i, 'rate').value,
            rate: +args,
          });
          this.calcAdditionalRate(i);
        }
        break;
      case 'labour': {
        this.arrField('labour', i, 'rate').patchValue({
          ...this.arrField('labour', i, 'rate').value,
          rate: +args,
        });
        this.calcLabourRate(i);
      }
    }
  }

  addLabour() {
    const labour = this.fb.group({
      type: ['', Validators.required],
      hours: ['', Validators.required],
      days: ['', Validators.required],
      rate: ['', [Validators.required]],
      qty: ['', Validators.required],
      total: [0],
    });
    this.labourForms.push(labour);
  }

  addAdditional() {
    const additional = this.fb.group({
      rate: ['', Validators.required],
      qty: ['', [Validators.required, Validators.min(1)]],
      name: ['', Validators.required],
      daysStanding: ['', [Validators.required, Validators.min(1)]],
      total: [0],
    });
    this.additionalForms.push(additional);
  }

  deleteAdditional(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.additionalForms.removeAt(i);
    });
  }
  deleteLabour(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.labourForms.removeAt(i);
    });
  }

  createEstimate() {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.loading = true;
      this.updateEstimate();
      this.masterSvc
        .edit()
        .addDocument(
          `company/${this.estimate.company.id}/estimates`,
          this.estimate
        )
        .then(() => {
          this.masterSvc.edit().updateDoc('company', this.company.id, {
            totalEstimates: increment(1),
          });
          this.masterSvc
            .notification()
            .successToast('Estimate created successfully!');
          this.reset();
        })
        .catch(() => {
          this.loading = false;
          this.masterSvc
            .notification()
            .errorToast(
              'Something went wrong creating your estimate, try again!',
              2000
            );
        });
    });
  }

  private reset() {
    this.active = 'overview';
    this.show = '';
    this.selectedCustomer = null;
    this.initFrom();
    this.loading = false;
  }

  private updateEstimate() {
    const scaffold = +this.field('scaffold.total').value;
    const boards = +this.field('boards.total').value;
    const hire = +this.field('hire.total').value;
    let labour = 0;
    this.arr('labour').controls.forEach((c) => {
      labour += +c.get('total').value;
    });
    let additionals = 0;
    this.arr('additionals').controls.forEach((c) => {
      additionals += +c.get('total').value;
    });
    this.field('subtotal').setValue(
      scaffold + boards + hire + labour + additionals
    );
    this.field('tax').setValue(
      this.field('subtotal').value * (this.company.salesTax / 100)
    );
    this.field('vat').setValue(
      this.field('subtotal').value * (this.company.vat / 100)
    );
    this.field('total').setValue(
      this.field('subtotal').value +
        this.field('tax').value +
        this.field('vat').value
    );
    const code = this.company.totalEstimates + 1;
    Object.assign(this.estimate, {
      ...this.form.value,
      date: new Date(),
      company: {
        name: this.company.name,
        address: this.company.address,
        suburb: this.company.suburb,
        city: this.company.city,
        zip: this.company.zip,
        country: this.company.country,
        currency: this.company.currency.symbol,
        phone: this.company.phone,
        email: this.company.email,
        accountNum: this.company.accountNum,
        bankName: this.company.bankName,
        swiftCode: this.company.swiftCode,
        id: this.company.id,
      },
      code: `EST${new Date().toLocaleDateString('en', {
        year: '2-digit',
      })}${code.toString().padStart(6, '0')}`,
      status: 'pending',
    });
  }

  private calcScaffoldRate() {
    switch (this.field('scaffold.rate').value.code) {
      case 1:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.length').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 2:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.width').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 3:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.height').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 4:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.length').value *
              this.field('scaffold.width').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 5:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.length').value *
              this.field('scaffold.height').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 6:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.height').value *
              this.field('scaffold.width').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 7:
        {
          this.field('scaffold.total').setValue(
            this.field('scaffold.length').value *
              this.field('scaffold.width').value *
              this.field('scaffold.height').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 8: {
        this.field('scaffold.total').setValue(
          this.field('scaffold.rate').value.rate
        );
      }
    }
    this.field('scaffold.total').setValue(
      +this.field('scaffold.total').value.toFixed(2)
    );
  }

  private calcBoardRate() {
    switch (this.field('boards.rate').value.code) {
      case 1:
        {
          this.field('boards.total').setValue(
            this.field('boards.length').value *
              this.field('boards.qty').value *
              this.field('boards.rate').value.rate
          );
        }
        break;
      case 2:
        {
          this.field('boards.total').setValue(
            this.field('boards.width').value *
              this.field('boards.qty').value *
              this.field('boards.rate').value.rate
          );
        }
        break;
      case 3:
        {
          this.field('boards.total').setValue(
            this.field('boards.length').value *
              this.field('boards.width').value *
              this.field('boards.qty').value *
              this.field('boards.rate').value.rate
          );
        }
        break;
      case 4: {
        this.field('boards.total').setValue(
          this.field('boards.qty').value * this.field('boards.rate').value.rate
        );
      }
    }
    this.field('boards.total').setValue(
      +this.field('boards.total').value.toFixed(2)
    );
  }

  private calcHireRate() {
    switch (this.field('hire.rate').value.code) {
      case 1:
        {
          this.field('hire.total').setValue(
            this.field('hire.daysStanding').value *
              this.field('hire.rate').value.rate
          );
        }
        break;
      case 2: {
        this.field('hire.total').setValue(this.field('hire.rate').value.rate);
      }
    }
    this.field('hire.total').setValue(
      +this.field('hire.total').value.toFixed(2)
    );
  }

  private calcAdditionalRate(i: string | number) {
    const ref = this.additionalForms.controls[i] as FormControl;

    switch (ref.get('rate').value.code) {
      case 1:
        {
          ref
            .get('total')
            .setValue(
              ref.get('daysStanding').value *
                ref.get('qty').value *
                ref.get('rate').value.rate
            );
        }
        break;
      case 2: {
        ref
          .get('total')
          .setValue(ref.get('qty').value * ref.get('rate').value.rate);
      }
    }
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
  }
  private calcLabourRate(i: string | number) {
    const ref = this.labourForms.controls[i] as FormControl;

    ref
      .get('total')
      .setValue(
        +(
          ref.get('days').value *
          ref.get('hours').value *
          ref.get('qty').value *
          ref.get('rate').value.rate
        ).toFixed(2)
      );
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
      scaffold: this.fb.group({
        rate: ['', Validators.required],
        length: ['', [Validators.required, Validators.min(1)]],
        width: ['', [Validators.required, Validators.min(1)]],
        height: ['', [Validators.required, Validators.min(1)]],
        total: [0],
      }),
      boards: this.fb.group({
        rate: ['', Validators.required],
        length: ['', [Validators.required, Validators.min(1)]],
        width: ['', [Validators.required, Validators.min(1)]],
        qty: ['', [Validators.required, Validators.min(1)]],
        total: [0],
      }),
      hire: this.fb.group({
        rate: ['', Validators.required],
        daysStanding: ['', [Validators.required, Validators.min(1)]],
        total: [0],
      }),
      additionals: this.fb.array([]),
      broker: ['', Validators.required],
      labour: this.fb.array([]),
      subtotal: [0],
      tax: [0],
      vat: [0],
      total: [0],
    });
    this.addAdditional();
    this.addLabour();
  }
}
