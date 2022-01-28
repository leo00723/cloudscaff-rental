import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Company } from '../models/company.model';
import { Customer } from '../models/customer.model';
import { MasterService } from '../services/master.service';

@Component({
  selector: 'app-add-estimate',
  templateUrl: './add-estimate.page.html',
  styleUrls: ['./add-estimate.page.scss'],
})
export class AddEstimatePage implements OnInit {
  company$: Observable<Company>;
  customers$: Observable<Customer[]>;
  rates$: Observable<any[]>;
  boardRates$: Observable<any>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  active = 'overview';
  show = '';
  selectedCustomer: Customer;
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
            .getDocsByCompanyId(`company/${user.company}/rateProfiles`);
        } else {
          return of(false);
        }
      })
    ) as Observable<any[]>;
    this.boardRates$ = this.masterSvc.auth().user$.pipe(
      switchMap((user) => {
        if (user) {
          return this.masterSvc
            .edit()
            .getDocById(`company/${user.company}/rateProfiles`, 'boards');
        } else {
          return of(false);
        }
      })
    ) as Observable<any>;
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
    this.active = ev.detail.value;
  }

  update(type: string) {
    switch (type) {
      case 'scaffold':
        {
          this.calcScaffoldRate();
        }
        break;
      case 'boards': {
        this.calcBoardRate();
      }
    }
  }
  updateRate(type: string, args) {
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
      case 'boards': {
        this.field('boards.rate').patchValue({
          ...this.field('boards.rate').value,
          rate: +args,
        });
        this.calcBoardRate();
      }
    }
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
            this.field('scaffold.length').value *
              this.field('scaffold.width').value *
              this.field('scaffold.rate').value.rate
          );
        }
        break;
      case 3: {
        this.field('scaffold.total').setValue(
          this.field('scaffold.length').value *
            this.field('scaffold.width').value *
            this.field('scaffold.height').value *
            this.field('scaffold.rate').value.rate
        );
      }
    }
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
      case 3: {
        this.field('boards.total').setValue(
          this.field('boards.length').value *
            this.field('boards.width').value *
            this.field('boards.qty').value *
            this.field('boards.rate').value.rate
        );
      }
    }
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
        total: [''],
      }),
      boards: this.fb.group({
        rate: ['', Validators.required],
        length: ['', [Validators.required, Validators.min(1)]],
        width: ['', [Validators.required, Validators.min(1)]],
        qty: ['', [Validators.required, Validators.min(1)]],
        total: [''],
      }),
      hire: this.fb.group({
        rate: ['', Validators.required],
        daysStanding: ['', [Validators.required, Validators.min(1)]],
        total: [''],
      }),
    });
  }
}
