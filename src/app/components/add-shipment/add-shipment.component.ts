import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { increment } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { GetSites } from 'src/app/home/sites/state/sites.actions';
import { SitesState } from 'src/app/home/sites/state/sites.state';
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
  @Input() set value(val: InventoryItem) {
    if (val) {
      Object.assign(this.shipment, val);
      this.initEditForm();
    }
  }
  items: InventoryItem[];
  form: FormGroup;
  shipment: Shipment = {};
  user: User;
  company: Company;
  loading = false;
  viewAll = true;
  private subs = new Subscription();
  @Select() sites$: Observable<Site[]>;
  constructor(private masterSvc: MasterService) {
    this.user = this.masterSvc.store().selectSnapshot(UserState.user);
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    let sites = !!this.masterSvc.store().selectSnapshot(SitesState.sites);
    if (!sites) this.masterSvc.store().dispatch(new GetSites(this.company.id));
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

  close() {
    this.masterSvc.modal().dismiss();
  }
  field(field: string) {
    return this.form.get(field) as FormControl;
  }
  update(val, item: InventoryItem) {
    item.shipmentQty = val.detail.value;
  }

  async createShipment() {
    this.loading = true;
    try {
      let shipment: Shipment = { ...this.form.value };
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
              inventoryItem.shipmentQty = item.shipmentQty;
            }
          });
          this.items = items;
        })
      );
    } else {
      this.items = this.shipment.items;
    }
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
}
