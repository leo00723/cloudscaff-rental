import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryItem } from 'src/app/models/inventoryItem.model';
import { Shipment } from 'src/app/models/shipment.model';
import { Site } from 'src/app/models/site.model';
import { User } from 'src/app/models/user.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { UserState } from 'src/app/shared/user/user.state';

@Component({
  selector: 'app-add-shipment',
  templateUrl: './add-shipment.component.html',
})
export class AddShipmentComponent implements OnInit, OnDestroy {
  @Input() isEdit = false;
  @Input() inventoryItems$: Observable<InventoryItem[]>;
  @Input() set value(val: Shipment) {
    if (val) {
      Object.assign(this.shipment, val);
      this.initEditForm();
    }
  }
  items: InventoryItem[];
  itemBackup: InventoryItem[];
  shipment: Shipment = { status: 'pending' };
  form: FormGroup;
  user: User;
  company: Company;
  loading = false;
  viewAll = true;
  error = false;
  private subs = new Subscription();
  sites$: Observable<Site[]>;
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.init();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    if (!this.isEdit) {
      this.subs.add(
        this.inventoryItems$.subscribe((items) => {
          this.items = items;
        })
      );
      this.initForm();
    }
  }

  update(val, item: InventoryItem) {
    item.shipmentQty = +val.detail.value;
    this.checkError(item);
  }

  checkError(item: InventoryItem) {
    // const totalQty = item.availableQty ? item.availableQty : 0;
    // const inUseQty = item.inUseQty ? item.inUseQty : 0;
    // const damaged = item.damagedQty ? item.damagedQty : 0;
    // const maintenance = item.inMaintenanceQty ? item.inMaintenanceQty : 0;
    // const lost = item.lostQty ? item.lostQty : 0;
    // const availableQty = totalQty - inUseQty - damaged - maintenance - lost;
    // if (item.shipmentQty > availableQty || item.shipmentQty < 0) {
    //   item.error = true;
    //   this.error = true;
    // } else {
    //   item.error = false;
    //   this.error = false;
    // }
  }

  createShipment() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        const shipment: Shipment = { ...this.form.value };
        shipment.items = this.items.filter((item) => item.shipmentQty > 0);
        this.company = this.masterSvc
          .store()
          .selectSnapshot(CompanyState.company);

        shipment.code = `SHI${new Date().toLocaleDateString('en', {
          year: '2-digit',
        })}${(this.company.totalShipments ? this.company.totalShipments + 1 : 1)
          .toString()
          .padStart(6, '0')}`;

        await this.masterSvc
          .edit()
          .addDocument(`company/${this.company.id}/shipments`, shipment);
        await this.masterSvc.edit().updateDoc('company', this.company.id, {
          totalShipments: increment(1),
        });

        this.masterSvc
          .notification()
          .toast('Shipment created successfully', 'success');
        this.close();
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong creating shipment. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  updateShipment(status: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.loading = true;
      try {
        Object.assign(this.shipment, this.form.value);
        this.shipment.items = this.items.filter((item) => item.shipmentQty > 0);
        this.shipment.status = status;
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.company.id}/shipments`,
            this.shipment.id,
            this.shipment
          );
        this.masterSvc
          .notification()
          .toast('Shipment updated successfully', 'success');
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.masterSvc
          .notification()
          .toast(
            'Something went wrong updating the shipment. Please try again!',
            'danger'
          );
        this.loading = false;
      }
    });
  }

  close() {
    this.masterSvc.modal().dismiss();
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }

  private initEditForm() {
    this.form = this.masterSvc.fb().group({
      site: [this.shipment.site, Validators.required],
      startDate: [this.shipment.startDate, Validators.required],
      endDate: [this.shipment.endDate, Validators.required],
      company: [this.company, Validators.required],
      status: [this.shipment.status, Validators.required],
      updatedBy: [this.user.id, Validators.required],
    });
    if (this.shipment.status === 'pending') {
      this.subs.add(
        this.inventoryItems$.subscribe((items) => {
          this.shipment.items.forEach((item) => {
            const inventoryItem = items.find((i) => i.id === item.id);
            if (inventoryItem) {
              inventoryItem.shipmentQty = +item.shipmentQty;
            }
          });
          this.items = items;
        })
      );
    } else {
      this.items = this.shipment.items;
    }
  }

  search(event) {
    const val = event.detail.value.toLowerCase() as string;
    this.itemBackup = this.itemBackup ? this.itemBackup : [...this.items];
    this.items = this.itemBackup.filter(
      (item) =>
        item.code.toLowerCase().includes(val) ||
        item.name.toLowerCase().includes(val) ||
        item.category.toLowerCase().includes(val) ||
        !val
    );
  }

  private initForm() {
    this.form = this.masterSvc.fb().group({
      site: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      company: [this.company, Validators.required],
      status: ['pending', Validators.required],
      createdBy: [this.user.id, Validators.required],
    });
  }
  private init() {
    const id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;

    setTimeout(() => {
      if (id) {
        this.sites$ = this.masterSvc
          .edit()
          .getCollectionOrdered(`company/${id}/sites`, 'code', 'desc');
      } else {
        this.masterSvc.log(
          '-----------------------try sites----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
