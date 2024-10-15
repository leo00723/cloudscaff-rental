import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { increment } from 'firebase/firestore';
import cloneDeep from 'lodash/cloneDeep';
import { Observable, Subscription } from 'rxjs';
import { MultiuploaderComponent } from 'src/app/components/multiuploader/multiuploader.component';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { InventoryEstimateRent } from 'src/app/models/inventory-estimate-rent.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';
import { AcceptEstimateRentComponent } from './accept-estimate-rent/accept-estimate-rent.component';

@Component({
  selector: 'app-inventory-estimate-rent',
  templateUrl: './inventory-estimate-rent.component.html',
  styles: [],
})
export class InventoryEstimateRentComponent implements OnInit, OnDestroy {
  @ViewChild(MultiuploaderComponent) uploader: MultiuploaderComponent;
  @Input() set value(val: InventoryEstimateRent) {
    if (val) {
      this.inventoryEstimate = cloneDeep(val);
    }
  }
  @Input() isEdit = false;
  @Input() inventoryItems$: Observable<InventoryItem[]>;

  inventoryEstimate: InventoryEstimateRent = {
    status: 'pending',
    comments: [],
    uploads: [],
  };

  items: InventoryItem[];
  itemBackup: InventoryItem[];
  viewAll = true;
  searching = false;

  user: User;
  company: Company;
  customers$: Observable<Customer[]>;
  form: FormGroup;
  loading = false;
  isLoading = true;
  active = 'overview';
  activeShipment = 1;
  show = '';

  private subs = new Subscription();

  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    this.customers$ = this.masterSvc
      .edit()
      .getCollection(`company/${this.company.id}/customers`);

    if (this.isEdit) {
      this.show = 'editCustomer';
      this.initEditForm();
    } else {
      this.subs.add(
        this.inventoryItems$.subscribe((items) => {
          this.items = items;
        })
      );
      this.initFrom();
      this.isLoading = false;
    }
  }

  // END: FORM CRUD

  // switch customer
  changeCustomer(event) {
    if (event[0] !== 'add') {
      this.field('customer').setValue({ ...event[0] });
      this.show = 'editCustomer';
    } else {
      this.show = 'addCustomer';
    }
  }

  //event for new customer added
  newCustomer(args) {
    this.field('customer').setValue({ ...args });
    this.show = 'editCustomer';
  }

  //event for switching between pages
  segmentChanged(ev: any) {
    if (ev.detail.value === 'summary') {
      this.updateEstimateTotal();
      this.active = ev.detail.value;
    } else {
      this.active = ev.detail.value;
    }
  }

  scaffoldSegmentChanged(ev: any) {
    this.activeShipment = +ev.detail.value;
  }

  //create the estimate
  createEstimate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      try {
        this.loading = true;
        this.updateEstimateTotal();
        await this.upload();
        await this.masterSvc
          .edit()
          .addDocument(
            `company/${this.inventoryEstimate.company.id}/inventoryEstimatesRent`,
            this.inventoryEstimate
          );
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalInventoryRentEstimates: increment(1),
        });
        this.masterSvc
          .notification()
          .toast('Estimate created successfully!', 'success');
        this.close();
      } catch (error) {
        this.loading = false;
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating your estimate, try again!',
            'danger',
            2000
          );
      }
    });
  }

  //update the estimate
  updateEstimate(status: 'pending' | 'accepted' | 'rejected') {
    if (status === 'accepted') {
    } else {
      this.masterSvc.notification().presentAlertConfirm(async () => {
        try {
          this.loading = true;
          this.updateEstimateTotal();
          this.inventoryEstimate.status = status;
          await this.upload();
          await this.masterSvc
            .edit()
            .updateDoc(
              `company/${this.company.id}/inventoryEstimatesRent`,
              this.inventoryEstimate.id,
              this.inventoryEstimate
            );
          this.masterSvc
            .notification()
            .toast('Estimate updated successfully!', 'success');
        } catch (error) {
          this.masterSvc
            .notification()
            .toast(
              'Something went wrong updating your estimate, try again!',
              'danger',
              2000
            );
        } finally {
          this.loading = false;
        }
      });
    }
  }

  //accept estimate
  acceptEstimate() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      //start the acceptance process
      const modal = await this.masterSvc.modal().create({
        component: AcceptEstimateRentComponent,
        componentProps: {
          company: this.company,
          user: this.user,
          estimate: this.inventoryEstimate,
          form: this.form,
        },
        id: 'acceptRentalEstimate',
        cssClass: 'fullscreen',
      });
      return await modal.present();
    });
  }

  updateQty(val, item: InventoryItem) {
    if (isNaN(+val.detail.value)) {
      return (item.error = true);
    } else {
      item.error = false;
      item.shipmentQty = +val.detail.value;
      this.calcItemTotal(item);
    }
  }

  updateRate(val, item: InventoryItem) {
    if (isNaN(+val.detail.value) || +val.detail.value < 0) {
      return (item.error = true);
    } else {
      item.error = false;
      item.hireCost = +val.detail.value;
      this.calcItemTotal(item);
    }
  }

  updateDuration(val, item: InventoryItem) {
    if (isNaN(+val.detail.value)) {
      return (item.error = true);
    } else {
      item.error = false;
      item.duration = +val.detail.value;
      this.calcItemTotal(item);
    }
  }

  private calcItemTotal(item: InventoryItem) {
    item.totalCost = +item.shipmentQty * +item.hireCost * item.duration;
  }

  excludeVAT(args) {
    this.field('excludeVAT').setValue(args.detail.checked);
    this.updateEstimateTotal();
  }

  search(event) {
    this.searching = true;
    const val = event.detail.value.toLowerCase() as string;
    this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
    this.items = this.itemBackup.filter(
      (item) =>
        item?.code?.toString().toLowerCase().includes(val) ||
        item?.name?.toString().toLowerCase().includes(val) ||
        item?.category?.toString().toLowerCase().includes(val) ||
        item?.size?.toString().toLowerCase().includes(val) ||
        item?.location?.toString().toLowerCase().includes(val) ||
        !val
    );
    if (!val) {
      this.searching = false;
    }
  }

  async upload() {
    const newFiles = await this.uploader.startUpload();
    this.inventoryEstimate.uploads.push(...newFiles);
  }

  //update the estimate total
  private updateEstimateTotal() {
    if (this.isEdit && this.inventoryEstimate.status !== 'pending') {
      return;
    }
    this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
    this.inventoryEstimate.items = this.itemBackup.filter(
      (item) => item.shipmentQty > 0
    );
    let subtotal = 0;
    this.inventoryEstimate.items.forEach((item) => {
      subtotal += item.totalCost;
    });

    const discount = subtotal * (+this.field('discountPercentage').value / 100);
    const totalAfterDiscount = subtotal - discount;
    let tax = 0;
    let vat = 0;
    let total = 0;
    if (
      this.field('excludeVAT').value ||
      this.field('customer').value.excludeVAT
    ) {
      total = totalAfterDiscount + tax + vat;
    } else {
      tax = totalAfterDiscount * (this.company.salesTax / 100);
      vat = totalAfterDiscount * (this.company.vat / 100);
      total = totalAfterDiscount + tax + vat;
    }
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);

    const code = this.masterSvc
      .edit()
      .generateDocCode(this.company.totalInventoryRentEstimates, 'IREST');

    let estimateCopy = cloneDeep(this.inventoryEstimate);
    estimateCopy = Object.assign(estimateCopy, {
      ...this.form.value,
      date: this.isEdit ? this.inventoryEstimate.date : new Date(),
      company: this.company,
      code: this.isEdit ? this.inventoryEstimate.code : code,
      status: this.isEdit ? this.inventoryEstimate.status : 'pending',
      items: this.inventoryEstimate.items,
      subtotal,
      discount,
      tax,
      vat,
      total,
      createdBy: this.user.id,
      createdByName: this.user.name,
    });

    this.inventoryEstimate = cloneDeep(estimateCopy);
    if (this.inventoryEstimate.customer) {
      this.inventoryEstimate.customer.rep = this.inventoryEstimate?.repName;
      this.inventoryEstimate.customer.email = this.inventoryEstimate?.repEmail;
      this.inventoryEstimate.customer.phone =
        this.inventoryEstimate?.repContact;
    }
  }

  // END: Calculations

  // START: Functions to initialise the form
  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      siteName: [this.inventoryEstimate.siteName, Validators.required],
      repName: [this.inventoryEstimate.repName],
      repEmail: [this.inventoryEstimate.repEmail],
      repContact: [this.inventoryEstimate.repContact],
      customer: [this.inventoryEstimate.customer, Validators.required],
      scope: [this.inventoryEstimate.scope],
      discountPercentage: [
        this.inventoryEstimate.discountPercentage,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      code: [this.inventoryEstimate.code],
      excludeVAT: [this.inventoryEstimate.excludeVAT],
      poNumber: [this.inventoryEstimate.poNumber],
    });
    if (this.inventoryEstimate.status === 'pending') {
      this.subs.add(
        this.inventoryItems$.subscribe((items) => {
          items.forEach((dbItem) => {
            dbItem.shipmentQty = null;
            delete dbItem.log;
            delete dbItem.crossHire;
          });
          this.inventoryEstimate.items.forEach((item) => {
            const inventoryItem = items.find((i) => i.id === item.id);
            if (inventoryItem) {
              inventoryItem.shipmentQty = +item.shipmentQty;
              inventoryItem.hireCost = +item.hireCost;
              inventoryItem.duration = +item.duration || 1;
              inventoryItem.totalCost =
                +item.shipmentQty * +item.hireCost * (+item.duration || 1);
            }
          });
          this.items = items;
        })
      );
    } else {
      this.items = this.inventoryEstimate.items;
    }
    this.isLoading = false;
  }

  private initFrom() {
    this.form = this.masterSvc.fb().group({
      siteName: ['', Validators.required],
      repName: [''],
      repEmail: [''],
      repContact: [''],
      customer: ['', Validators.required],
      scope: ['', Validators.required],
      discountPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      excludeVAT: [false],
      poNumber: [''],
    });
  }

  // START: Helper functions
  close() {
    this.masterSvc.modal().dismiss();
  }

  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  // END: Helper functions
}
