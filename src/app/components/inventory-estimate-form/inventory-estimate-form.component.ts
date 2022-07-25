import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Transport } from 'src/app/models/transport.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-inventory-estimate-form',
  templateUrl: './inventory-estimate-form.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryEstimateFormComponent implements OnInit, OnDestroy {
  @Input() isEdit = false;
  @Input() canUpdate = true;
  @Input() estimate: InventoryEstimate = {
    additionals: [],
    broker: undefined,
    code: '',
    company: undefined,
    customer: undefined,
    date: undefined,
    discount: 0,
    discountPercentage: 0,
    endDate: undefined,
    id: '',
    labour: [],
    transport: [],
    transportProfile: [],
    message: '',
    siteName: '',
    startDate: undefined,
    status: 'pending',
    subtotal: 0,
    tax: 0,
    total: 0,
    extraHire: 0,
    vat: 0,
    poNumber: '',
    woNumber: '',
    siteId: '',
    createdBy: '',
    updatedBy: '',
    acceptedBy: '',
    rejectedBy: '',
    enquiryId: '',
    items: [],
  };
  company: Company;
  user: User;
  rates$: Observable<any>;
  brokers$: Observable<any>;
  transport$: Observable<Transport[]>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  viewAll = true;
  error = false;
  items: InventoryItem[];
  inventoryItems$: Observable<InventoryItem[]>;
  private subs = new Subscription();
  constructor(
    private masterSvc: MasterService,
    private change: ChangeDetectorRef
  ) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  ngOnInit() {
    this.inventoryItems$ = this.masterSvc
      .edit()
      .getCollectionOrdered(
        `company/${this.company.id}/stockItems`,
        'code',
        'asc'
      );
    this.rates$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/rateProfiles`, 'estimateRates');
    this.brokers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/brokers`);
    this.transport$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/transport`);

    this.initEditForm();
    this.form.valueChanges.subscribe(() => {
      this.updateEstimateTotal();
      this.change.detectChanges();
    });
  }

  // START: FORM CRUD
  get labourForms() {
    return this.form.get('labour') as FormArray;
  }
  get transportForms() {
    return this.form.get('transport') as FormArray;
  }
  get additionalForms() {
    return this.form.get('additionals') as FormArray;
  }
  addLabour() {
    const labour = this.masterSvc.fb().group({
      type: ['', Validators.required],
      hours: ['', Validators.required],
      days: ['', Validators.required],
      rate: ['', [Validators.required]],
      qty: ['', Validators.required],
      total: [0],
    });
    this.labourForms.push(labour);
  }
  addTransport() {
    const transport = this.masterSvc.fb().group({
      type: ['', Validators.required],
      hours: ['', Validators.required],
      days: ['', Validators.required],
      qty: ['', Validators.required],
      extraHirePercentage: ['', [Validators.nullValidator, Validators.min(1)]],
      extraHire: ['', [Validators.nullValidator]],
      total: [''],
    });
    this.transportForms.push(transport);
  }
  addAdditional() {
    const additional = this.masterSvc.fb().group({
      rate: ['', Validators.required],
      qty: ['', [Validators.required, Validators.min(1)]],
      name: ['', Validators.required],
      daysStanding: ['', [Validators.required, Validators.min(1)]],
      extraHirePercentage: ['', [Validators.nullValidator, Validators.min(1)]],
      extraHire: ['', [Validators.nullValidator]],
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
  deleteTransport(i: number) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      this.transportForms.removeAt(i);
    });
  }
  // END: FORM CRUD

  arr(field: string) {
    return this.form.get(field) as FormArray;
  }

  arrField(arr: string, index: number, field: string) {
    return this.arr(arr).controls[index].get(field) as FormControl;
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  // END: Helper functions

  // switch broker
  changeBroker() {
    this.labourForms.clear();
    this.addLabour();
  }

  // switch transport
  changeTransport() {
    this.transportForms.clear();
    this.addTransport();
  }

  updateItems(val, item: InventoryItem) {
    item.shipmentQty = +val.detail.value;
    this.estimate.items = this.items;
    this.checkError(item);
  }
  checkError(item: InventoryItem) {
    const totalQty = item.availableQty ? item.availableQty : 0;
    const inUseQty = item.inUseQty ? item.inUseQty : 0;
    const damaged = item.damagedQty ? item.damagedQty : 0;
    const maintenance = item.inMaintenanceQty ? item.inMaintenanceQty : 0;
    const lost = item.lostQty ? item.lostQty : 0;
    const availableQty = totalQty - inUseQty - damaged - maintenance - lost;
    if (item.shipmentQty > availableQty || item.shipmentQty < 0) {
      item.error = true;
      this.error = true;
    } else {
      item.error = false;
      this.error = false;
    }
  }
  //update the totals for a category
  update(type: string, i?: number) {
    switch (type) {
      case 'additionals':
        {
          this.calcAdditionalRate(i);
        }
        break;
      case 'labour':
        {
          this.calcLabourRate(i);
        }
        break;
      case 'transport': {
        this.calcTransportRate(i);
      }
    }
  }
  //Calculate total for a category base on rates
  updateRate(type: string, args?: any, i?: number) {
    switch (type) {
      case 'additionals':
        {
          if (args) {
            this.arrField('additionals', i, 'rate').patchValue({
              ...this.arrField('additionals', i, 'rate').value,
              rate: +args,
            });
          }
          this.calcAdditionalRate(i);
        }
        break;
      case 'labour':
        {
          this.arrField('labour', i, 'rate').patchValue({
            ...this.arrField('labour', i, 'rate').value,
            rate: +args,
          });
          this.calcLabourRate(i);
        }
        break;
      case 'transport': {
        if (args) {
          this.arrField('transport', i, 'type').patchValue({
            ...this.arrField('transport', i, 'type').value,
            rate: +args,
          });
        }
        this.calcTransportRate(i);
      }
    }
  }

  //update the estimate total
  private updateEstimateTotal() {
    if (this.isEdit && this.estimate.status !== 'pending') {
      return;
    }

    let extraHire = 0;
    let labour = 0;
    this.arr('labour').controls.forEach((l) => {
      labour += +l.get('total').value;
    });
    let transport = 0;
    this.arr('transport').controls.forEach((t) => {
      transport += +t.get('total').value;
      extraHire += +t.get('extraHire').value;
    });
    let additionals = 0;
    this.arr('additionals').controls.forEach((a) => {
      additionals += +a.get('total').value;
      extraHire += +a.get('extraHire').value;
    });

    const subtotal = labour + transport + additionals;
    const discount = subtotal * (+this.field('discountPercentage').value / 100);
    const totalAfterDiscount = subtotal - discount;
    const tax = totalAfterDiscount * (this.company.salesTax / 100);
    const vat = totalAfterDiscount * (this.company.vat / 100);
    const total = totalAfterDiscount + tax + vat;
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    const code = `EST${new Date().toLocaleDateString('en', {
      year: '2-digit',
    })}${(this.company.totalEstimates ? this.company.totalEstimates + 1 : 1)
      .toString()
      .padStart(6, '0')}`;

    Object.assign(this.estimate, {
      ...this.form.value,
      date: this.isEdit ? this.estimate.date : new Date(),
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
      code: this.isEdit ? this.estimate.code : code,
      status: this.isEdit ? this.estimate.status : 'pending',
      subtotal,
      discount,
      tax,
      vat,
      total,
      extraHire,
      createdBy: this.isEdit ? this.estimate.createdBy : this.user.id,
      updatedBy: this.user.id,
    });
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
      case 0: {
        ref
          .get('total')
          .setValue(ref.get('qty').value * ref.get('rate').value.rate);
      }
    }
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    ref
      .get('extraHire')
      .setValue(
        +ref.get('total').value * (+ref.get('extraHirePercentage').value / 100)
      );
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
  private calcTransportRate(i: string | number) {
    const ref = this.transportForms.controls[i] as FormControl;

    ref
      .get('total')
      .setValue(
        +(
          ref.get('days').value *
          ref.get('hours').value *
          ref.get('qty').value *
          ref.get('type').value.rate
        ).toFixed(2)
      );
    ref.get('total').setValue(+ref.get('total').value.toFixed(2));
    ref
      .get('extraHire')
      .setValue(
        +ref.get('total').value * (+ref.get('extraHirePercentage').value / 100)
      );
  }
  // END: Calculations

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      customer: [this.estimate.customer, Validators.required],
      message: [this.estimate.message],
      siteName: [this.estimate.siteName, Validators.required],
      startDate: [this.estimate.startDate, Validators.nullValidator],
      endDate: [this.estimate.endDate, Validators.nullValidator],
      discountPercentage: [
        this.estimate.discountPercentage,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      additionals: this.masterSvc.fb().array([]),
      broker: [this.estimate.broker],
      transportProfile: [
        this.estimate.transportProfile ? this.estimate.transportProfile : '',
        Validators.nullValidator,
      ],
      labour: this.masterSvc.fb().array([]),
      transport: this.masterSvc.fb().array([]),
      poNumber: [this.estimate.poNumber],
      woNumber: [this.estimate.woNumber],
      code: [this.estimate.code],
    });

    this.estimate.labour.forEach((l) => {
      const labour = this.masterSvc.fb().group({
        type: [l.type, Validators.required],
        hours: [l.hours, Validators.required],
        days: [l.days, Validators.required],
        rate: [l.rate],
        qty: [l.qty, Validators.required],
        total: [l.total],
      });
      this.labourForms.push(labour);
    });
    this.estimate.transport.forEach((t) => {
      const transport = this.masterSvc.fb().group({
        type: [t.type, Validators.required],
        hours: [t.hours, Validators.required],
        days: [t.days, Validators.required],
        qty: [t.qty, Validators.required],
        extraHirePercentage: [
          t.extraHirePercentage,
          [Validators.nullValidator, Validators.min(1)],
        ],
        extraHire: [t.extraHire, [Validators.nullValidator]],
        total: [t.total],
      });
      this.transportForms.push(transport);
    });
    this.estimate.additionals.forEach((add) => {
      const additional = this.masterSvc.fb().group({
        rate: [add.rate, Validators.required],
        qty: [add.qty, [Validators.required, Validators.min(1)]],
        name: [add.name, Validators.required],
        daysStanding: [
          add.daysStanding,
          [Validators.required, Validators.min(1)],
        ],
        extraHirePercentage: [
          add.extraHirePercentage,
          [Validators.nullValidator, Validators.min(1)],
        ],
        extraHire: [add.extraHire, [Validators.nullValidator]],
        total: [add.total],
      });
      this.additionalForms.push(additional);
    });
    if (this.estimate.status === 'pending') {
      this.subs.add(
        this.inventoryItems$.subscribe((items) => {
          this.estimate.items.forEach((item) => {
            const inventoryItem = items.find((i) => i.id === item.id);
            if (inventoryItem) {
              inventoryItem.shipmentQty = +item.shipmentQty;
            }
          });
          this.items = items;
        })
      );
    } else {
      this.items = this.estimate.items;
    }
    this.isLoading = false;
  }
}
