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
  customers$: Observable<any[]>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  active = 'customer';
  show = '';
  selectedCustomer: Customer;
  constructor(private masterSvc: MasterService, private fb: FormBuilder) {
    this.company$ = this.masterSvc.auth().company$;
    this.customers$ = this.masterSvc.auth().user$.pipe(
      switchMap((user) => {
        if (user) {
          return this.masterSvc
            .edit()
            .getDocsByCompanyId('customers', user.company);
        } else {
          return of(false);
        }
      })
    ) as Observable<any[]>;
  }
  get scaffoldsForms() {
    return this.form.get('scaffolds') as FormArray;
  }

  ngOnInit() {
    this.initFrom();
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  segmentChanged(ev: any) {
    this.active = ev.detail.value;
  }

  nextView(page: string) {
    this.active = page;
  }

  addScaffold() {
    const scaffold = this.fb.group({
      rate: ['', [Validators.required]],
      hirePercentage: [0, [Validators.min(0), Validators.max(100)]],
      length: ['', [Validators.required]],
      width: ['', Validators.required],
      height: ['', Validators.required],
      noPlatforms: ['', Validators.required],
      weeksStanding: ['', Validators.required],
      hireCost: [''],
      totalExHire: [''],
      volume: [''],
      area: [''],
      total: [''],
    });
    this.scaffoldsForms.push(scaffold);
  }

  getScaffold(i: number) {
    return this.scaffoldsForms[i];
  }
  deleteScaffold(i: number) {
    this.scaffoldsForms.removeAt(i);
  }

  updateDimension(i: any) {
    this.calcRate(i);
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

  newCustomer(args) {
    this.field('customer').setValue({ ...args });
    this.show = 'editCustomer';
  }

  private calcRate(i: string | number) {
    const ref = this.scaffoldsForms.controls[i] as FormControl;
    ref
      .get('total')
      .setValue(
        ref.get('length').value *
          ref.get('width').value *
          ref.get('height').value *
          ref.get('rate').value
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
      scaffolds: this.fb.array([]),
    });
    this.addScaffold();
  }
}
